import uuid
from dataclasses import dataclass

import jwt as pyjwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.api_keys import hash_api_key
from app.core.clerk_api import fetch_clerk_organization, fetch_clerk_user
from app.core.clerk_auth import verify_clerk_token
from app.db.session import get_db
from app.models.api_key import ApiKey
from app.models.organization import Organization, OrganizationMember
from app.models.user import User


@dataclass
class AuthContext:
    org_id: uuid.UUID
    auth_method: str  # "clerk" | "api_key"
    user_pk: uuid.UUID | None = None  # local users.id — FK target for actor columns
    clerk_user_id: str | None = None  # external Clerk id, for display/audit only
    org_role: str | None = None

    @property
    def is_admin(self) -> bool:
        # API keys are provisioned by an admin already; Clerk roles arrive as
        # "org:admin"/"org:member" (namespaced) or legacy "admin"/"member".
        if self.auth_method == "api_key":
            return True
        if not self.org_role:
            return False
        return self.org_role.split(":")[-1] == "admin"


def get_auth_context(request: Request, db: Session = Depends(get_db)) -> AuthContext:
    api_key_header = request.headers.get("x-api-key")
    if api_key_header:
        return _auth_via_api_key(api_key_header, db)

    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        return _auth_via_clerk(auth_header.split(" ", 1)[1], db)

    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing credentials")


def require_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if not auth.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin role required")
    return auth


def require_clerk_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    """Stricter than require_admin — blocks API keys from managing other API keys
    (no privilege-escalation chain via a leaked key minting more keys)."""
    if auth.auth_method != "clerk" or not auth.is_admin:
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


def _auth_via_clerk(token: str, db: Session) -> AuthContext:
    try:
        claims = verify_clerk_token(token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session token") from exc

    if not claims.org_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No active organization selected")

    org = _get_or_provision_organization(claims.org_id, db)
    user = _get_or_provision_user(claims.user_id, db)
    _ensure_membership(org.id, user.id, claims.org_role, db)

    return AuthContext(
        org_id=org.id,
        auth_method="clerk",
        user_pk=user.id,
        clerk_user_id=claims.user_id,
        org_role=claims.org_role,
    )


def _get_or_provision_organization(clerk_org_id: str, db: Session) -> Organization:
    org = (
        db.query(Organization)
        .filter(Organization.clerk_org_id == clerk_org_id, Organization.deleted_at.is_(None))
        .first()
    )
    if org:
        return org
    data = fetch_clerk_organization(clerk_org_id)
    org = Organization(
        clerk_org_id=clerk_org_id,
        name=data.get("name") or clerk_org_id,
        slug=data.get("slug") or clerk_org_id,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def _get_or_provision_user(clerk_user_id: str, db: Session) -> User:
    user = (
        db.query(User)
        .filter(User.clerk_user_id == clerk_user_id, User.deleted_at.is_(None))
        .first()
    )
    if user:
        return user
    data = fetch_clerk_user(clerk_user_id)
    email = next(
        (
            e["email_address"]
            for e in data.get("email_addresses", [])
            if e.get("id") == data.get("primary_email_address_id")
        ),
        None,
    )
    name = " ".join(filter(None, [data.get("first_name"), data.get("last_name")])) or None
    user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        name=name,
        avatar_url=data.get("image_url"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _ensure_membership(
    org_id: uuid.UUID, user_id: uuid.UUID, org_role: str | None, db: Session
) -> None:
    membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.org_id == org_id,
            OrganizationMember.user_id == user_id,
            OrganizationMember.deleted_at.is_(None),
        )
        .first()
    )
    role = (org_role or "member").split(":")[-1]
    if membership:
        if membership.role != role:
            membership.role = role
            db.commit()
        return
    db.add(OrganizationMember(org_id=org_id, user_id=user_id, role=role))
    db.commit()
