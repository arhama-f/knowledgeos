import io

from pypdf import PdfReader

from app.services.extractors.base import ExtractedPage, Extractor


class PdfExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        reader = PdfReader(io.BytesIO(content))
        pages: list[ExtractedPage] = []
        for i, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if text:
                pages.append(ExtractedPage(page_number=i, text=text))
        return pages
