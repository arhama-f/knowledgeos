import asyncio
import uuid

from celery import Task
from sqlalchemy import func, select

from app.ai.registry import get_embedding_provider
from app.db.session import SessionLocal
from app.models.document import (
    Document,
    DocumentChunk,
    DocumentStatus,
    DocumentVersion,
    ProcessingStage,
)
from app.models.embedding import Embedding
from app.models.organization import Organization
from app.services.pipeline_status import fail, set_stage
from app.tasks.celery_app import celery_app

COMMIT_BATCH_SIZE = 200


@celery_app.task(
    name="app.tasks.embedding.embed_and_index_document_version", bind=True, max_retries=2
)
def embed_and_index_document_version(self: Task, document_version_id: str) -> None:
    db = SessionLocal()
    try:
        version = db.get(DocumentVersion, uuid.UUID(document_version_id))
        if version is None:
            return
        document = db.get(Document, version.document_id)
        # documents.deleted_at is a soft delete — the row is never actually
        # removed, so the FK guarantees this exists whenever `version` does.
        assert document is not None

        try:
            set_stage(db, version, document, ProcessingStage.EMBEDDING)
            org = db.get(Organization, document.org_id)
            assert org is not None

            # Idempotent: only embeds chunks that don't already have one, so a
            # retry of just this task (e.g. after a transient embedding API
            # error) resumes instead of re-embedding everything from scratch.
            pending_stmt = (
                select(DocumentChunk)
                .outerjoin(Embedding, Embedding.chunk_id == DocumentChunk.id)
                .where(DocumentChunk.document_version_id == version.id, Embedding.id.is_(None))
                .order_by(DocumentChunk.chunk_index)
            )
            pending_chunks = list(db.execute(pending_stmt).scalars())

            if pending_chunks:
                embedding_provider_name = org.resolved_embedding_provider()
                embedding_model = org.resolved_embedding_model()
                embedding_provider = get_embedding_provider(embedding_provider_name)
                vectors = asyncio.run(
                    embedding_provider.embed([c.content for c in pending_chunks], embedding_model)
                )
                for i, (chunk, vector) in enumerate(
                    zip(pending_chunks, vectors, strict=True), start=1
                ):
                    db.add(
                        Embedding(
                            chunk_id=chunk.id,
                            org_id=document.org_id,
                            provider=embedding_provider_name,
                            model=embedding_model,
                            dimension=len(vector),
                            vector=vector,
                        )
                    )
                    if i % COMMIT_BATCH_SIZE == 0:
                        db.commit()
                db.commit()

            # Keyword indexing: document_chunks.search_vector is a Postgres
            # GENERATED column populated automatically on insert — nothing to
            # compute here; this stage just marks that step of the pipeline.
            set_stage(db, version, document, ProcessingStage.KEYWORD_INDEXING)

            # Hybrid search indexing: both the vector (HNSW) and keyword (GIN)
            # indexes now cover every chunk, so retrieval can query both.
            set_stage(db, version, document, ProcessingStage.HYBRID_INDEXING)

            total = db.execute(
                select(func.count())
                .select_from(DocumentChunk)
                .where(DocumentChunk.document_version_id == version.id)
            ).scalar_one()

            version.status = DocumentStatus.READY.value
            version.processing_stage = None
            version.chunk_count = total
            document.current_version_id = version.id
            document.status = DocumentStatus.READY.value
            document.processing_stage = None
            document.chunk_count = total
            document.error_message = None
            db.commit()
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
