import re
from dataclasses import dataclass

from app.core.config import get_settings
from app.services.extractors.base import ExtractedPage

SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
PARAGRAPH_SPLIT_RE = re.compile(r"\n\s*\n")


@dataclass
class Chunk:
    content: str
    chunk_index: int
    page_number: int | None
    is_ocr: bool = False


def chunk_text(text: str) -> list[str]:
    """Paragraph/sentence-aware chunking with overlap, sized via Settings.chunk_*.
    Expects already-cleaned text (see app.services.cleaning.clean_text) — this
    only splits, it doesn't normalize whitespace itself."""
    settings = get_settings()
    target, min_len, overlap = (
        settings.chunk_target_chars,
        settings.chunk_min_chars,
        settings.chunk_overlap_chars,
    )

    paragraphs = [p.strip() for p in PARAGRAPH_SPLIT_RE.split(text) if p.strip()]

    chunks: list[str] = []
    buffer = ""

    def flush() -> None:
        nonlocal buffer
        if len(buffer.strip()) >= min_len:
            chunks.append(buffer.strip())
        buffer = ""

    def start_new_buffer() -> str:
        if overlap and chunks:
            return chunks[-1][-overlap:] + " "
        return ""

    for para in paragraphs:
        pieces = SENTENCE_SPLIT_RE.split(para) if len(para) > target else [para]
        for piece in pieces:
            if len(buffer) + len(piece) + 1 > target and buffer:
                flush()
                buffer = start_new_buffer()
            buffer += piece + " "

    flush()
    return chunks


def chunk_pages(pages: list[ExtractedPage]) -> list[Chunk]:
    chunks: list[Chunk] = []
    index = 0
    for page in pages:
        for piece in chunk_text(page.text):
            chunks.append(
                Chunk(
                    content=piece,
                    chunk_index=index,
                    page_number=page.page_number,
                    is_ocr=page.is_ocr,
                )
            )
            index += 1
    return chunks
