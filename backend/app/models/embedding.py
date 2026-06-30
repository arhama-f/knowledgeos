import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import get_settings
from app.db.base import TimestampedBase

settings = get_settings()


class Embedding(TimestampedBase):
    """Vector representation of a DocumentChunk under a specific provider/model.
    Kept separate from DocumentChunk so re-embedding (e.g. switching providers)
    never requires re-chunking, and old/new embedding spaces can coexist during
    a migration. The vector column's dimension is fixed at the schema level —
    changing Settings.embedding_dimensions requires a migration."""

    __tablename__ = "embeddings"
    __table_args__ = (
        UniqueConstraint("chunk_id", "provider", "model", name="uq_embedding_chunk_model"),
    )

    chunk_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("document_chunks.id", ondelete="CASCADE"), index=True
    )
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    provider: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
    dimension: Mapped[int] = mapped_column(Integer)
    vector: Mapped[list[float]] = mapped_column(Vector(settings.embedding_dimensions))
