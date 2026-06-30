import uuid

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record_audit(
    db: Session,
    org_id: uuid.UUID,
    actor_user_id: uuid.UUID | None,
    action: str,
    resource_type: str,
    resource_id: uuid.UUID | None = None,
    metadata: dict | None = None,
    request: Request | None = None,
) -> None:
    ip_address = None
    if request is not None:
        ip_address = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
            request.client.host if request.client else None
        )
    db.add(
        AuditLog(
            org_id=org_id,
            actor_user_id=actor_user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata,
            ip_address=ip_address,
        )
    )
    db.commit()
