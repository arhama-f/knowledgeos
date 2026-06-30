import re
from dataclasses import dataclass

from langdetect import LangDetectException, detect

from app.services.extractors.base import ExtractedPage

WORD_RE = re.compile(r"\S+")
LANGUAGE_SAMPLE_CHARS = 5000


@dataclass
class DocumentMetadata:
    page_count: int
    word_count: int
    char_count: int
    language: str | None


def extract_metadata(pages: list[ExtractedPage]) -> DocumentMetadata:
    full_text = "\n".join(p.text for p in pages)
    language = None
    if full_text.strip():
        try:
            language = detect(full_text[:LANGUAGE_SAMPLE_CHARS])
        except LangDetectException:
            language = None
    return DocumentMetadata(
        page_count=len(pages),
        word_count=len(WORD_RE.findall(full_text)),
        char_count=len(full_text),
        language=language,
    )
