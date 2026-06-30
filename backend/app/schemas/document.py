import uuid
from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: uuid.UUID
    name: str
    file_type: str
    size_bytes: int
    status: str
    error_message: str | None
    chunk_count: int
    processing_stage: str | None
    failed_stage: str | None
    retry_count: int
    page_count: int | None
    word_count: int | None
    language: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadRequest(BaseModel):
    filename: str
    content_type: str
    size_bytes: int


class DocumentUploadResponse(BaseModel):
    document: DocumentOut
    upload_url: str
    upload_fields: dict[str, str] = {}


class ChunkPreview(BaseModel):
    id: uuid.UUID
    chunk_index: int
    page_number: int | None
    content: str
    is_ocr: bool

    model_config = {"from_attributes": True}
