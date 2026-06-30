import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class Event(TimestampedBase):
    """General-purpose internal event stream (document.uploaded, chat.message_sent,
    team.member_added, ...) — drives notifications and analytics. Broader and more
    disposable than AuditLog, which is the compliance-focused subset."""

    __tablename__ = "events"

    org_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    event_type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
