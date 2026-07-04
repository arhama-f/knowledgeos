from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class User(TimestampedBase):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    # Kept nullable for any rows that predate the self-hosted auth migration.
    clerk_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
