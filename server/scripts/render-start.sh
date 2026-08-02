#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${SERVER_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is required."
  exit 1
fi

if [[ "${RUN_SEED_ON_DEPLOY:-false}" == "true" ]]; then
  echo "RUN_SEED_ON_DEPLOY=true, running seed..."
  node prisma/seed.js
else
  echo "RUN_SEED_ON_DEPLOY is not true, skipping seed."
fi

echo "Starting API..."
node src/index.js
