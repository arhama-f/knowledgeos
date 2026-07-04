import uuid

import jwt as pyjwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.config import get_settings
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
from app.models.user import User

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
    name: str
    email: EmailStr
    password: str
    org_name: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    user_id: str
    email: str
    name: str | None
    org_id: str
    org_name: str
    role: str


@router.post("/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
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


@router.post("/login", response_model=AuthOut)
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


@router.post("/refresh", response_model=AuthOut)
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
