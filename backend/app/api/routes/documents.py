import uuid
from datetime import UTC, datetime

from pathlib import Path as FilePath

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.registry import get_embedding_provider
from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.core.billing import QuotaExceeded, ensure_storage_quota
from app.core.file_types import canonical_kind
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.document import Document, DocumentChunk, DocumentStatus, DocumentVersion, ProcessingStage
from app.models.embedding import Embedding
from app.models.organization import Organization
from app.schemas.document import (
    ChunkPreview,
    DocumentOut,
    DocumentUploadRequest,
    DocumentUploadResponse,
)
from app.services.chunking import chunk_pages
from app.services.cleaning import clean_text
from app.services.extractors.base import ExtractedPage
from app.services.extractors.registry import UnsupportedFileType, get_extractor
from app.services.metadata import extract_metadata
from app.services.pipeline_status import fail, set_stage
from app.services.storage import generate_presigned_download_url, generate_presigned_upload_url

router = APIRouter(prefix="/documents", tags=["documents"])

MAX_RETRY_COUNT = 5
MAX_UPLOAD_BYTES = 4 * 1024 * 1024  # 4 MB — stay under Vercel's 4.5 MB body limit


@router.get("", response_model=list[DocumentOut])
def list_documents(
    skip: int = Query(default=0, ge=0, le=10000),
    limit: int = Query(default=50, ge=1, le=200),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[Document]:
    stmt = (
        select(Document)
        .where(Document.org_id == auth.org_id, Document.deleted_at.is_(None))
        .order_by(Document.created_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
    )
    return list(db.execute(stmt).scalars())


@router.post("/upload", response_model=DocumentOut, dependencies=[Depends(rate_limit(30))])
async def upload_document(
    file: UploadFile = File(...),
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Document:
    """Direct upload + synchronous processing — no S3 or Celery required."""
    file_kind = canonical_kind(file.filename or "")
    if file_kind is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Unsupported file type for '{file.filename}'.",
        )

    content = await file.read()
    size = len(content)

    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File exceeds the 4 MB limit ({size / 1024 / 1024:.1f} MB). "
            "Split large documents or contact support for higher limits.",
        )

    try:
        ensure_storage_quota(db, auth.org_id, size)
    except QuotaExceeded as exc:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, exc.message) from exc

    document = Document(
        org_id=auth.org_id,
        uploaded_by=auth.user_pk,
        name=file.filename,
        file_type=file_kind,
        size_bytes=size,
        status=DocumentStatus.PROCESSING.value,
    )
    db.add(document)
    db.flush()

    safe_name = FilePath(file.filename or "file").name
    storage_key = f"{auth.org_id}/{document.id}/v1/{safe_name}"
    version = DocumentVersion(
        document_id=document.id,
        version_number=1,
        storage_key=storage_key,
        file_type=file_kind,
        size_bytes=size,
        uploaded_by=auth.user_pk,
        status=DocumentStatus.PROCESSING.value,
    )
    db.add(version)
    db.commit()

    try:
        await _process_sync(db, document, version, content)
    except Exception as exc:
        fail(db, version, document, str(exc)[:2000])

    db.refresh(document)
    return document


async def _process_sync(
    db: Session, document: Document, version: DocumentVersion, content: bytes
) -> None:
    set_stage(db, version, document, ProcessingStage.OCR)
    try:
        extractor = get_extractor(document.name)
    except UnsupportedFileType as exc:
        fail(db, version, document, str(exc), stage=ProcessingStage.OCR)
        return

    pages = extractor.extract(content)

    set_stage(db, version, document, ProcessingStage.CLEANING)
    pages = [
        ExtractedPage(page_number=p.page_number, text=clean_text(p.text), is_ocr=p.is_ocr)
        for p in pages
    ]

    set_stage(db, version, document, ProcessingStage.METADATA_EXTRACTION)
    meta = extract_metadata(pages)
    for target in (version, document):
        target.page_count = meta.page_count
        target.word_count = meta.word_count
        target.language = meta.language
    version.char_count = meta.char_count

    set_stage(db, version, document, ProcessingStage.CHUNKING)
    chunks = chunk_pages(pages)
    if not chunks:
        fail(db, version, document, "No extractable text found.", ProcessingStage.CHUNKING)
        return

    chunk_records: list[DocumentChunk] = []
    for chunk in chunks:
        rec = DocumentChunk(
            document_version_id=version.id,
            org_id=document.org_id,
            content=chunk.content,
            chunk_index=chunk.chunk_index,
            page_number=chunk.page_number,
            is_ocr=chunk.is_ocr,
        )
        db.add(rec)
        chunk_records.append(rec)
    db.commit()
    for rec in chunk_records:
        db.refresh(rec)

    set_stage(db, version, document, ProcessingStage.EMBEDDING)
    org = db.get(Organization, document.org_id)
    assert org is not None
    provider_name = org.resolved_embedding_provider()
    model = org.resolved_embedding_model()
    embedding_provider = get_embedding_provider(provider_name)
    vectors = await embedding_provider.embed([c.content for c in chunk_records], model)

    for rec, vector in zip(chunk_records, vectors, strict=True):
        db.add(Embedding(
            chunk_id=rec.id,
            org_id=document.org_id,
            provider=provider_name,
            model=model,
            dimension=len(vector),
            vector=vector,
        ))
    db.commit()

    total = len(chunk_records)
    version.status = DocumentStatus.READY.value
    version.processing_stage = None
    version.chunk_count = total
    document.current_version_id = version.id
    document.status = DocumentStatus.READY.value
    document.processing_stage = None
    document.chunk_count = total
    document.error_message = None
    db.commit()


@router.post(
    "/upload-url", response_model=DocumentUploadResponse, dependencies=[Depends(rate_limit(30))]
)
def create_upload_url(
    body: DocumentUploadRequest,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> DocumentUploadResponse:
    file_kind = canonical_kind(body.filename)
    if file_kind is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Unsupported file type for '{body.filename}'. Supported: PDF, DOCX, TXT, "
            "Markdown, CSV, Excel, PowerPoint, images, .eml, and .zip archives of these.",
        )

    try:
        ensure_storage_quota(db, auth.org_id, body.size_bytes)
    except QuotaExceeded as exc:
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, exc.message) from exc

    document = Document(
        org_id=auth.org_id,
        uploaded_by=auth.user_pk,
        name=body.filename,
        file_type=file_kind,
        size_bytes=body.size_bytes,
        status=DocumentStatus.PENDING.value,
    )
    db.add(document)
    db.flush()

    storage_key = f"{auth.org_id}/{document.id}/v1/{FilePath(body.filename).name}"
    version = DocumentVersion(
        document_id=document.id,
        version_number=1,
        storage_key=storage_key,
        file_type=file_kind,
        size_bytes=body.size_bytes,
        uploaded_by=auth.user_pk,
        status=DocumentStatus.PENDING.value,
    )
    db.add(version)
    db.commit()
    db.refresh(document)

    upload_url = generate_presigned_upload_url(storage_key, body.content_type)
    return DocumentUploadResponse(
        document=DocumentOut.model_validate(document), upload_url=upload_url
    )


@router.post("/{document_id}/process", status_code=status.HTTP_400_BAD_REQUEST)
def trigger_processing(
    document_id: uuid.UUID,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    raise HTTPException(
        status.HTTP_400_BAD_REQUEST,
        "Background processing is not available. Please delete and re-upload the document.",
    )


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> Document:
    return _get_owned_document(db, document_id, auth.org_id)


@router.post("/{document_id}/retry", status_code=status.HTTP_202_ACCEPTED)
def retry_document(
    document_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    document = _get_owned_document(db, document_id, auth.org_id)
    if document.status != DocumentStatus.FAILED.value:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only failed documents can be retried")

    version = _latest_version(db, document_id)
    if version.retry_count >= MAX_RETRY_COUNT:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"This document has already been retried {MAX_RETRY_COUNT} times — "
            "check the error and consider re-uploading instead.",
        )

    raise HTTPException(
        status.HTTP_400_BAD_REQUEST,
        "Retry is not supported in this deployment. Please delete and re-upload the document.",
    )


@router.get("/{document_id}/download-url")
def get_download_url(
    document_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict:
    """Original files are never deleted after extraction — this lets users verify
    OCR'd/extracted text against the source (scans, contracts, receipts, forms)."""
    document = _get_owned_document(db, document_id, auth.org_id)
    version = _latest_version(db, document_id)
    url = generate_presigned_download_url(version.storage_key, filename=document.name)
    return {"url": url}


@router.get("/{document_id}/chunks", response_model=list[ChunkPreview])
def list_chunks(
    document_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[DocumentChunk]:
    _get_owned_document(db, document_id, auth.org_id)
    version = _latest_version(db, document_id)
    stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.document_version_id == version.id, DocumentChunk.deleted_at.is_(None))
        .order_by(DocumentChunk.chunk_index)
    )
    return list(db.execute(stmt).scalars())


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    document = _get_owned_document(db, document_id, auth.org_id)
    document.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "document.deleted",
        "document",
        document_id,
        metadata={"name": document.name},
        request=request,
    )


def _get_owned_document(db: Session, document_id: uuid.UUID, org_id: uuid.UUID) -> Document:
    document = db.get(Document, document_id)
    if document is None or document.org_id != org_id or document.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")
    return document


def _latest_version(db: Session, document_id: uuid.UUID) -> DocumentVersion:
    stmt = (
        select(DocumentVersion)
        .where(DocumentVersion.document_id == document_id, DocumentVersion.deleted_at.is_(None))
        .order_by(DocumentVersion.version_number.desc())
        .limit(1)
    )
    version = db.execute(stmt).scalars().first()
    if version is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document version not found")
    return version
