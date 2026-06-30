from pathlib import Path

# Canonical kind keys used for both extractor routing and UI display labels.
EXTENSION_KINDS: dict[str, str] = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".txt": "txt",
    ".md": "markdown",
    ".markdown": "markdown",
    ".csv": "csv",
    ".xlsx": "excel",
    ".pptx": "powerpoint",
    ".eml": "email",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
    ".tiff": "image",
    ".bmp": "image",
}

ARCHIVE_EXTENSIONS = {".zip"}

KIND_LABELS: dict[str, str] = {
    "pdf": "PDF",
    "docx": "Word",
    "txt": "Text",
    "markdown": "Markdown",
    "csv": "CSV",
    "excel": "Excel",
    "powerpoint": "PowerPoint",
    "email": "Email",
    "image": "Image",
    "zip": "Archive",
}


def canonical_kind(filename: str) -> str | None:
    ext = Path(filename).suffix.lower()
    if ext in ARCHIVE_EXTENSIONS:
        return "zip"
    return EXTENSION_KINDS.get(ext)


def is_supported(filename: str) -> bool:
    return canonical_kind(filename) is not None


def is_archive(filename: str) -> bool:
    return Path(filename).suffix.lower() in ARCHIVE_EXTENSIONS


def label_for(filename: str) -> str:
    kind = canonical_kind(filename)
    return KIND_LABELS.get(kind, "File") if kind else "File"
