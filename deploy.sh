#!/usr/bin/env bash
# Deploy the WHATPART app to the Contabo VPS.
#
# Layout on the VPS (/opt/whatpart, compose project "whatpart"):
#   db      PostgreSQL 17        data in ./data/postgres
#   search  Meilisearch          data in ./data/meili
#   app     this Next.js app     built from ./app, env from ./app.env
#   tools   one-off container for migrations / reindexing (profile "tools")
# Server config lives in ./ops. Deploys install the compose file and backup script; scheduled
# jobs (cron) are only installed on request with install-schedule.
# Caddy (in the n8n stack at /opt/n8n) joins the "whatpart" network and proxies
# whatpart.africa to whatpart-app:3000 with automatic HTTPS.
#
# Usage: ./deploy.sh                   upload, build, migrate, restart, health-check
#        ./deploy.sh rollback          restart on the previously deployed image
#        ./deploy.sh reindex           rebuild the search index from the database
#        ./deploy.sh backup            run a database + photo backup now
#        ./deploy.sh install-schedule  install the cron jobs in ops/whatpart.cron (opt-in)
#        ./deploy.sh remove-schedule   remove them again
set -euo pipefail

HOST="${DEPLOY_HOST:-root@169.58.243.163}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/whatpart_vps}"
SSH=(ssh -i "$KEY" -o BatchMode=yes "$HOST")
REMOTE=/opt/whatpart

health() {
  "${SSH[@]}" "for i in \$(seq 40); do
      if docker exec whatpart-app-1 wget -qO- http://127.0.0.1:3000/api/health 2>/dev/null | grep -q '\"ok\":true'; then echo healthy; exit 0; fi
      sleep 3
    done; echo 'app did not become healthy'; docker logs --tail 40 whatpart-app-1; exit 1"
}

case "${1:-deploy}" in
  rollback)
    "${SSH[@]}" "cd $REMOTE && docker tag whatpart-app:previous whatpart-app:latest && docker compose up -d --no-build app"
    health
    exit 0
    ;;
  reindex)
    "${SSH[@]}" "cd $REMOTE && docker compose run --rm tools npx tsx scripts/reindex.ts"
    exit 0
    ;;
  backup)
    "${SSH[@]}" "$REMOTE/ops/backup.sh"
    exit 0
    ;;
  install-schedule)
    # Opt-in: installs ops/whatpart.cron (nightly backups, nightly reindex, 15-minute deal refresh).
    "${SSH[@]}" "set -e; install -m 644 $REMOTE/app/ops/whatpart.cron /etc/cron.d/whatpart
      install -m 644 $REMOTE/app/ops/logrotate /etc/logrotate.d/whatpart; echo schedule installed"
    exit 0
    ;;
  remove-schedule)
    "${SSH[@]}" "rm -f /etc/cron.d/whatpart /etc/logrotate.d/whatpart; echo schedule removed"
    exit 0
    ;;
esac

cd "$(dirname "$0")"
echo "--> Uploading source to $HOST"
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude='.env*' --exclude=src/generated \
    --exclude=dist --exclude=public/uploads --exclude=uploads --exclude='*.log' -czf - . |
  "${SSH[@]}" "set -e; rm -rf $REMOTE/app.new; mkdir -p $REMOTE/app.new
    tar -xzf - -C $REMOTE/app.new
    rm -rf $REMOTE/app; mv $REMOTE/app.new $REMOTE/app"

echo "--> Installing server config (compose file, backup script)"
"${SSH[@]}" "set -e; cd $REMOTE
  install -m 600 app/ops/docker-compose.yml docker-compose.yml
  install -d -m 700 ops && install -m 700 app/ops/backup.sh ops/backup.sh
  docker compose config -q"

echo "--> Building image"
"${SSH[@]}" "set -e; cd $REMOTE
  docker image inspect whatpart-app:latest >/dev/null 2>&1 && docker tag whatpart-app:latest whatpart-app:previous || true
  docker compose build app tools"

echo "--> Applying database migrations"
"${SSH[@]}" "cd $REMOTE && docker compose run --rm tools npx prisma migrate deploy"

echo "--> Restarting app"
# db/search are only recreated if their compose config changed.
"${SSH[@]}" "cd $REMOTE && docker compose up -d db search app && docker image prune -f >/dev/null"
health
echo "--> Live: https://whatpart.africa"
