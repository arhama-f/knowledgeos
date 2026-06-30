import uuid

from celery import Task
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.file_types import canonical_kind, is_archive
from app.db.session import SessionLocal
from app.models.document import (
    Document,
    DocumentChunk,
    DocumentStatus,
    DocumentVersion,
    ProcessingStage,
)
from app.services.archive import extract_archive_members
from app.services.chunking import chunk_pages
from app.services.cleaning import clean_text
from app.services.extractors.base import ExtractedPage
from app.services.extractors.registry import UnsupportedFileType, get_extractor
from app.services.metadata import extract_metadata
from app.services.pipeline_status import fail, set_stage
from app.services.storage import download_object, upload_object
from app.tasks.celery_app import celery_app
from app.tasks.embedding import embed_and_index_document_version

# Pipeline: Upload (already done by the API route) -> OCR -> Cleaning ->
# Metadata extraction -> Chunking [-> dispatched to the embedding queue ->
# Embedding -> Keyword indexing -> Hybrid search indexing -> Ready]


@celery_app.task(name="app.tasks.ingestion.process_document_version", bind=True, max_retries=2)
def process_document_version(self: Task, document_version_id: str) -> None:
    db = SessionLocal()
    try:
        version = db.get(DocumentVersion, uuid.UUID(document_version_id))
        if version is None:
            return
        document = db.get(Document, version.document_id)
        # documents.deleted_at is a soft delete — the row is never actually
        # removed, so the FK guarantees this exists whenever `version` does.
        assert document is not None

        # Retrying a previously-failed attempt: clear out any partial chunks
        # (and their cascaded embeddings) so this run starts from a clean slate.
        # Safe because a chunk only becomes citable once it has an embedding,
        # and a never-completed document is never searchable, so nothing here
        # can already be referenced by a Citation.
        db.execute(delete(DocumentChunk).where(DocumentChunk.document_version_id == version.id))

        version.status = DocumentStatus.PROCESSING.value
        version.failed_stage = None
        document.status = DocumentStatus.PROCESSING.value
        document.failed_stage = None
        db.commit()

        try:
            content = download_object(version.storage_key)

            if is_archive(document.name):
                _expand_archive(db, document, version, content)
                return

            _ingest_single_file(db, document, version, content)
        except Exception as exc:
            db.rollback()
            version = db.get(DocumentVersion, version.id)
            document = db.get(Document, document.id)
            assert version is not None
            assert document is not None
            fail(db, version, document, str(exc)[:2000])
            raise
    finally:
        db.close()


def _ingest_single_file(
    db: Session, document: Document, version: DocumentVersion, content: bytes
) -> None:
    try:
        extractor = get_extractor(document.name)
    except UnsupportedFileType as exc:
        fail(db, version, document, str(exc), stage=ProcessingStage.OCR)
        return

    set_stage(db, version, document, ProcessingStage.OCR)
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
        fail(
            db,
            version,
            document,
            "No extractable text found in this document.",
            ProcessingStage.CHUNKING,
        )
        return

    for chunk in chunks:
        db.add(
            DocumentChunk(
                document_version_id=version.id,
                org_id=document.org_id,
                content=chunk.content,
                chunk_index=chunk.chunk_index,
                page_number=chunk.page_number,
                is_ocr=chunk.is_ocr,
            )
        )
    db.commit()

    # Embedding (and keyword/hybrid indexing) happen in a separate task on the
    # "embedding" queue — that workload is API-bound, not CPU-bound like the
    # steps above, so it scales independently.
    set_stage(db, version, document, ProcessingStage.EMBEDDING)
    embed_and_index_document_version.delay(str(version.id))


def _expand_archive(
    db: Session, document: Document, version: DocumentVersion, content: bytes
) -> None:
    """A ZIP isn't itself a citable document — it's a container. Each supported
    member becomes its own first-class Document, queued through the normal
    pipeline. The ZIP's own Document/Version just record how many came out of it."""
    members = extract_archive_members(content)

    for member in members:
        child_document = Document(
            org_id=document.org_id,
            project_id=document.project_id,
            uploaded_by=document.uploaded_by,
            name=member.filename,
            file_type=canonical_kind(member.filename) or "txt",
            size_bytes=len(member.content),
            status=DocumentStatus.PENDING.value,
        )
        db.add(child_document)
        db.flush()

        child_storage_key = f"{document.org_id}/{child_document.id}/v1/{member.filename}"
        upload_object(child_storage_key, member.content)

        child_version = DocumentVersion(
            document_id=child_document.id,
            version_number=1,
            storage_key=child_storage_key,
            file_type=child_document.file_type,
            size_bytes=len(member.content),
            uploaded_by=document.uploaded_by,
            status=DocumentStatus.PENDING.value,
        )
        db.add(child_version)
        db.commit()

        process_document_version.delay(str(child_version.id))

    version.status = DocumentStatus.READY.value
    version.chunk_count = 0
    document.status = DocumentStatus.READY.value
    document.chunk_count = 0
    document.error_message = None if members else "Archive contained no supported files."
    db.commit()
