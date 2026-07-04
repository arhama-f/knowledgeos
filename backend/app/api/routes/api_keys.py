import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, require_session_admin
from app.core.api_keys import generate_api_key
from app.core.audit import record_audit
from app.db.session import get_db
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreateRequest, ApiKeyCreateResponse, ApiKeyOut

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


@router.get("", response_model=list[ApiKeyOut])
def list_api_keys(
    auth: AuthContext = Depends(require_session_admin), db: Session = Depends(get_db)
) -> list[ApiKey]:
    stmt = (
        select(ApiKey)
        .where(ApiKey.org_id == auth.org_id, ApiKey.deleted_at.is_(None))
        .order_by(ApiKey.created_at.desc())
    )
    return list(db.execute(stmt).scalars())


@router.post("", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    body: ApiKeyCreateRequest,
    request: Request,
    auth: AuthContext = Depends(require_session_admin),
    db: Session = Depends(get_db),
) -> ApiKeyCreateResponse:
    full_key, prefix, key_hash = generate_api_key()
    api_key = ApiKey(
        org_id=auth.org_id,
        name=body.name,
        key_prefix=prefix,
        key_hash=key_hash,
        created_by=auth.user_pk,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "api_key.created",
        "api_key",
        api_key.id,
        metadata={"name": body.name, "key_prefix": prefix},
        request=request,
    )
    return ApiKeyCreateResponse(api_key=ApiKeyOut.model_validate(api_key), secret=full_key)


@router.delete("/{api_key_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_key(
    api_key_id: uuid.UUID,
    request: Request,
    auth: AuthContext = Depends(require_session_admin),
    db: Session = Depends(get_db),
) -> None:
    api_key = db.get(ApiKey, api_key_id)
    if not api_key or api_key.org_id != auth.org_id or api_key.deleted_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")
    api_key.revoked_at = datetime.now(UTC)
    db.commit()
    record_audit(
        db,
        auth.org_id,
        auth.user_pk,
        "api_key.revoked",
        "api_key",
        api_key_id,
        metadata={"name": api_key.name},
        request=request,
    )
