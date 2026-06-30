import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.core.slug import slugify, unique_suffix
from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreateRequest, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[Project]:
    stmt = (
        select(Project)
        .where(Project.org_id == auth.org_id, Project.deleted_at.is_(None))
        .order_by(Project.created_at.desc())
    )
    return list(db.execute(stmt).scalars())


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreateRequest,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Project:
    project = Project(
        org_id=auth.org_id,
        team_id=body.team_id,
        name=body.name,
        slug=f"{slugify(body.name)}-{unique_suffix()}",
        description=body.description,
        created_by=auth.user_pk,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    record_audit(
        db, auth.org_id, auth.user_pk, "project.created", "project", project.id, request=request
    )
    return project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: uuid.UUID,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> Project:
    return _get_owned_project(db, project_id, auth.org_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    project = _get_owned_project(db, project_id, auth.org_id)
    project.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db, auth.org_id, auth.user_pk, "project.deleted", "project", project_id, request=request
    )


def _get_owned_project(db: Session, project_id: uuid.UUID, org_id: uuid.UUID) -> Project:
    project = db.get(Project, project_id)
    if project is None or project.org_id != org_id or project.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project
