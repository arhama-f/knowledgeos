from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.routes import (
    api_keys,
    ask,
    audit_logs,
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
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
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

Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)
