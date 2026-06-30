import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class Project(TimestampedBase):
    """A scoped knowledge base within an organization (e.g. "HR Policies",
    "Engineering Wiki"). Optionally owned by a team; org-wide if team_id is null."""

    __tablename__ = "projects"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    team_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("teams.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
