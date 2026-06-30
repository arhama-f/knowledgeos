from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ExtractedPage:
    page_number: int | None
    text: str
    is_ocr: bool = False


class Extractor(ABC):
    @abstractmethod
    def extract(self, content: bytes) -> list[ExtractedPage]:
        raise NotImplementedError
