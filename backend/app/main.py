import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger("knowledgeos")

from app.api.routes import (
    api_keys,
    ask,
    audit_logs,
    auth,
    billing,
    departments,
    documents,
    health,
    members,
    organizations,
    permissions,
    projects,
    teams,
)
from app.core.config import get_settings
from app.core.logging import RequestLoggingMiddleware, setup_logging
from app.core.rate_limit import IPRateLimitMiddleware

settings = get_settings()
setup_logging()

if settings.sentry_dsn:
    import sentry_sdk

    sentry_sdk.init(
        dsn=settings.sentry_dsn, environment=settings.environment, traces_sample_rate=0.1
    )

is_production = settings.environment == "production"

app = FastAPI(
    title="KnowledgeOS API",
    version="0.1.0",
    # Don't expose interactive API docs publicly in production.
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(IPRateLimitMiddleware, limit=300, window_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"],
    allow_headers=["Authorization", "Content-Type", "X-Api-Key"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(documents.router, prefix="/api")
app.include_router(ask.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(api_keys.router, prefix="/api")
app.include_router(teams.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(permissions.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(billing.router, prefix="/api")

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error", extra={"path": str(request.url.path)})
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


Instrumentator().instrument(app)
