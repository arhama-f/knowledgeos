import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.core.audit import record_audit
from app.db.session import get_db
from app.models.permission import Permission
from app.schemas.permission import PermissionGrantRequest, PermissionOut

router = APIRouter(prefix="/permissions", tags=["permissions"])

VALID_ROLES = {"viewer", "editor", "admin"}
VALID_SUBJECT_TYPES = {"user", "team"}
VALID_RESOURCE_TYPES = {"project", "document"}


@router.get("", response_model=list[PermissionOut])
def list_permissions(
    resource_type: str = Query(...),
    resource_id: uuid.UUID = Query(...),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[Permission]:
    stmt = select(Permission).where(
        Permission.org_id == auth.org_id,
        Permission.resource_type == resource_type,
        Permission.resource_id == resource_id,
        Permission.deleted_at.is_(None),
    )
    return list(db.execute(stmt).scalars())


@router.post("", response_model=PermissionOut, status_code=status.HTTP_201_CREATED)
def grant_permission(
    body: PermissionGrantRequest,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Permission:
    if body.role not in VALID_ROLES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"role must be one of {VALID_ROLES}")
    if body.subject_type not in VALID_SUBJECT_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"subject_type must be one of {VALID_SUBJECT_TYPES}"
        )
    if body.resource_type not in VALID_RESOURCE_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"resource_type must be one of {VALID_RESOURCE_TYPES}"
        )

    permission = Permission(
        org_id=auth.org_id,
        subject_type=body.subject_type,
        subject_id=body.subject_id,
        resource_type=body.resource_type,
        resource_id=body.resource_id,
        role=body.role,
        granted_by=auth.user_pk,
    )
    db.add(permission)
    db.commit()
    db.refresh(permission)
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "permission.granted",
        body.resource_type,
        body.resource_id,
        metadata=body.model_dump(mode="json"),
        request=request,
    )
    return permission


@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_permission(
    permission_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    permission = db.get(Permission, permission_id)
    if not permission or permission.org_id != auth.org_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Permission not found")
    permission.deleted_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "permission.revoked",
        permission.resource_type,
        permission.resource_id,
        request=request,
    )
