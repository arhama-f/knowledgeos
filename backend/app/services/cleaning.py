import re
import unicodedata

CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
MULTI_SPACE_RE = re.compile(r"[ \t]+")
MULTI_BLANK_LINE_RE = re.compile(r"\n{3,}")


def clean_text(text: str) -> str:
    """Normalizes raw extracted/OCR'd text before metadata extraction and chunking:
    unicode normalization, stripped control characters (common OCR artifacts),
    collapsed whitespace and excess blank lines."""
    text = unicodedata.normalize("NFKC", text)
    text = CONTROL_CHARS_RE.sub("", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = MULTI_SPACE_RE.sub(" ", text)
    text = MULTI_BLANK_LINE_RE.sub("\n\n", text)
    return text.strip()
