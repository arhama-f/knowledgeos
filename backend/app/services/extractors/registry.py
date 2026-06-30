from app.core.file_types import canonical_kind
from app.services.extractors.base import Extractor
from app.services.extractors.csv_extractor import CsvExtractor
from app.services.extractors.docx_extractor import DocxExtractor
from app.services.extractors.email_extractor import EmailExtractor
from app.services.extractors.excel_extractor import ExcelExtractor
from app.services.extractors.image_extractor import ImageExtractor
from app.services.extractors.pdf_extractor import PdfExtractor
from app.services.extractors.pptx_extractor import PptxExtractor
from app.services.extractors.text_extractor import PlainTextExtractor

_EXTRACTORS: dict[str, type[Extractor]] = {
    "pdf": PdfExtractor,
    "docx": DocxExtractor,
    "txt": PlainTextExtractor,
    "markdown": PlainTextExtractor,
    "csv": CsvExtractor,
    "excel": ExcelExtractor,
    "powerpoint": PptxExtractor,
    "image": ImageExtractor,
    "email": EmailExtractor,
}


class UnsupportedFileType(Exception):
    pass


def get_extractor(filename: str) -> Extractor:
    kind = canonical_kind(filename)
    cls = _EXTRACTORS.get(kind) if kind else None
    if cls is None:
        raise UnsupportedFileType(f"Unsupported file type: {filename}")
    return cls()
