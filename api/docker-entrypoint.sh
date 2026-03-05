#!/bin/sh
set -eu

echo "Waiting for Postgres (via Prisma db push)..."

attempts="${PRISMA_DB_PUSH_MAX_ATTEMPTS:-30}"
sleep_seconds="${PRISMA_DB_PUSH_SLEEP_SECONDS:-2}"
i=1

while [ "$i" -le "$attempts" ]; do
  if npx prisma db push >/dev/null 2>&1; then
    echo "Prisma schema applied."
    break
  fi

  echo "Prisma db push failed (attempt $i/$attempts). Retrying in ${sleep_seconds}s..."
  i=$((i + 1))
  sleep "$sleep_seconds"
done

if [ "$i" -gt "$attempts" ]; then
  echo "ERROR: Prisma db push failed after $attempts attempts."
  exit 1
fi

exec "$@"
