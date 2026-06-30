import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class UsageRecord(TimestampedBase):
    """Aggregated per-period rollups used for plan-limit checks and billing review.
    Computed from raw events/token_usage, not written to on every request."""

    __tablename__ = "usage_records"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    metric: Mapped[str] = mapped_column(String)  # documents|questions|storage_bytes|tokens
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    quantity: Mapped[float] = mapped_column(Numeric)


class TokenUsage(TimestampedBase):
    """Fine-grained per-request LLM token ledger, for cost attribution. UsageRecord
    rollups are computed from this table."""

    __tablename__ = "token_usage"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    related_type: Mapped[str] = mapped_column(String)  # "message" | "document_version"
    related_id: Mapped[uuid.UUID] = mapped_column(index=True)
    provider: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
