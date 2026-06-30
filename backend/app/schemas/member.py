import uuid
from datetime import datetime

from pydantic import BaseModel


class MemberOut(BaseModel):
    user_id: uuid.UUID
    clerk_user_id: str
    email: str | None
    name: str | None
    avatar_url: str | None
    role: str
    joined_at: datetime
