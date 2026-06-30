# Deploying KnowledgeOS

## Local development
```
docker compose up -d --build
```
Bind-mounts + `--reload`, exposes every service's port on localhost.

---

## Recommended production path: Vercel (frontend) + Railway (backend)

This is the fastest path to a live URL with the least infrastructure to manage.

### Frontend → Vercel

**One-time setup (run from `frontend/`):**
```bash
npm i -g vercel
vercel login
vercel link          # creates .vercel/project.json — add it to .gitignore
```

Add these in the **Vercel dashboard → Settings → Environment Variables** (for Production):
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.railway.app/api` |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |
| `CLERK_SECRET_KEY` | `sk_live_...` |

**Add to GitHub repo secrets/variables** so CD can deploy automatically:
| Name | Type | Value |
|---|---|---|
| `VERCEL_TOKEN` | Secret | from vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Variable | from `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Variable | from `.vercel/project.json` |

After that, every push to `main` that passes CI automatically deploys to Vercel.

**Or skip GitHub Actions entirely** — connect the repo directly in the Vercel dashboard
(Settings → Git → Connect repository) and Vercel deploys automatically on every push.

### Backend → Railway

Railway runs Docker natively and includes managed Postgres + Redis.

1. [railway.app](https://railway.app) → New project → Deploy from GitHub repo
2. Add these services in Railway: **Postgres**, **Redis**, **MinIO** (or use AWS S3 instead)
3. Create a service from `backend/Dockerfile.prod` — set these env vars in Railway's dashboard:
   ```
   DATABASE_URL        = (Railway provides this automatically for Postgres)
   REDIS_URL           = (Railway provides this automatically for Redis)
   S3_ENDPOINT_URL     = your-minio-url or https://s3.amazonaws.com
   S3_ACCESS_KEY       = ...
   S3_SECRET_KEY       = ...
   S3_BUCKET           = documents
   CLERK_ISSUER        = https://your-app.clerk.accounts.dev
   CLERK_SECRET_KEY    = sk_live_...
   ANTHROPIC_API_KEY   = sk-ant-...
   OPENAI_API_KEY      = sk-...
   ENVIRONMENT         = production
   CORS_ORIGINS        = ["https://your-app.vercel.app"]
   ```
4. Also create Celery worker services from the same Docker image with these start commands:
   - `celery -A app.tasks.celery_app worker -Q ingestion --loglevel=info`
   - `celery -A app.tasks.celery_app worker -Q embedding --concurrency=8 --loglevel=info`
5. Run migrations once (Railway shell or one-off job):
   ```
   alembic upgrade head
   ```

Railway auto-deploys when `ghcr.io/<your-repo>/backend:latest` is updated by CI/CD.

---

## Alternative: VPS + Docker Compose (self-hosted everything)

### One-time VPS setup
1. Install Docker + Docker Compose plugin on the VPS.
2. `git clone` this repo to e.g. `/opt/knowledgeos`.
3. Copy `.env.example` to `.env` and fill in every value.
4. Point your domain's DNS A record at the VPS's IP.
5. First boot:
   ```
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
   ```
   Caddy automatically gets a Let's Encrypt certificate for `DOMAIN` on first start.

**GitHub Actions CD for VPS** — add these repo secrets/variables to activate the SSH deploy step:
| Name | Type | Value |
|---|---|---|
| `DEPLOY_HOST` | Variable | your VPS IP |
| `DEPLOY_USER` | Variable | ssh user |
| `DEPLOY_SSH_KEY` | Secret | private key |
| `DEPLOY_PATH` | Variable | `/opt/knowledgeos` |

---

## Health, logging, monitoring & backups

- **`GET /health`** — liveness (no deps). **`GET /health/ready`** — checks Postgres/Redis/S3.
- **Logging**: JSON lines on stdout (`app/core/logging.py`), one line per request with request-ID and duration.
- **Metrics**: `GET /metrics` — Prometheus format (request counts/latencies).
- **Celery monitoring (Flower)**: exposed on `127.0.0.1:5555` (VPS path) — reach via `ssh -L 5555:localhost:5555 you@your-vps`.
- **Error tracking**: set `SENTRY_DSN` in your env vars.
- **Backups**:
  ```
  ./scripts/backup.sh   # pg_dump → S3, prunes old backups
  ./scripts/restore.sh  # lists available, or restores a specific one
  ```
  Schedule via crontab: `0 3 * * * cd /opt/knowledgeos && ./scripts/backup.sh`
