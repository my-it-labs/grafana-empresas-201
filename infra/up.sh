#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "Arrancando stack del laboratorio..."
docker compose up -d

echo "Esperando Grafana (puerto 3000)..."
for _ in $(seq 1 40); do
  if curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "Listo: Grafana responde en http://localhost:3000"
    docker compose ps
    exit 0
  fi
  sleep 3
done

echo "ERROR: Grafana no respondió a tiempo. Revisa: docker compose logs grafana --tail 50" >&2
exit 1
