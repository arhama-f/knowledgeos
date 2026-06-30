from dataclasses import dataclass

import jwt
from jwt import PyJWKClient

from app.core.config import get_settings

settings = get_settings()
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(f"{settings.clerk_issuer}/.well-known/jwks.json")
    return _jwks_client


@dataclass
class ClerkClaims:
    user_id: str
    org_id: str | None
    org_role: str | None


def verify_clerk_token(token: str) -> ClerkClaims:
    """Verifies a Clerk session JWT against Clerk's JWKS. Raises jwt.PyJWTError on failure."""
    jwks_client = _get_jwks_client()
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=settings.clerk_issuer,
        audience=settings.clerk_audience,
        options={"verify_aud": settings.clerk_audience is not None},
    )
    return ClerkClaims(
        user_id=payload["sub"],
        org_id=payload.get("org_id"),
        org_role=payload.get("org_role"),
    )
