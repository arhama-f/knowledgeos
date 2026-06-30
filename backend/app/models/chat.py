import uuid

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class ChatSession(TimestampedBase):
    __tablename__ = "chat_sessions"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("projects.id"), nullable=True, index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    title: Mapped[str | None] = mapped_column(String, nullable=True)


class Message(TimestampedBase):
    __tablename__ = "messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True
    )
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    role: Mapped[str] = mapped_column(String)  # "user" | "assistant" | "system"
    content: Mapped[str] = mapped_column(Text)
    provider: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str | None] = mapped_column(String, nullable=True)


class Citation(TimestampedBase):
    """One row per source cited in an assistant Message — normalized out of a JSON
    blob so citations are queryable (e.g. "which documents get cited most")."""

    __tablename__ = "citations"

    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"), index=True
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("document_chunks.id"), index=True)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    rank: Mapped[int] = mapped_column(Integer)
    similarity: Mapped[float] = mapped_column(Float)


class Feedback(TimestampedBase):
    __tablename__ = "feedback"

    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    rating: Mapped[str] = mapped_column(String)  # "up" | "down"
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
