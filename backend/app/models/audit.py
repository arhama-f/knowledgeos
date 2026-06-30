import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class AuditLog(TimestampedBase):
    """Immutable compliance trail: who did what, to which resource, from where.
    Never updated after creation; rows are append-only."""

    __tablename__ = "audit_logs"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String)  # e.g. "document.deleted", "api_key.created"
    resource_type: Mapped[str] = mapped_column(String)
    resource_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True)
