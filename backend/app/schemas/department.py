import uuid
from datetime import datetime

from pydantic import BaseModel


class DepartmentOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DepartmentCreateRequest(BaseModel):
    name: str
    description: str | None = None
