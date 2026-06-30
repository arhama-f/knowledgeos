import io

from PIL import Image

from app.services.extractors.base import ExtractedPage, Extractor
from app.services.ocr import run_ocr


class ImageExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        image = Image.open(io.BytesIO(content))
        text = run_ocr(image)
        return [ExtractedPage(page_number=None, text=text, is_ocr=True)] if text else []
