import uuid
from datetime import datetime

from pydantic import BaseModel


class OrganizationOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: str
    llm_provider: str | None
    llm_model: str | None
    embedding_provider: str | None
    embedding_model: str | None
    logo_url: str | None
    primary_color: str | None
    website_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrganizationSettingsUpdate(BaseModel):
    llm_provider: str | None = None
    llm_model: str | None = None


class OrganizationBrandingUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    primary_color: str | None = None
    website_url: str | None = None
