import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt as pyjwt
from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limit import ip_rate_limit
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.slug import slugify
from app.db.session import get_db
from app.models.organization import Organization, OrganizationMember
from app.models.token import PasswordResetToken
from app.models.user import User
from app.services.email import send_password_reset

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _cookie_opts() -> dict:
    settings = get_settings()
    is_prod = settings.environment == "production"
    return dict(httponly=True, secure=is_prod, samesite="none" if is_prod else "lax")


def _set_tokens(response: Response, user: User, org: Organization, role: str) -> None:
    settings = get_settings()
    opts = _cookie_opts()
    access = create_access_token(user.id, org.id, role)
    refresh = create_refresh_token(user.id)
    response.set_cookie(
        "access_token", access, max_age=settings.access_token_expire_minutes * 60, **opts
    )
    response.set_cookie(
        "refresh_token", refresh, max_age=settings.refresh_token_expire_days * 86400, **opts
    )


class RegisterIn(BaseModel):
    name: str = Field(max_length=200)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    org_name: str = Field(min_length=1, max_length=255)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class AuthOut(BaseModel):
    user_id: str
    email: str
    name: str | None
    org_id: str
    org_name: str
    role: str


@router.post("/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(ip_rate_limit(5, 60))])
def register(body: RegisterIn, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    if db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    slug = slugify(body.org_name)
    base = slug
    i = 1
    while db.query(Organization).filter(Organization.slug == slug, Organization.deleted_at.is_(None)).first():
        slug = f"{base}-{i}"
        i += 1

    user = User(email=body.email, name=body.name, password_hash=hash_password(body.password))
    db.add(user)
    db.flush()

    org = Organization(name=body.org_name, slug=slug)
    db.add(org)
    db.flush()

    db.add(OrganizationMember(org_id=org.id, user_id=user.id, role="admin"))
    db.commit()
    db.refresh(user)
    db.refresh(org)

    _set_tokens(response, user, org, "admin")
    return AuthOut(user_id=str(user.id), email=user.email, name=user.name, org_id=str(org.id), org_name=org.name, role="admin")


@router.post("/login", response_model=AuthOut, dependencies=[Depends(ip_rate_limit(10, 60))])
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    user = db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    membership = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == user.id, OrganizationMember.deleted_at.is_(None))
        .first()
    )
    if not membership:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No organization found for this account")

    org = db.query(Organization).filter(Organization.id == membership.org_id, Organization.deleted_at.is_(None)).first()
    if not org:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Organization not found")

    _set_tokens(response, user, org, membership.role)
    return AuthOut(user_id=str(user.id), email=user.email, name=user.name, org_id=str(org.id), org_name=org.name, role=membership.role)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    opts = _cookie_opts()
    response.delete_cookie("access_token", **opts)
    response.delete_cookie("refresh_token", **opts)


@router.post("/refresh", response_model=AuthOut, dependencies=[Depends(ip_rate_limit(20, 60))])
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None),
) -> AuthOut:
    if not refresh_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No refresh token")
    try:
        claims = decode_token(refresh_token)
        if claims.get("type") != "refresh":
            raise ValueError("not a refresh token")
    except (pyjwt.PyJWTError, ValueError) as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token") from exc

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"]), User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    membership = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.user_id == user.id, OrganizationMember.deleted_at.is_(None))
        .first()
    )
    if not membership:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No organization found")

    org = db.query(Organization).filter(Organization.id == membership.org_id, Organization.deleted_at.is_(None)).first()
    if not org:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Organization not found")

    _set_tokens(response, user, org, membership.role)
    return AuthOut(user_id=str(user.id), email=user.email, name=user.name, org_id=str(org.id), org_name=org.name, role=membership.role)


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


class PasswordResetConfirmIn(BaseModel):
    token: str = Field(min_length=1, max_length=64)
    new_password: str = Field(min_length=8, max_length=128)


@router.post("/password-reset/request", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(ip_rate_limit(3, 60))])
async def request_password_reset(
    body: PasswordResetRequestIn,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
) -> None:
    user = db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first()
    if not user:
        return  # Don't reveal whether email exists

    token_value = secrets.token_hex(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.add(PasswordResetToken(user_id=user.id, token=token_value, expires_at=expires))
    db.commit()

    background.add_task(send_password_reset, user.email, token_value)


@router.post("/password-reset/confirm", status_code=status.HTTP_204_NO_CONTENT)
def confirm_password_reset(body: PasswordResetConfirmIn, db: Session = Depends(get_db)) -> None:
    now = datetime.now(timezone.utc)
    record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == body.token,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
        .first()
    )
    if not record:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user = db.query(User).filter(User.id == record.user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "User not found")

    user.password_hash = hash_password(body.new_password)
    record.used_at = now
    # Clean up all expired/used tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == record.user_id,
        (PasswordResetToken.expires_at < now) | (PasswordResetToken.used_at.isnot(None)),
    ).delete()
    db.commit()


class ProfileUpdateIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)


@router.patch("/me", response_model=AuthOut)
def update_me(
    body: ProfileUpdateIn,
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(default=None),
) -> AuthOut:
    if not access_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        claims = decode_token(access_token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"]), User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    org = db.query(Organization).filter(Organization.id == uuid.UUID(claims["org_id"]), Organization.deleted_at.is_(None)).first()
    if not org:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organization not found")

    user.name = body.name
    db.commit()
    db.refresh(user)

    return AuthOut(user_id=str(user.id), email=user.email, name=user.name, org_id=str(org.id), org_name=org.name, role=claims.get("role", "member"))


class ChangePasswordIn(BaseModel):
    current_password: str = Field(max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: ChangePasswordIn,
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(default=None),
) -> None:
    if not access_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        claims = decode_token(access_token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"]), User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    if not user.password_hash or not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")

    user.password_hash = hash_password(body.new_password)
    db.commit()


@router.get("/me", response_model=AuthOut)
def get_me(
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(default=None),
) -> AuthOut:
    if not access_token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        claims = decode_token(access_token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token") from exc

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"]), User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    org = db.query(Organization).filter(Organization.id == uuid.UUID(claims["org_id"]), Organization.deleted_at.is_(None)).first()
    if not org:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Organization not found")

    return AuthOut(user_id=str(user.id), email=user.email, name=user.name, org_id=str(org.id), org_name=org.name, role=claims.get("role", "member"))
