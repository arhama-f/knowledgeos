import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.organization import Organization, OrganizationMember
from app.models.token import InviteToken
from app.models.user import User
from app.schemas.member import MemberOut
from app.services.email import send_invite

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members(
    skip: int = Query(default=0, ge=0, le=10000),
    limit: int = Query(default=50, ge=1, le=200),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[MemberOut]:
    stmt = (
        select(OrganizationMember, User)
        .join(User, User.id == OrganizationMember.user_id)
        .where(OrganizationMember.org_id == auth.org_id, OrganizationMember.deleted_at.is_(None))
        .order_by(OrganizationMember.created_at)
        .offset(skip)
        .limit(min(limit, 200))
    )
    results = db.execute(stmt).all()
    return [
        MemberOut(
            user_id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            role=member.role,
            joined_at=member.created_at,
        )
        for member, user in results
    ]


class InviteIn(BaseModel):
    email: EmailStr
    role: str = Field(default="member", pattern="^(admin|member)$")


@router.post("/invite", status_code=status.HTTP_204_NO_CONTENT)
async def invite_member(
    body: InviteIn,
    background: BackgroundTasks,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    org = db.get(Organization, auth.org_id)
    if not org:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Organization not found")

    existing_user = db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first()
    if existing_user:
        already = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.user_id == existing_user.id,
                OrganizationMember.org_id == auth.org_id,
                OrganizationMember.deleted_at.is_(None),
            )
            .first()
        )
        if already:
            raise HTTPException(status.HTTP_409_CONFLICT, "User is already a member of this organization")

    token_value = secrets.token_hex(32)
    expires = datetime.now(timezone.utc) + timedelta(days=7)
    db.add(InviteToken(org_id=auth.org_id, email=body.email, role=body.role, token=token_value, expires_at=expires))
    db.commit()

    inviter = db.query(User).filter(User.id == auth.user_pk).first()
    inviter_name = (inviter.name or inviter.email) if inviter else org.name
    background.add_task(send_invite, body.email, org.name, inviter_name, token_value)


class AcceptInviteIn(BaseModel):
    token: str = Field(min_length=1, max_length=64)
    name: str | None = Field(default=None, max_length=200)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class AcceptInviteOut(BaseModel):
    message: str
    org_name: str


@router.post("/invite/accept", response_model=AcceptInviteOut)
def accept_invite(body: AcceptInviteIn, db: Session = Depends(get_db)) -> AcceptInviteOut:
    now = datetime.now(timezone.utc)
    invite = (
        db.query(InviteToken)
        .filter(
            InviteToken.token == body.token,
            InviteToken.accepted_at.is_(None),
            InviteToken.expires_at > now,
        )
        .first()
    )
    if not invite:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired invitation link")

    org = db.get(Organization, invite.org_id)
    if not org:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Organization not found")

    user = db.query(User).filter(User.email == invite.email, User.deleted_at.is_(None)).first()
    if not user:
        if not body.name or not body.password:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "name and password are required to create a new account",
            )
        user = User(email=invite.email, name=body.name, password_hash=hash_password(body.password))
        db.add(user)
        db.flush()

    existing = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.user_id == user.id,
            OrganizationMember.org_id == org.id,
            OrganizationMember.deleted_at.is_(None),
        )
        .first()
    )
    if not existing:
        db.add(OrganizationMember(org_id=org.id, user_id=user.id, role=invite.role))

    invite.accepted_at = now
    db.commit()

    return AcceptInviteOut(message="Invitation accepted. You can now sign in.", org_name=org.name)
