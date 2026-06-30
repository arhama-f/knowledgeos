"""initial normalized schema: organizations, users, teams, projects, documents,
document versions/chunks, embeddings, chat sessions/messages/citations/feedback,
audit logs, permissions, api keys, billing, usage/tokens, events, notifications,
integrations.

Revision ID: 0001
Revises:
Create Date: 2026-06-28

"""

from collections.abc import Sequence

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EMBEDDING_DIM = 1536  # must match Settings.embedding_dimensions at migration time


def _timestamp_columns() -> list[sa.Column]:
    """Every table gets these three in addition to its own id column."""
    return [
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # ---- organizations ----
    op.create_table(
        "organizations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("clerk_org_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("plan", sa.String(), nullable=False, server_default="trial"),
        sa.Column("llm_provider", sa.String(), nullable=True),
        sa.Column("llm_model", sa.String(), nullable=True),
        sa.Column("embedding_provider", sa.String(), nullable=True),
        sa.Column("embedding_model", sa.String(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index(
        "uq_organizations_clerk_org_id",
        "organizations",
        ["clerk_org_id"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.create_index(
        "uq_organizations_slug",
        "organizations",
        ["slug"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    # ---- users ----
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("clerk_user_id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index(
        "uq_users_clerk_user_id",
        "users",
        ["clerk_user_id"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    # ---- organization_members ----
    op.create_table(
        "organization_members",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False, server_default="member"),
        *_timestamp_columns(),
    )
    op.create_index("ix_org_members_org_id", "organization_members", ["org_id"])
    op.create_index("ix_org_members_user_id", "organization_members", ["user_id"])

    # ---- teams ----
    op.create_table(
        "teams",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_teams_org_id", "teams", ["org_id"])
    op.create_index("ix_teams_slug", "teams", ["slug"])

    # ---- team_members ----
    op.create_table(
        "team_members",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False, server_default="member"),
        *_timestamp_columns(),
    )
    op.create_index("ix_team_members_team_id", "team_members", ["team_id"])
    op.create_index("ix_team_members_user_id", "team_members", ["user_id"])

    # ---- projects ----
    op.create_table(
        "projects",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        *_timestamp_columns(),
    )
    op.create_index("ix_projects_org_id", "projects", ["org_id"])
    op.create_index("ix_projects_team_id", "projects", ["team_id"])
    op.create_index("ix_projects_slug", "projects", ["slug"])

    # ---- documents (current_version_id FK added after document_versions exists) ----
    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", sa.Uuid(), sa.ForeignKey("projects.id"), nullable=True),
        sa.Column("uploaded_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("current_version_id", sa.Uuid(), nullable=True),
        sa.Column("file_type", sa.String(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=False, server_default="0"),
        *_timestamp_columns(),
    )
    op.create_index("ix_documents_org_id", "documents", ["org_id"])
    op.create_index("ix_documents_project_id", "documents", ["project_id"])
    op.create_index("ix_documents_status", "documents", ["status"])

    # ---- document_versions ----
    op.create_table(
        "document_versions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "document_id",
            sa.Uuid(),
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("version_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("storage_key", sa.String(), nullable=False),
        sa.Column("file_type", sa.String(), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("uploaded_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=False, server_default="0"),
        *_timestamp_columns(),
    )
    op.create_index("ix_document_versions_document_id", "document_versions", ["document_id"])
    op.create_index("ix_document_versions_status", "document_versions", ["status"])

    op.create_foreign_key(
        "fk_documents_current_version",
        "documents",
        "document_versions",
        ["current_version_id"],
        ["id"],
    )

    # ---- document_chunks ----
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "document_version_id",
            sa.Uuid(),
            sa.ForeignKey("document_versions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("token_count", sa.Integer(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index(
        "ix_document_chunks_document_version_id", "document_chunks", ["document_version_id"]
    )
    op.create_index("ix_document_chunks_org_id", "document_chunks", ["org_id"])

    # ---- embeddings ----
    op.create_table(
        "embeddings",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "chunk_id",
            sa.Uuid(),
            sa.ForeignKey("document_chunks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("dimension", sa.Integer(), nullable=False),
        sa.Column("vector", Vector(EMBEDDING_DIM), nullable=False),
        *_timestamp_columns(),
        sa.UniqueConstraint("chunk_id", "provider", "model", name="uq_embedding_chunk_model"),
    )
    op.create_index("ix_embeddings_chunk_id", "embeddings", ["chunk_id"])
    op.create_index("ix_embeddings_org_id", "embeddings", ["org_id"])
    op.execute(
        "CREATE INDEX ix_embeddings_vector_hnsw ON embeddings USING hnsw (vector vector_cosine_ops)"
    )

    # ---- chat_sessions ----
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", sa.Uuid(), sa.ForeignKey("projects.id"), nullable=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_chat_sessions_org_id", "chat_sessions", ["org_id"])
    op.create_index("ix_chat_sessions_project_id", "chat_sessions", ["project_id"])
    op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"])

    # ---- messages ----
    op.create_table(
        "messages",
        sa.Column(
            "id",
            sa.Uuid(),
            primary_key=True,
        ),
        sa.Column(
            "session_id",
            sa.Uuid(),
            sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("model", sa.String(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_messages_session_id", "messages", ["session_id"])
    op.create_index("ix_messages_org_id", "messages", ["org_id"])

    # ---- citations ----
    op.create_table(
        "citations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "message_id",
            sa.Uuid(),
            sa.ForeignKey("messages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("chunk_id", sa.Uuid(), sa.ForeignKey("document_chunks.id"), nullable=False),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("similarity", sa.Float(), nullable=False),
        *_timestamp_columns(),
    )
    op.create_index("ix_citations_message_id", "citations", ["message_id"])
    op.create_index("ix_citations_chunk_id", "citations", ["chunk_id"])
    op.create_index("ix_citations_document_id", "citations", ["document_id"])

    # ---- feedback ----
    op.create_table(
        "feedback",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "message_id",
            sa.Uuid(),
            sa.ForeignKey("messages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("rating", sa.String(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_feedback_message_id", "feedback", ["message_id"])
    op.create_index("ix_feedback_user_id", "feedback", ["user_id"])

    # ---- audit_logs ----
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("actor_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("resource_type", sa.String(), nullable=False),
        sa.Column("resource_id", sa.Uuid(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_audit_logs_org_id", "audit_logs", ["org_id"])
    op.create_index("ix_audit_logs_actor_user_id", "audit_logs", ["actor_user_id"])

    # ---- permissions ----
    op.create_table(
        "permissions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("subject_type", sa.String(), nullable=False),
        sa.Column("subject_id", sa.Uuid(), nullable=False),
        sa.Column("resource_type", sa.String(), nullable=False),
        sa.Column("resource_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("granted_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_permissions_org_id", "permissions", ["org_id"])
    op.create_index("ix_permissions_subject_id", "permissions", ["subject_id"])
    op.create_index("ix_permissions_resource_id", "permissions", ["resource_id"])

    # ---- api_keys ----
    op.create_table(
        "api_keys",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("key_prefix", sa.String(), nullable=False),
        sa.Column("key_hash", sa.String(), nullable=False),
        sa.Column("created_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_api_keys_org_id", "api_keys", ["org_id"])
    op.create_index(
        "uq_api_keys_key_hash",
        "api_keys",
        ["key_hash"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    # ---- billing_accounts ----
    op.create_table(
        "billing_accounts",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False, unique=True
        ),
        sa.Column("plan", sa.String(), nullable=False, server_default="trial"),
        sa.Column("status", sa.String(), nullable=False, server_default="trialing"),
        sa.Column("billing_cycle", sa.String(), nullable=False, server_default="annual"),
        sa.Column("seats", sa.Integer(), nullable=True),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=True),
        *_timestamp_columns(),
    )

    # ---- invoices ----
    op.create_table(
        "invoices",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "billing_account_id", sa.Uuid(), sa.ForeignKey("billing_accounts.id"), nullable=False
        ),
        sa.Column("amount_cents", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(), nullable=False, server_default="GBP"),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("reference_code", sa.String(), nullable=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_invoices_billing_account_id", "invoices", ["billing_account_id"])
    op.create_index(
        "uq_invoices_reference_code",
        "invoices",
        ["reference_code"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    # ---- usage_records ----
    op.create_table(
        "usage_records",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("metric", sa.String(), nullable=False),
        sa.Column("period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("quantity", sa.Numeric(), nullable=False),
        *_timestamp_columns(),
    )
    op.create_index("ix_usage_records_org_id", "usage_records", ["org_id"])

    # ---- token_usage ----
    op.create_table(
        "token_usage",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("related_type", sa.String(), nullable=False),
        sa.Column("related_id", sa.Uuid(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completion_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estimated_cost_cents", sa.Integer(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_token_usage_org_id", "token_usage", ["org_id"])
    op.create_index("ix_token_usage_related_id", "token_usage", ["related_id"])

    # ---- events ----
    op.create_table(
        "events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=True),
        sa.Column("actor_user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_events_org_id", "events", ["org_id"])
    op.create_index("ix_events_event_type", "events", ["event_type"])

    # ---- notifications ----
    op.create_table(
        "notifications",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("action_url", sa.String(), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_notifications_org_id", "notifications", ["org_id"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    # ---- integrations ----
    op.create_table(
        "integrations",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="disconnected"),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("connected_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        *_timestamp_columns(),
    )
    op.create_index("ix_integrations_org_id", "integrations", ["org_id"])


def downgrade() -> None:
    op.drop_table("integrations")
    op.drop_table("notifications")
    op.drop_table("events")
    op.drop_table("token_usage")
    op.drop_table("usage_records")
    op.drop_table("invoices")
    op.drop_table("billing_accounts")
    op.drop_table("api_keys")
    op.drop_table("permissions")
    op.drop_table("audit_logs")
    op.drop_table("feedback")
    op.drop_table("citations")
    op.drop_table("messages")
    op.drop_table("chat_sessions")
    op.drop_table("embeddings")
    op.drop_table("document_chunks")
    op.drop_constraint("fk_documents_current_version", "documents", type_="foreignkey")
    op.drop_table("document_versions")
    op.drop_table("documents")
    op.drop_table("projects")
    op.drop_table("team_members")
    op.drop_table("teams")
    op.drop_table("organization_members")
    op.drop_table("users")
    op.drop_table("organizations")
    op.execute("DROP EXTENSION IF EXISTS vector")
