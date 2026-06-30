from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.core.billing import (
    get_or_create_billing_account,
    questions_used_this_month,
    storage_used_bytes,
)
from app.db.session import get_db
from app.schemas.billing import BillingAccountOut

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/me", response_model=BillingAccountOut)
def get_my_billing(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> BillingAccountOut:
    account = get_or_create_billing_account(db, auth.org_id)
    return BillingAccountOut(
        id=account.id,
        plan=account.plan,
        status=account.status,
        billing_cycle=account.billing_cycle,
        storage_quota_bytes=account.storage_quota_bytes,
        ai_quota_monthly_questions=account.ai_quota_monthly_questions,
        storage_used_bytes=storage_used_bytes(db, auth.org_id),
        questions_used_this_month=questions_used_this_month(db, auth.org_id),
        current_period_start=account.current_period_start,
        current_period_end=account.current_period_end,
    )
