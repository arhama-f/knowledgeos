import uuid
from datetime import datetime

from pydantic import BaseModel


class PermissionOut(BaseModel):
    id: uuid.UUID
    subject_type: str
    subject_id: uuid.UUID
    resource_type: str
    resource_id: uuid.UUID
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PermissionGrantRequest(BaseModel):
    subject_type: str  # "user" | "team"
    subject_id: uuid.UUID
    resource_type: str  # "project" | "document"
    resource_id: uuid.UUID
    role: str  # "viewer" | "editor" | "admin"
