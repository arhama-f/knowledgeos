import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class ApiKey(TimestampedBase):
    __tablename__ = "api_keys"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    key_prefix: Mapped[str] = mapped_column(String, index=True)  # shown in UI
    key_hash: Mapped[str] = mapped_column(String, unique=True, index=True)  # sha256 of full key
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
