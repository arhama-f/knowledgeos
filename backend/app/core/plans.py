GB = 1024**3

# null quota = unlimited (Enterprise tier). Matches the tiers on the public pricing page.
PLAN_QUOTAS: dict[str, dict[str, int | None]] = {
    "trial": {"storage_quota_bytes": 1 * GB, "ai_quota_monthly_questions": 100},
    "starter": {"storage_quota_bytes": 5 * GB, "ai_quota_monthly_questions": 1_000},
    "business": {"storage_quota_bytes": 50 * GB, "ai_quota_monthly_questions": 10_000},
    "enterprise": {"storage_quota_bytes": None, "ai_quota_monthly_questions": None},
}


def quotas_for_plan(plan: str) -> dict[str, int | None]:
    return PLAN_QUOTAS.get(plan, PLAN_QUOTAS["trial"])
