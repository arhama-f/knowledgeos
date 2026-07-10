import uuid
from datetime import UTC, datetime, timedelta

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def _make_token(payload: dict, expire: datetime) -> str:
    settings = get_settings()
    return jwt.encode(
        {**payload, "exp": expire, "iat": datetime.now(UTC)},
        settings.secret_key,
        algorithm="HS256",
    )


def create_access_token(user_id: uuid.UUID, org_id: uuid.UUID, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    return _make_token({"sub": str(user_id), "org_id": str(org_id), "role": role}, expire)


def create_refresh_token(user_id: uuid.UUID) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    return _make_token({"sub": str(user_id), "type": "refresh"}, expire)


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
