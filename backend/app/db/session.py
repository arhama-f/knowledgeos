from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import get_settings

settings = get_settings()

# NullPool: serverless Lambda creates a new process per invocation. With the
# default QueuePool (size=5), 20 concurrent requests = 100 open connections,
# exhausting Railway's limit. NullPool opens and closes one connection per
# request, which is the correct pattern for short-lived serverless processes.
engine = create_engine(settings.database_url, poolclass=NullPool)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
