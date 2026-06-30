import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import TimestampedBase


class BillingAccount(TimestampedBase):
    """One per organization. Wise is a manual bank-transfer flow, not a live
    payment-processor subscription, so this is a status record an admin updates
    after confirming a transfer — not something Wise calls back into."""

    __tablename__ = "billing_accounts"

    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), unique=True)
    plan: Mapped[str] = mapped_column(String, default="trial")
    status: Mapped[str] = mapped_column(String, default="trialing")
    # trialing | active | past_due | canceled
    billing_cycle: Mapped[str] = mapped_column(String, default="annual")  # monthly | annual
    seats: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_period_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    current_period_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Quotas — null means unlimited (Enterprise tier). storage_quota_bytes is
    # BigInteger: a plain 32-bit Integer caps out at ~2.1GB, well below even the
    # Starter plan's 5GB quota.
    storage_quota_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    ai_quota_monthly_questions: Mapped[int | None] = mapped_column(Integer, nullable=True)


class Invoice(TimestampedBase):
    __tablename__ = "invoices"

    billing_account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("billing_accounts.id"), index=True
    )
    amount_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String, default="GBP")
    status: Mapped[str] = mapped_column(String, default="pending")  # pending|paid|overdue|void
    reference_code: Mapped[str] = mapped_column(String, unique=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
