import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class Permission(TimestampedBase):
    """Fine-grained ACL on top of org-level roles — grants a user or team a role on
    a specific resource (e.g. a Project). subject/resource are polymorphic by design
    so this one table covers every resource type without a join table per pair."""

    __tablename__ = "permissions"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    subject_type: Mapped[str] = mapped_column(String)  # "user" | "team"
    subject_id: Mapped[uuid.UUID] = mapped_column(index=True)
    resource_type: Mapped[str] = mapped_column(String)  # "project" | "document"
    resource_id: Mapped[uuid.UUID] = mapped_column(index=True)
    role: Mapped[str] = mapped_column(String)  # "viewer" | "editor" | "admin"
    granted_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
