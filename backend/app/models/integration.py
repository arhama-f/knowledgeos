import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class Integration(TimestampedBase):
    __tablename__ = "integrations"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    type: Mapped[str] = mapped_column(String)  # slack|google_drive|notion|sharepoint|teams
    status: Mapped[str] = mapped_column(String, default="disconnected")
    # connected | disconnected | error
    config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    connected_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
