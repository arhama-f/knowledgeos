import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Depends, HTTPException, Request, status
from redis.exceptions import RedisError
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.api.deps import AuthContext, get_auth_context
from app.core.redis_client import get_redis

logger = logging.getLogger("knowledgeos")

# Fixed-window counter via Redis INCR+EXPIRE — simple, correct, good enough at our
# scale. Switch to a sliding-window/token-bucket if burst-at-window-edge becomes
# a real problem.


def _hit(key: str, limit: int, window_seconds: int) -> int | None:
    """Returns retry_after seconds if the limit is exceeded, else None.

    Fails open on Redis errors — a rate limiter is an abuse-prevention feature,
    not a security boundary, and it must never be why the whole API goes down
    because Redis blipped.
    """
    try:
        client = get_redis()
        bucket = int(time.time() // window_seconds)
        redis_key = f"ratelimit:{key}:{bucket}"
        # redis-py's sync and async clients share one mixin, so stubs type these
        # as Awaitable[Any] | Any even on the sync client used here — genuinely
        # plain ints at runtime.
        count: int = client.incr(redis_key)  # type: ignore[assignment]
        if count == 1:
            client.expire(redis_key, window_seconds)
        if count > limit:
            ttl: int = client.ttl(redis_key)  # type: ignore[assignment]
            return max(ttl, 1)
        return None
    except RedisError:
        logger.warning("rate_limit_check_failed", extra={"path": key})
        return None


def rate_limit(limit: int, window_seconds: int = 60) -> Callable[..., None]:
    """Per-organization rate limit for authenticated, cost-sensitive routes
    (e.g. /ask, document processing) — keeps one org's usage from starving others."""

    def dependency(request: Request, auth: AuthContext = Depends(get_auth_context)) -> None:
        key = f"org:{auth.org_id}:{request.url.path}"
        retry_after = _hit(key, limit, window_seconds)
        if retry_after is not None:
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Rate limit exceeded for this organization. Try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )

    return dependency


class IPRateLimitMiddleware(BaseHTTPMiddleware):
    """Coarse, edge-level limit by client IP — protects unauthenticated/garbage-token
    traffic from hammering the API before it even reaches an auth check."""

    def __init__(self, app: Starlette, limit: int = 300, window_seconds: int = 60) -> None:
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        # Liveness must never depend on Redis — an orchestrator polling /health
        # every few seconds shouldn't be the thing that trips a rate limit, and
        # this path must stay reachable even if Redis itself is the problem.
        if request.url.path == "/health":
            return await call_next(request)

        ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
            request.client.host if request.client else "unknown"
        )
        retry_after = _hit(f"ip:{ip}", self.limit, self.window_seconds)
        if retry_after is not None:
            return JSONResponse(
                {"detail": "Too many requests. Try again shortly."},
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={"Retry-After": str(retry_after)},
            )
        return await call_next(request)
