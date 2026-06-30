from celery import Celery

from app.core.config import get_settings

settings = get_settings()

# `include` matters here, not just for the web process (which already imports
# these via the API routes) — a standalone `celery worker` process only loads
# whatever this module pulls in, so without it the worker registers zero tasks
# and every `.delay()` call fails with "Received unregistered task".
celery_app = Celery(
    "knowledgeos",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.ingestion", "app.tasks.embedding"],
)
celery_app.conf.task_routes = {
    # CPU-bound (OCR, cleaning, chunking) — scale with worker count, not API limits.
    "app.tasks.ingestion.*": {"queue": "ingestion"},
    # API-bound (embedding calls) — scale/concurrency-tune independently of ingestion.
    "app.tasks.embedding.*": {"queue": "embedding"},
}
