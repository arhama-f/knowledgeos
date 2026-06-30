from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, require_admin
from app.db.session import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    auth: AuthContext = Depends(require_admin), db: Session = Depends(get_db)
) -> list[AuditLog]:
    stmt = (
        select(AuditLog)
        .where(AuditLog.org_id == auth.org_id)
        .order_by(AuditLog.created_at.desc())
        .limit(200)
    )
    return list(db.execute(stmt).scalars())
