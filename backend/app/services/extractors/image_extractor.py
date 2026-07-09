from app.services.extractors.base import ExtractedPage, Extractor


class ImageExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        # OCR requires system binaries (tesseract/poppler) not available in serverless.
        return []
