from email.message import EmailMessage
from email.parser import BytesParser
from email.policy import default as default_policy

from app.services.extractors.base import ExtractedPage, Extractor

HEADER_KEYS = ("From", "To", "Cc", "Subject", "Date")


class EmailExtractor(Extractor):
    """Handles .eml (RFC822) only — .msg (Outlook binary format) is not supported."""

    def extract(self, content: bytes) -> list[ExtractedPage]:
        # typeshed can't resolve email.policy.default's generic type parameter
        # here, so it infers the base Message type instead of EmailMessage —
        # this is genuinely an EmailMessage at runtime (that's what `default`
        # policy always constructs).
        parser = BytesParser(policy=default_policy)  # type: ignore[arg-type]
        message: EmailMessage = parser.parsebytes(content)  # type: ignore[assignment]
        headers = "\n".join(f"{key}: {message.get(key)}" for key in HEADER_KEYS if message.get(key))
        body = self._extract_body(message)
        text = f"{headers}\n\n{body}".strip()
        return [ExtractedPage(page_number=None, text=text)] if text else []

    def _extract_body(self, message: EmailMessage) -> str:
        if message.is_multipart():
            parts = [
                part.get_content().strip()
                for part in message.walk()
                if part.get_content_type() == "text/plain" and not part.is_attachment()
            ]
            return "\n\n".join(parts)
        if message.get_content_type() == "text/plain":
            return message.get_content().strip()
        return ""
