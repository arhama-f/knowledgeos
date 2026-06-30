import uuid
from datetime import datetime

from pydantic import BaseModel


class BillingAccountOut(BaseModel):
    id: uuid.UUID
    plan: str
    status: str
    billing_cycle: str
    storage_quota_bytes: int | None
    ai_quota_monthly_questions: int | None
    storage_used_bytes: int
    questions_used_this_month: int
    current_period_start: datetime | None
    current_period_end: datetime | None
