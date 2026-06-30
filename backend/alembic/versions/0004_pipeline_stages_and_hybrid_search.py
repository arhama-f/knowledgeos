"""Granular pipeline stage tracking + retry counters + structural metadata on
documents/document_versions, and a generated tsvector + GIN index on
document_chunks for keyword/hybrid search.

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-30

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("documents", sa.Column("processing_stage", sa.String(), nullable=True))
    op.add_column("documents", sa.Column("failed_stage", sa.String(), nullable=True))
    op.add_column(
        "documents", sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column("documents", sa.Column("page_count", sa.Integer(), nullable=True))
    op.add_column("documents", sa.Column("word_count", sa.Integer(), nullable=True))
    op.add_column("documents", sa.Column("language", sa.String(), nullable=True))

    op.add_column("document_versions", sa.Column("processing_stage", sa.String(), nullable=True))
    op.add_column("document_versions", sa.Column("failed_stage", sa.String(), nullable=True))
    op.add_column(
        "document_versions",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("document_versions", sa.Column("page_count", sa.Integer(), nullable=True))
    op.add_column("document_versions", sa.Column("word_count", sa.Integer(), nullable=True))
    op.add_column("document_versions", sa.Column("char_count", sa.Integer(), nullable=True))
    op.add_column("document_versions", sa.Column("language", sa.String(), nullable=True))

    # Generated column, not mapped on the ORM model — populated automatically by
    # Postgres on every insert/update of `content`, queried only via raw SQL.
    op.execute(
        "ALTER TABLE document_chunks ADD COLUMN search_vector tsvector "
        "GENERATED ALWAYS AS (to_tsvector('english', content)) STORED"
    )
    op.execute(
        "CREATE INDEX ix_document_chunks_search_vector ON document_chunks USING gin(search_vector)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_document_chunks_search_vector")
    op.execute("ALTER TABLE document_chunks DROP COLUMN search_vector")

    op.drop_column("document_versions", "language")
    op.drop_column("document_versions", "char_count")
    op.drop_column("document_versions", "word_count")
    op.drop_column("document_versions", "page_count")
    op.drop_column("document_versions", "retry_count")
    op.drop_column("document_versions", "failed_stage")
    op.drop_column("document_versions", "processing_stage")

    op.drop_column("documents", "language")
    op.drop_column("documents", "word_count")
    op.drop_column("documents", "page_count")
    op.drop_column("documents", "retry_count")
    op.drop_column("documents", "failed_stage")
    op.drop_column("documents", "processing_stage")
