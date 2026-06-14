#!/usr/bin/env bash
# Demo API Grafana — curso M09-02. Requiere stack en marcha (infra/up.sh).
set -euo pipefail

BASE="${GRAFANA_URL:-http://localhost:3000}"
AUTH=(-u "${GRAFANA_USER:-admin}:${GRAFANA_PASS:-admin}")

echo "== Health =="
curl -sf "${AUTH[@]}" "$BASE/api/health" | python3 -m json.tool

echo "== Search Lab dashboards =="
curl -sf "${AUTH[@]}" "$BASE/api/search?type=dash-db&query=Lab" | python3 -m json.tool | head -30

echo "== Import dashboard Lab M09-02 =="
curl -sf "${AUTH[@]}" -X POST "$BASE/api/dashboards/db" \
  -H "Content-Type: application/json" \
  -d '{
    "dashboard": {
      "uid": "lab-m09-api",
      "title": "Lab M09-02 — API import",
      "tags": ["lab", "api", "m09"],
      "timezone": "browser",
      "schemaVersion": 39,
      "version": 1,
      "panels": [{
        "id": 1,
        "type": "text",
        "title": "Imported via API",
        "gridPos": {"h": 4, "w": 24, "x": 0, "y": 0},
        "options": {
          "mode": "markdown",
          "content": "# Created by API\n\nScript: `scripts/lab-api-demo.sh`"
        }
      }]
    },
    "overwrite": true
  }' | python3 -m json.tool

NOW=$(($(date +%s) * 1000))
echo "== Annotation deploy =="
curl -sf "${AUTH[@]}" -X POST "$BASE/api/annotations" \
  -H "Content-Type: application/json" \
  -d "{\"dashboardUID\":\"lab-m09-api\",\"time\":$NOW,\"text\":\"Deploy via API\",\"tags\":[\"deploy\",\"api\"]}" \
  | python3 -m json.tool

echo "Done. Open: $BASE/d/lab-m09-api/lab-m09-02-api-import"
