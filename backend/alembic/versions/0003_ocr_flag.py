"""document_chunks.is_ocr — marks chunks produced by OCR (scanned PDFs/images)
rather than native text extraction.

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-29

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "document_chunks",
        sa.Column("is_ocr", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("document_chunks", "is_ocr")
