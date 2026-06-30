import uuid
from datetime import datetime

from pydantic import BaseModel


class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    department_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamCreateRequest(BaseModel):
    name: str
    description: str | None = None
    department_id: uuid.UUID | None = None


class TeamMemberOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberAddRequest(BaseModel):
    user_id: uuid.UUID
    role: str = "member"
