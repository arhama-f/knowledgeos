from supabase import create_client, Client

from app.core.config import get_settings


def _client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)


def _bucket() -> str:
    return get_settings().supabase_bucket


def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 600) -> str:
    result = _client().storage.from_(_bucket()).create_signed_upload_url(key)
    return result["signed_url"]


def generate_presigned_download_url(key: str, filename: str, expires_in: int = 600) -> str:
    result = _client().storage.from_(_bucket()).create_signed_url(
        key,
        expires_in,
        options={"download": filename},
    )
    return result["signedURL"]


def download_object(key: str) -> bytes:
    return bytes(_client().storage.from_(_bucket()).download(key))


def upload_object(key: str, content: bytes, content_type: str = "application/octet-stream") -> None:
    _client().storage.from_(_bucket()).upload(
        key,
        content,
        file_options={"content-type": content_type, "upsert": "true"},
    )


def ensure_bucket_exists() -> None:
    client = _client()
    buckets = client.storage.list_buckets()
    bucket_name = _bucket()
    if not any(b.name == bucket_name for b in buckets):
        client.storage.create_bucket(bucket_name, options={"public": False})
