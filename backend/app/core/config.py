from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Environment — gates /docs exposure, log format, etc. "development" | "production"
    environment: str = "development"
    log_level: str = "INFO"
    sentry_dsn: str = ""  # error tracking; no-op if unset

    # Database
    database_url: str = "postgresql+psycopg://knowledgeos:knowledgeos@localhost:5432/knowledgeos"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Object storage (S3-compatible — MinIO locally, real S3 in prod)
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "knowledgeos"
    s3_secret_key: str = "knowledgeos-dev-secret"
    s3_bucket: str = "documents"
    s3_region: str = "us-east-1"
    s3_use_ssl: bool = False

    # Clerk
    clerk_issuer: str = ""  # e.g. https://your-app.clerk.accounts.dev
    clerk_audience: str | None = None
    clerk_secret_key: str = ""  # used to fetch org details when auto-provisioning

    # AI — provider/model selection is config-driven, never hardcoded in business logic
    default_llm_provider: str = "anthropic"
    default_llm_model: str = "claude-sonnet-4-6"
    default_embedding_provider: str = "openai"
    default_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    gemini_api_key: str = ""

    # Chunking
    chunk_target_chars: int = 600
    chunk_min_chars: int = 80
    chunk_overlap_chars: int = 80

    # Retrieval
    retrieval_top_k: int = 6

    cors_origins: list[str] = ["http://localhost:3015"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
