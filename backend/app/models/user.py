from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class User(TimestampedBase):
    """Global identity, mirrored lazily from Clerk. One row per Clerk user regardless
    of how many organizations they belong to."""

    __tablename__ = "users"

    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
