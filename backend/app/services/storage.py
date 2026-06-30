from typing import Any

import boto3
from botocore.client import Config

from app.core.config import get_settings

settings = get_settings()


def get_s3_client() -> Any:
    # boto3's client factory is untyped without the boto3-stubs[s3] extra —
    # not worth the added dependency just to type one return value.
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        use_ssl=settings.s3_use_ssl,
        config=Config(signature_version="s3v4"),
    )


def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 600) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.s3_bucket, "Key": key, "ContentType": content_type},
        ExpiresIn=expires_in,
    )


def generate_presigned_download_url(key: str, filename: str, expires_in: int = 600) -> str:
    """Lets users retrieve the original uploaded file — we never delete it after
    extraction, since OCR/extraction is lossy and the source should stay verifiable."""
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": key,
            "ResponseContentDisposition": f'attachment; filename="{filename}"',
        },
        ExpiresIn=expires_in,
    )


def download_object(key: str) -> bytes:
    client = get_s3_client()
    response = client.get_object(Bucket=settings.s3_bucket, Key=key)
    return response["Body"].read()


def upload_object(key: str, content: bytes, content_type: str = "application/octet-stream") -> None:
    """Server-side write — used for files the backend itself produces, e.g.
    members extracted from an uploaded ZIP (no client involved at that point)."""
    client = get_s3_client()
    client.put_object(Bucket=settings.s3_bucket, Key=key, Body=content, ContentType=content_type)


def ensure_bucket_exists() -> None:
    client = get_s3_client()
    existing = client.list_buckets().get("Buckets", [])
    if not any(b["Name"] == settings.s3_bucket for b in existing):
        client.create_bucket(Bucket=settings.s3_bucket)
