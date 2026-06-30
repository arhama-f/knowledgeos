from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context
from app.db.session import get_db
from app.models.organization import OrganizationMember
from app.models.user import User
from app.schemas.member import MemberOut

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[MemberOut])
def list_members(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[MemberOut]:
    """Read-only — org-level role changes happen via Clerk (Team page) and sync
    down into organization_members on each authenticated request."""
    stmt = (
        select(OrganizationMember, User)
        .join(User, User.id == OrganizationMember.user_id)
        .where(OrganizationMember.org_id == auth.org_id, OrganizationMember.deleted_at.is_(None))
        .order_by(OrganizationMember.created_at)
    )
    results = db.execute(stmt).all()
    return [
        MemberOut(
            user_id=user.id,
            clerk_user_id=user.clerk_user_id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            role=member.role,
            joined_at=member.created_at,
        )
        for member, user in results
    ]
