#!/bin/bash
set -e

# Railway provides DATABASE_URL as postgresql:// — convert to psycopg2 dialect
if [[ "${DATABASE_URL}" == postgresql://* ]]; then
    export DATABASE_URL="${DATABASE_URL/postgresql:\/\//postgresql+psycopg2://}"
fi

echo "Running database migrations..."
alembic upgrade head

echo "Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 2
