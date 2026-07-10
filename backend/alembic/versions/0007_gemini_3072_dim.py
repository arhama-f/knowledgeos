"""Set vector dimension to 1536 for Gemini embedding-001 with output_dimensionality=1536.

HNSW index requires ≤2000 dims; Gemini embedding-001 truncated to 1536.

Revision ID: 0007
Revises: 0006
"""

from alembic import op

revision = "0007"
down_revision = "0006"
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
        "ALTER TABLE embeddings ADD COLUMN vector vector(768) NOT NULL "
        "DEFAULT array_fill(0, ARRAY[768])::vector(768)"
    )
    op.execute("ALTER TABLE embeddings ALTER COLUMN vector DROP DEFAULT")
    op.execute(
        "CREATE INDEX ix_embeddings_vector_hnsw ON embeddings USING hnsw (vector vector_cosine_ops)"
    )
