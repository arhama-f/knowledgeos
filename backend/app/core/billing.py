import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.plans import quotas_for_plan
from app.models.billing import BillingAccount
from app.models.chat import Message
from app.models.document import Document


class QuotaExceeded(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def get_or_create_billing_account(db: Session, org_id: uuid.UUID) -> BillingAccount:
    account = db.query(BillingAccount).filter(BillingAccount.org_id == org_id).first()
    if account:
        return account
    account = BillingAccount(
        org_id=org_id, plan="trial", status="trialing", **quotas_for_plan("trial")
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def storage_used_bytes(db: Session, org_id: uuid.UUID) -> int:
    total = db.execute(
        select(func.coalesce(func.sum(Document.size_bytes), 0)).where(
            Document.org_id == org_id, Document.deleted_at.is_(None)
        )
    ).scalar_one()
    return int(total)


def questions_used_this_month(db: Session, org_id: uuid.UUID) -> int:
    period_start = datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total = db.execute(
        select(func.count(Message.id)).where(
            Message.org_id == org_id,
            Message.role == "user",
            Message.deleted_at.is_(None),
            Message.created_at >= period_start,
        )
    ).scalar_one()
    return int(total)


def ensure_storage_quota(db: Session, org_id: uuid.UUID, additional_bytes: int) -> None:
    account = get_or_create_billing_account(db, org_id)
    if account.storage_quota_bytes is None:
        return
    used = storage_used_bytes(db, org_id)
    if used + additional_bytes > account.storage_quota_bytes:
        raise QuotaExceeded(
            f"Storage quota exceeded ({used / 1e9:.2f}GB of "
            f"{account.storage_quota_bytes / 1e9:.2f}GB used)."
        )


def ensure_ai_quota(db: Session, org_id: uuid.UUID) -> None:
    account = get_or_create_billing_account(db, org_id)
    if account.ai_quota_monthly_questions is None:
        return
    used = questions_used_this_month(db, org_id)
    if used >= account.ai_quota_monthly_questions:
        raise QuotaExceeded(
            f"Monthly AI usage quota exceeded ({used} of "
            f"{account.ai_quota_monthly_questions} questions used)."
        )
