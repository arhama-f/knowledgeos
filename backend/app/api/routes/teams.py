import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.core.slug import slugify, unique_suffix
from app.db.session import get_db
from app.models.team import Team, TeamMember
from app.schemas.team import TeamCreateRequest, TeamMemberAddRequest, TeamMemberOut, TeamOut

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamOut])
def list_teams(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[Team]:
    stmt = (
        select(Team)
        .where(Team.org_id == auth.org_id, Team.deleted_at.is_(None))
        .order_by(Team.created_at.desc())
    )
    return list(db.execute(stmt).scalars())


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    body: TeamCreateRequest,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Team:
    team = Team(
        org_id=auth.org_id,
        department_id=body.department_id,
        name=body.name,
        slug=f"{slugify(body.name)}-{unique_suffix()}",
        description=body.description,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    record_audit(db, auth.org_id, auth.user_pk, "team.created", "team", team.id, request=request)
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    team = _get_owned_team(db, team_id, auth.org_id)
    team.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(db, auth.org_id, auth.user_pk, "team.deleted", "team", team_id, request=request)


@router.get("/{team_id}/members", response_model=list[TeamMemberOut])
def list_team_members(
    team_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[TeamMember]:
    _get_owned_team(db, team_id, auth.org_id)
    stmt = (
        select(TeamMember)
        .where(TeamMember.team_id == team_id, TeamMember.deleted_at.is_(None))
        .order_by(TeamMember.created_at)
    )
    return list(db.execute(stmt).scalars())


@router.post(
    "/{team_id}/members", response_model=TeamMemberOut, status_code=status.HTTP_201_CREATED
)
def add_team_member(
    team_id: uuid.UUID,
    body: TeamMemberAddRequest,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> TeamMember:
    _get_owned_team(db, team_id, auth.org_id)
    member = TeamMember(team_id=team_id, user_id=body.user_id, role=body.role)
    db.add(member)
    db.commit()
    db.refresh(member)
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "team.member_added",
        "team",
        team_id,
        metadata={"user_id": str(body.user_id), "role": body.role},
        request=request,
    )
    return member


@router.delete("/{team_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team_member(
    team_id: uuid.UUID,
    member_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    _get_owned_team(db, team_id, auth.org_id)
    member = db.get(TeamMember, member_id)
    if not member or member.team_id != team_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team member not found")
    member.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db, auth.org_id, auth.user_pk, "team.member_removed", "team", team_id, request=request
    )


def _get_owned_team(db: Session, team_id: uuid.UUID, org_id: uuid.UUID) -> Team:
    team = db.get(Team, team_id)
    if team is None or team.org_id != org_id or team.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team not found")
    return team
