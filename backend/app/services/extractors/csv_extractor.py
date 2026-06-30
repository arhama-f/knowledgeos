import csv
import io

from app.services.extractors.base import ExtractedPage, Extractor

MAX_ROWS = 50_000


class CsvExtractor(Extractor):
    def extract(self, content: bytes) -> list[ExtractedPage]:
        text = content.decode("utf-8", errors="ignore")
        reader = csv.reader(io.StringIO(text))
        rows = []
        for i, row in enumerate(reader):
            if i >= MAX_ROWS:
                break
            if any(cell.strip() for cell in row):
                rows.append(" | ".join(cell.strip() for cell in row))
        # Blank-line-separated so the paragraph-aware chunker never splits a row in half.
        return [ExtractedPage(page_number=None, text="\n\n".join(rows))]
