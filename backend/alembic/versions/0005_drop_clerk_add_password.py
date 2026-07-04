"""Drop Clerk dependency: make clerk_user_id/clerk_org_id nullable, add password_hash,
add unique index on users.email.

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Make clerk_user_id nullable (was NOT NULL)
    op.alter_column("users", "clerk_user_id", nullable=True)

    # Add password_hash for self-hosted auth
    op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))

    # Unique index on email (partial: skip NULLs and soft-deleted rows)
    op.create_index(
        "uq_users_email",
        "users",
        ["email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL AND deleted_at IS NULL"),
    )

    # Make clerk_org_id nullable on organizations (was NOT NULL)
    op.alter_column("organizations", "clerk_org_id", nullable=True)


def downgrade() -> None:
    op.drop_index("uq_users_email", table_name="users")
    op.drop_column("users", "password_hash")
    op.alter_column("users", "clerk_user_id", nullable=False)
    op.alter_column("organizations", "clerk_org_id", nullable=False)
