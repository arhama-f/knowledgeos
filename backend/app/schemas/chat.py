import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=8000)
    session_id: uuid.UUID | None = None


class SourceOut(BaseModel):
    doc_id: uuid.UUID
    doc_name: str
    chunk_index: int
    page_number: int | None
    similarity: float
    preview: str
    is_ocr: bool = False


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    sources: list[SourceOut] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionOut(BaseModel):
    id: uuid.UUID
    title: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
