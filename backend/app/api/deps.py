import uuid
from dataclasses import dataclass

import jwt as pyjwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.api_keys import hash_api_key
from app.core.security import decode_token
from app.db.session import get_db
from app.models.api_key import ApiKey


@dataclass
class AuthContext:
    org_id: uuid.UUID
    auth_method: str  # "jwt" | "api_key"
    user_pk: uuid.UUID | None = None
    org_role: str | None = None

    @property
    def is_admin(self) -> bool:
        if self.auth_method == "api_key":
            return True
        return self.org_role == "admin"


def get_auth_context(request: Request, db: Session = Depends(get_db)) -> AuthContext:
    api_key_header = request.headers.get("x-api-key")
    if api_key_header:
        return _auth_via_api_key(api_key_header, db)

    bearer = request.headers.get("authorization", "")
    token = bearer[7:].strip() if bearer.lower().startswith("bearer ") else None
    if not token:
        token = request.cookies.get("access_token")
    if token:
        return _auth_via_jwt(token)

    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing credentials")


def require_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if not auth.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin role required")
    return auth


def require_session_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    """Stricter — blocks API keys from managing other API keys to prevent
    privilege-escalation via a leaked key minting more keys."""
    if auth.auth_method != "jwt" or not auth.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Organization admin (signed-in) required")
    return auth


def _auth_via_api_key(raw_key: str, db: Session) -> AuthContext:
    key_hash = hash_api_key(raw_key)
    api_key = (
        db.query(ApiKey)
        .filter(
            ApiKey.key_hash == key_hash, ApiKey.revoked_at.is_(None), ApiKey.deleted_at.is_(None)
        )
        .first()
    )
    if not api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
    return AuthContext(org_id=api_key.org_id, auth_method="api_key")


def _auth_via_jwt(token: str) -> AuthContext:
    try:
        claims = decode_token(token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc

    return AuthContext(
        org_id=uuid.UUID(claims["org_id"]),
        auth_method="jwt",
        user_pk=uuid.UUID(claims["sub"]),
        org_role=claims.get("role", "member"),
    )
