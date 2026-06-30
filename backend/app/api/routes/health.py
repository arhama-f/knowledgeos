from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.core.redis_client import get_redis
from app.db.session import SessionLocal
from app.services.storage import get_s3_client

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    """Liveness — process is up and serving requests. No dependency checks: a
    flaky DB shouldn't make an orchestrator kill and restart a healthy process."""
    return {"status": "ok"}


@router.get("/health/ready")
def readiness(response: Response) -> dict:
    """Readiness — checks the dependencies a request actually needs. Used by the
    load balancer / Docker healthcheck to decide whether to route traffic here."""
    checks: dict[str, str] = {}

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc}"

    try:
        get_redis().ping()
        checks["redis"] = "ok"
    except Exception as exc:
        checks["redis"] = f"error: {exc}"

    try:
        get_s3_client().list_buckets()
        checks["storage"] = "ok"
    except Exception as exc:
        checks["storage"] = f"error: {exc}"

    healthy = all(v == "ok" for v in checks.values())
    response.status_code = status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return {"status": "ok" if healthy else "degraded", "checks": checks}
