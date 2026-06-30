import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import get_settings
from app.db.base import TimestampedBase

settings = get_settings()


class Organization(TimestampedBase):
    __tablename__ = "organizations"

    clerk_org_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    plan: Mapped[str] = mapped_column(String, default="trial")

    # Per-org AI provider/model override; falls back to settings.default_* when null.
    # Never hardcode a provider/model in business logic — always resolve through these.
    llm_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_model: Mapped[str | None] = mapped_column(String, nullable=True)
    embedding_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    embedding_model: Mapped[str | None] = mapped_column(String, nullable=True)

    # Branding
    logo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    primary_color: Mapped[str | None] = mapped_column(String, nullable=True)  # hex, e.g. "#4F46E5"
    website_url: Mapped[str | None] = mapped_column(String, nullable=True)

    def resolved_llm_provider(self) -> str:
        return self.llm_provider or settings.default_llm_provider

    def resolved_llm_model(self) -> str:
        return self.llm_model or settings.default_llm_model

    def resolved_embedding_provider(self) -> str:
        return self.embedding_provider or settings.default_embedding_provider

    def resolved_embedding_model(self) -> str:
        return self.embedding_model or settings.default_embedding_model


class OrganizationMember(TimestampedBase):
    """Caches Clerk org membership locally so other tables have a stable FK target
    and so role lookups don't require a Clerk API round-trip on every request."""

    __tablename__ = "organization_members"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String, default="member")  # "admin" | "member"
