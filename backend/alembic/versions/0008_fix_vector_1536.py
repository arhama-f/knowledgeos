"""Fix vector column to 1536 dims (Gemini truncated, within HNSW 2000-dim limit).

Migration 0007 set 3072 but HNSW index creation failed. This corrects to 1536
which is within pgvector's HNSW limit and matches Gemini output_dimensionality.

Revision ID: 0008
Revises: 0007
"""

from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_embeddings_vector_hnsw")
    op.execute("ALTER TABLE embeddings DROP COLUMN IF EXISTS vector")
    op.execute(
        "ALTER TABLE embeddings ADD COLUMN vector vector(1536) NOT NULL "
        "DEFAULT array_fill(0, ARRAY[1536])::vector(1536)"
    )
    op.execute("ALTER TABLE embeddings ALTER COLUMN vector DROP DEFAULT")
    op.execute(
        "CREATE INDEX ix_embeddings_vector_hnsw ON embeddings USING hnsw (vector vector_cosine_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_embeddings_vector_hnsw")
    op.execute("ALTER TABLE embeddings DROP COLUMN IF EXISTS vector")
    op.execute(
        "ALTER TABLE embeddings ADD COLUMN vector vector(3072) NOT NULL "
        "DEFAULT array_fill(0, ARRAY[3072])::vector(3072)"
    )
    op.execute("ALTER TABLE embeddings ALTER COLUMN vector DROP DEFAULT")
