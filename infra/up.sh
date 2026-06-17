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
    break
  fi
  sleep 3
done

if ! curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; then
  echo "ERROR: Grafana no respondió a tiempo. Revisa: docker compose logs grafana --tail 50" >&2
  exit 1
fi

echo "Esperando Prometheus y target node-exporter..."
for _ in $(seq 1 30); do
  if curl -fsS http://localhost:9090/-/ready >/dev/null 2>&1; then
    TARGETS="$(curl -fsS http://localhost:9090/api/v1/targets 2>/dev/null || true)"
    if echo "$TARGETS" | grep -q '"job":"node-exporter"' && echo "$TARGETS" | grep -q '"health":"up"'; then
      echo "Listo: node-exporter scrapeable (up=1 en Prometheus)."
      docker compose ps
      exit 0
    fi
  fi
  sleep 2
done

echo "WARN: Grafana OK pero node-exporter no aparece UP en Prometheus." >&2
echo "  Diagnóstico:" >&2
echo "    docker compose ps node-exporter" >&2
echo "    docker compose logs node-exporter --tail 30" >&2
echo "    curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool" >&2
echo "  Ver infra/README.md → «node-exporter no funciona»." >&2
docker compose ps
exit 1
