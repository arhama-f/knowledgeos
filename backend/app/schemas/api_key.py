import uuid
from datetime import datetime

from pydantic import BaseModel


class ApiKeyOut(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    last_used_at: datetime | None
    revoked_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyCreateRequest(BaseModel):
    name: str


class ApiKeyCreateResponse(BaseModel):
    api_key: ApiKeyOut
    secret: str  # shown once, never stored or retrievable again
