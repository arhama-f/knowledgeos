#!/usr/bin/env bash
set -euo pipefail

# Restores Postgres from a backup produced by backup.sh. DESTRUCTIVE — overwrites
# the current database. Usage: ./scripts/restore.sh <backup-filename>
# Run with no argument to list available backups.

cd "$(dirname "$0")/.."
set -a
source .env
set +a

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

aws_cli() {
  docker run --rm -i \
    -e AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY}" \
    -e AWS_SECRET_ACCESS_KEY="${S3_SECRET_KEY}" \
    -v "${TMP_DIR}:/backup" \
    amazon/aws-cli --endpoint-url "${S3_ENDPOINT_URL}" "$@"
}

if [ $# -eq 0 ]; then
  echo "Usage: $0 <backup-filename>"
  echo "Available backups:"
  aws_cli s3 ls "s3://${S3_BUCKET}/backups/"
  exit 1
fi

BACKUP_FILE="$1"

echo "Downloading ${BACKUP_FILE}..."
aws_cli s3 cp "s3://${S3_BUCKET}/backups/${BACKUP_FILE}" "/backup/${BACKUP_FILE}"

echo "This will OVERWRITE the current database with ${BACKUP_FILE}."
read -r -p "Type 'yes' to continue: " confirmation
[ "$confirmation" = "yes" ] || { echo "Aborted."; exit 1; }

echo "Restoring..."
gunzip -c "${TMP_DIR}/${BACKUP_FILE}" | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U knowledgeos -d knowledgeos

echo "Restore complete."
