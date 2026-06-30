from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import AuthContext, get_auth_context, require_admin
from app.db.session import get_db
from app.models.organization import Organization
from app.schemas.organization import (
    OrganizationBrandingUpdate,
    OrganizationOut,
    OrganizationSettingsUpdate,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/me", response_model=OrganizationOut)
def get_my_organization(
    auth: AuthContext = Depends(get_auth_context), db: Session = Depends(get_db)
) -> Organization:
    return _get_org_or_404(db, auth)


@router.patch("/me", response_model=OrganizationOut)
def update_my_organization(
    body: OrganizationSettingsUpdate,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Organization:
    org = _get_org_or_404(db, auth)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    db.commit()
    db.refresh(org)
    return org


@router.patch("/branding", response_model=OrganizationOut)
def update_branding(
    body: OrganizationBrandingUpdate,
    auth: AuthContext = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Organization:
    org = _get_org_or_404(db, auth)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    db.commit()
    db.refresh(org)
    return org


def _get_org_or_404(db: Session, auth: AuthContext) -> Organization:
    # auth.org_id always points at a real row when AuthContext was constructed —
    # this only trips on a concurrent delete mid-request, but that's worth a
    # clean 404 rather than an AttributeError further down.
    org = db.get(Organization, auth.org_id)
    if org is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Organization not found")
    return org
