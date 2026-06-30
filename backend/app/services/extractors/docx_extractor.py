import io

from docx import Document as DocxDocument

from app.services.extractors.base import ExtractedPage, Extractor


class DocxExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        doc = DocxDocument(io.BytesIO(content))
        text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
        return [ExtractedPage(page_number=None, text=text)]
