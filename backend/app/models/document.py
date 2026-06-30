import enum
import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class ProcessingStage(str, enum.Enum):
    """Granular progress within status=processing. Stored as a plain string column
    (not a DB enum type) so adding a stage later is just a code change."""

    OCR = "ocr"
    CLEANING = "cleaning"
    METADATA_EXTRACTION = "metadata_extraction"
    CHUNKING = "chunking"
    EMBEDDING = "embedding"
    KEYWORD_INDEXING = "keyword_indexing"
    HYBRID_INDEXING = "hybrid_indexing"


class Document(TimestampedBase):
    """Stable parent record. status/file_type/size_bytes/chunk_count mirror the
    current_version for fast listing without a join — the source of truth for
    version history lives on DocumentVersion."""

    __tablename__ = "documents"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True, index=True
    )
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String)

    current_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("document_versions.id", use_alter=True), nullable=True
    )

    file_type: Mapped[str] = mapped_column(String)
    size_bytes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String, default=DocumentStatus.PENDING.value, index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)

    processing_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    failed_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str | None] = mapped_column(String, nullable=True)


class DocumentVersion(TimestampedBase):
    __tablename__ = "document_versions"

    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, default=1)
    storage_key: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    size_bytes: Mapped[int] = mapped_column(Integer)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    status: Mapped[str] = mapped_column(String, default=DocumentStatus.PENDING.value, index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)

    processing_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    failed_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    page_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    char_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str | None] = mapped_column(String, nullable=True)


class DocumentChunk(TimestampedBase):
    """A citable unit of text. Vector representations live in Embedding, separately,
    so switching embedding providers re-embeds without re-chunking."""

    __tablename__ = "document_chunks"

    document_version_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("document_versions.id", ondelete="CASCADE"), index=True
    )
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    chunk_index: Mapped[int] = mapped_column(Integer)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_ocr: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
