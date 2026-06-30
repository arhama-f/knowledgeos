import hashlib
import secrets

KEY_PREFIX = "kos_"


def generate_api_key() -> tuple[str, str, str]:
    """Returns (full_key, display_prefix, key_hash). full_key is shown to the user exactly
    once at creation time; only key_hash is ever persisted."""
    full_key = f"{KEY_PREFIX}{secrets.token_urlsafe(32)}"
    display_prefix = full_key[: len(KEY_PREFIX) + 6]
    return full_key, display_prefix, hash_api_key(full_key)


def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()
