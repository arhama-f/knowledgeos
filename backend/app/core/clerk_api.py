import httpx

from app.core.config import get_settings

settings = get_settings()
CLERK_API_BASE = "https://api.clerk.com/v1"


def _get(path: str) -> dict:
    response = httpx.get(
        f"{CLERK_API_BASE}{path}",
        headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def fetch_clerk_organization(org_id: str) -> dict:
    return _get(f"/organizations/{org_id}")


def fetch_clerk_user(user_id: str) -> dict:
    return _get(f"/users/{user_id}")
