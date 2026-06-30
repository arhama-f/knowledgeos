import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.core.slug import slugify, unique_suffix
from app.db.session import get_db
from app.models.department import Department
from app.schemas.department import DepartmentCreateRequest, DepartmentOut

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentOut])
def list_departments(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> list[Department]:
    stmt = (
        select(Department)
        .where(Department.org_id == auth.org_id, Department.deleted_at.is_(None))
        .order_by(Department.created_at.desc())
    )
    return list(db.execute(stmt).scalars())


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    body: DepartmentCreateRequest,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Department:
    department = Department(
        org_id=auth.org_id,
        name=body.name,
        slug=f"{slugify(body.name)}-{unique_suffix()}",
        description=body.description,
    )
    db.add(department)
    db.commit()
    db.refresh(department)
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "department.created",
        "department",
        department.id,
        request=request,
    )
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    department = db.get(Department, department_id)
    if not department or department.org_id != auth.org_id or department.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")
    department.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "department.deleted",
        "department",
        department_id,
        request=request,
    )
