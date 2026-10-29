#!/usr/bin/env bash
# Nightly backup of the WHATPART database and uploaded photos, kept for 14 days.
# Installed to /opt/whatpart/ops/backup.sh and run by /etc/cron.d/whatpart.
# The search index is not backed up: it is rebuilt from the database (deploy.sh reindex).
#
# Restore the database:
#   gunzip -c /opt/whatpart/backups/db-YYYYMMDD-HHMM.sql.gz | docker exec -i whatpart-db-1 psql -U whatpart -d whatpart
set -euo pipefail

ROOT=/opt/whatpart
DEST=$ROOT/backups
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p "$DEST"
chmod 700 "$DEST"

# shellcheck disable=SC1091
. "$ROOT/.env"
docker exec whatpart-db-1 pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner \
  | gzip -9 > "$DEST/db-$STAMP.sql.gz.tmp"
mv "$DEST/db-$STAMP.sql.gz.tmp" "$DEST/db-$STAMP.sql.gz"

tar -C "$ROOT/data" -czf "$DEST/uploads-$STAMP.tar.gz" uploads

find "$DEST" -name 'db-*.sql.gz' -mtime +14 -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime +14 -delete
echo "backup $STAMP ok: $(du -h "$DEST/db-$STAMP.sql.gz" | cut -f1) database"
