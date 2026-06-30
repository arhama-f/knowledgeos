"""departments + team.department_id, organization branding fields, billing quotas.

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-29

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "departments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_departments_org_id", "departments", ["org_id"])
    op.create_index("ix_departments_slug", "departments", ["slug"])

    op.add_column("teams", sa.Column("department_id", sa.Uuid(), nullable=True))
    op.create_foreign_key("fk_teams_department", "teams", "departments", ["department_id"], ["id"])
    op.create_index("ix_teams_department_id", "teams", ["department_id"])

    op.add_column("organizations", sa.Column("logo_url", sa.String(), nullable=True))
    op.add_column("organizations", sa.Column("primary_color", sa.String(), nullable=True))
    op.add_column("organizations", sa.Column("website_url", sa.String(), nullable=True))

    op.add_column(
        "billing_accounts", sa.Column("storage_quota_bytes", sa.BigInteger(), nullable=True)
    )
    op.add_column(
        "billing_accounts", sa.Column("ai_quota_monthly_questions", sa.Integer(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("billing_accounts", "ai_quota_monthly_questions")
    op.drop_column("billing_accounts", "storage_quota_bytes")
    op.drop_column("organizations", "website_url")
    op.drop_column("organizations", "primary_color")
    op.drop_column("organizations", "logo_url")
    op.drop_index("ix_teams_department_id", table_name="teams")
    op.drop_constraint("fk_teams_department", "teams", type_="foreignkey")
    op.drop_column("teams", "department_id")
    op.drop_table("departments")
