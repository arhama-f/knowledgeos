#!/usr/bin/env bash
set -euo pipefail

# Dumps Postgres and uploads it to the same S3-compatible storage documents
# live in (under a backups/ prefix), then prunes down to the most recent N.
#
# Schedule via host crontab on the VPS, e.g. daily at 3am:
#   0 3 * * * cd /opt/knowledgeos && ./scripts/backup.sh >> /var/log/knowledgeos-backup.log 2>&1

cd "$(dirname "$0")/.."
set -a
source .env
set +a

RETENTION_COUNT="${BACKUP_RETENTION_COUNT:-14}"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
DUMP_FILE="knowledgeos-${TIMESTAMP}.sql.gz"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

aws_cli() {
  docker run --rm -i \
    -e AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}" \
    -e AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}" \
    -v "${TMP_DIR}:/backup" \
    amazon/aws-cli --endpoint-url "${S3_ENDPOINT_URL}" "$@"
}

echo "Dumping Postgres..."
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U knowledgeos -d knowledgeos | gzip > "${TMP_DIR}/${DUMP_FILE}"

echo "Uploading ${DUMP_FILE} to s3://${S3_BUCKET}/backups/..."
aws_cli s3 cp "/backup/${DUMP_FILE}" "s3://${S3_BUCKET}/backups/${DUMP_FILE}"

echo "Pruning old backups (keeping most recent ${RETENTION_COUNT})..."
aws_cli s3 ls "s3://${S3_BUCKET}/backups/" \
  | awk '{print $4}' | sort | head -n "-${RETENTION_COUNT}" | while read -r key; do
      [ -n "$key" ] || continue
      aws_cli s3 rm "s3://${S3_BUCKET}/backups/${key}"
      echo "Deleted old backup: ${key}"
    done

echo "Backup complete: ${DUMP_FILE}"
