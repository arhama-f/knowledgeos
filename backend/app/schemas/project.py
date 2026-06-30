import uuid
from datetime import datetime

from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    team_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreateRequest(BaseModel):
    name: str
    description: str | None = None
    team_id: uuid.UUID | None = None
