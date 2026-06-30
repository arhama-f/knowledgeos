import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class Department(TimestampedBase):
    """Top of the org chart (e.g. "Engineering", "Sales"). Teams optionally belong
    to a department; departments are org-wide groupings, not resource owners
    themselves (Projects are owned by Teams, not Departments, directly)."""

    __tablename__ = "departments"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
