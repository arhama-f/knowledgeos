import io

from pdf2image import convert_from_bytes
from pypdf import PdfReader

from app.services.extractors.base import ExtractedPage, Extractor
from app.services.ocr import run_ocr

MIN_TEXT_CHARS = 20  # below this, the page is treated as scanned and OCR'd instead
OCR_DPI = 150
MAX_OCR_PAGES = 300  # safety cap for very large fully-scanned documents


class PdfExtractor(Extractor):
    """Detects scanned pages automatically: a page with little/no embedded text
    (common for scanned contracts, receipts, forms) is rasterized via poppler
    (pdf2image, subprocess — not linked in-process, so its GPL license doesn't
    extend to this codebase) and OCR'd instead of relying on an empty text layer."""

    def extract(self, content: bytes) -> list[ExtractedPage]:
        reader = PdfReader(io.BytesIO(content))
        pages: list[ExtractedPage] = []
        ocr_count = 0
        for i, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            is_ocr = False
            if len(text) < MIN_TEXT_CHARS and ocr_count < MAX_OCR_PAGES:
                text = self._ocr_page(content, i)
                is_ocr = True
                ocr_count += 1
            if text:
                pages.append(ExtractedPage(page_number=i, text=text, is_ocr=is_ocr))
        return pages

    def _ocr_page(self, content: bytes, page_number: int) -> str:
        images = convert_from_bytes(
            content, dpi=OCR_DPI, first_page=page_number, last_page=page_number
        )
        return run_ocr(images[0]) if images else ""
