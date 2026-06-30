import pytesseract
from PIL import Image


def run_ocr(image: Image.Image) -> str:
    """Single shared entry point for Tesseract OCR — used for standalone images
    and for scanned PDF pages rendered to an image."""
    return pytesseract.image_to_string(image).strip()
