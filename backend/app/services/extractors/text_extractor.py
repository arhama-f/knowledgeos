from app.services.extractors.base import ExtractedPage, Extractor


class PlainTextExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        return [ExtractedPage(page_number=None, text=content.decode("utf-8", errors="ignore"))]
