import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.core.billing import QuotaExceeded, ensure_storage_quota
from app.core.file_types import canonical_kind
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.document import Document, DocumentChunk, DocumentStatus, DocumentVersion
from app.schemas.document import (
    ChunkPreview,
    DocumentOut,
    DocumentUploadRequest,
    DocumentUploadResponse,
)
from app.services.storage import generate_presigned_download_url, generate_presigned_upload_url
from app.tasks.ingestion import process_document_version

router = APIRouter(prefix="/documents", tags=["documents"])

MAX_RETRY_COUNT = 5


@router.get("", response_model=list[DocumentOut])
def list_documents(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[Document]:
    stmt = (
        select(Document)
        .where(Document.org_id == auth.org_id, Document.deleted_at.is_(None))
        .order_by(Document.created_at.desc())
    )
    return list(db.execute(stmt).scalars())


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

    storage_key = f"{auth.org_id}/{document.id}/v1/{body.filename}"
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


@router.post("/{document_id}/process", status_code=status.HTTP_202_ACCEPTED)
def trigger_processing(
    document_id: uuid.UUID,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    _get_owned_document(db, document_id, auth.org_id)
    version = _latest_version(db, document_id)
    process_document_version.delay(str(version.id))
    return {"status": "queued"}


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

    version.retry_count += 1
    version.status = DocumentStatus.PENDING.value
    version.error_message = None
    document.retry_count = version.retry_count
    document.status = DocumentStatus.PENDING.value
    document.error_message = None
    db.commit()

    process_document_version.delay(str(version.id))
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "document.retried",
        "document",
        document_id,
        metadata={"retry_count": version.retry_count},
        request=request,
    )
    return {"status": "queued"}


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
