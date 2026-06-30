from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_liveness_does_not_require_dependencies():
    """`/health` must stay up even if DB/Redis/S3 are unreachable — that's what
    `/health/ready` is for. An orchestrator killing a healthy process because a
    downstream dependency blipped is worse than a slow request."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
