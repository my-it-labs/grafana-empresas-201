#!/usr/bin/env python3
"""Genera JSON de dashboards de ejemplo importables para cada unidad del curso."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABS = ROOT / "labs"

PROM = {"type": "prometheus", "uid": "${DS_PROMETHEUS}"}
PG = {"type": "postgres", "uid": "${DS_POSTGRES}"}
LOKI = {"type": "loki", "uid": "${DS_LOKI}"}
TESTDATA = {"type": "grafana-testdata-datasource", "uid": "grafana"}
MIXED = {"type": "datasource", "uid": "-- Mixed --"}
DASHBOARD_DS = {"type": "datasource", "uid": "-- Dashboard --"}
GRAFANA_DS = {"type": "grafana", "uid": "-- Grafana --"}


def inputs(*plugins: str) -> list[dict]:
    mapping = {
        "prometheus": ("DS_PROMETHEUS", "Prometheus-Lab"),
        "postgres": ("DS_POSTGRES", "PostgreSQL-Lab"),
        "loki": ("DS_LOKI", "Loki-Lab"),
    }
    return [
        {
            "name": mapping[p][0],
            "label": mapping[p][1],
            "description": f"Selecciona {mapping[p][1]} al importar",
            "type": "datasource",
            "pluginId": p,
            "pluginName": p.capitalize() if p != "postgres" else "PostgreSQL",
        }
        for p in plugins
    ]


def dash(
    uid: str,
    title: str,
    tags: list[str],
    panels: list[dict],
    *,
    templating: list[dict] | None = None,
    ds_inputs: tuple[str, ...] = ("prometheus",),
    annotations: list[dict] | None = None,
    refresh: str = "30s",
    time_from: str = "now-6h",
) -> dict:
    d: dict = {
        "__inputs": inputs(*ds_inputs),
        "__requires": [
            {"type": "grafana", "id": "grafana", "name": "Grafana", "version": "11.5.0"},
            {"type": "datasource", "id": "prometheus", "name": "Prometheus", "version": "1.0.0"},
        ],
        "uid": uid,
        "title": title,
        "tags": ["lab", "example"] + tags,
        "timezone": "browser",
        "schemaVersion": 39,
        "version": 1,
        "refresh": refresh,
        "time": {"from": time_from, "to": "now"},
        "panels": panels,
        "templating": {"list": templating or []},
    }
    if annotations:
        d["annotations"] = {"list": annotations}
    return d


def ts_panel(
    pid: int,
    title: str,
    expr: str,
    y: int,
    *,
    h: int = 8,
    unit: str = "short",
    legend: str = "",
    ds=PROM,
    stack: str = "none",
    fill: int = 10,
    thresholds: list | None = None,
    targets: list | None = None,
) -> dict:
    steps = [{"color": "green", "value": None}]
    if thresholds:
        for val, color in thresholds:
            steps.append({"color": color, "value": val})
    t = targets or [
        {
            "datasource": ds,
            "editorMode": "code",
            "expr": expr,
            "legendFormat": legend or "__auto",
            "range": True,
            "refId": "A",
        }
    ]
    return {
        "id": pid,
        "type": "timeseries",
        "title": title,
        "gridPos": {"h": h, "w": 24, "x": 0, "y": y},
        "datasource": ds,
        "targets": t,
        "fieldConfig": {
            "defaults": {
                "unit": unit,
                "custom": {
                    "drawStyle": "line",
                    "lineWidth": 1,
                    "fillOpacity": fill,
                    "stacking": {"group": "A", "mode": stack},
                    "lineInterpolation": "smooth",
                    "showPoints": "never",
                },
                "thresholds": {"mode": "absolute", "steps": steps},
            },
            "overrides": [],
        },
        "options": {
            "legend": {"displayMode": "list", "placement": "bottom", "showLegend": True},
            "tooltip": {"mode": "multi"},
        },
    }


def dashboard_range_table(
    pid: int,
    title: str,
    source_panel_id: int,
    y: int,
    *,
    h: int = 8,
    unit: str = "Bps",
    reducers: list[str] | None = None,
) -> dict:
    """Tabla que hereda datos del panel origen y reduce Mean/Max sobre el rango temporal."""
    names = reducers or ["mean", "max"]
    rename = {"Field": "Interfaz", "Mean": "Media (B/s)", "Max": "Máximo (B/s)"}
    sort_col = rename.get("Max", "Max")
    return {
        "id": pid,
        "type": "table",
        "title": title,
        "gridPos": {"h": h, "w": 24, "x": 0, "y": y},
        "datasource": DASHBOARD_DS,
        "targets": [
            {
                "datasource": DASHBOARD_DS,
                "panelId": source_panel_id,
                "refId": "A",
                "withTransforms": False,
            }
        ],
        "fieldConfig": {
            "defaults": {"unit": unit},
            "overrides": [],
        },
        "options": {
            "showHeader": True,
            "sortBy": [{"desc": True, "displayName": sort_col}],
        },
        "transformations": [
            {
                "id": "reduce",
                "options": {
                    "includeTimeField": False,
                    "mode": "seriesToRows",
                    "reducers": names,
                },
            },
            {
                "id": "organize",
                "options": {"renameByName": rename},
            },
        ],
    }


def table_panel(
    pid: int,
    title: str,
    sql: str,
    y: int,
    *,
    h: int = 8,
    transforms: list | None = None,
    targets: list | None = None,
) -> dict:
    t = targets or [
        {
            "datasource": PG,
            "editorMode": "code",
            "format": "table",
            "rawSql": sql,
            "refId": "A",
        }
    ]
    p = {
        "id": pid,
        "type": "table",
        "title": title,
        "gridPos": {"h": h, "w": 24, "x": 0, "y": y},
        "datasource": PG,
        "targets": t,
        "fieldConfig": {"defaults": {}, "overrides": []},
        "options": {"showHeader": True, "sortBy": []},
    }
    if transforms:
        p["transformations"] = transforms
    return p


def stat_panel(pid: int, title: str, expr: str, x: int, y: int, *, w: int = 8, unit: str = "short") -> dict:
    return {
        "id": pid,
        "type": "stat",
        "title": title,
        "gridPos": {"h": 4, "w": w, "x": x, "y": y},
        "datasource": PROM,
        "targets": [
            {
                "datasource": PROM,
                "editorMode": "code",
                "expr": expr,
                "instant": True,
                "range": False,
                "refId": "A",
            }
        ],
        "fieldConfig": {
            "defaults": {"unit": unit, "thresholds": {"mode": "absolute", "steps": [{"color": "green", "value": None}]}},
            "overrides": [],
        },
        "options": {"reduceOptions": {"calcs": ["lastNotNull"]}, "orientation": "auto", "textMode": "auto"},
    }


def text_panel(pid: int, title: str, content: str, y: int, *, h: int = 3) -> dict:
    return {
        "id": pid,
        "type": "text",
        "title": title,
        "gridPos": {"h": h, "w": 24, "x": 0, "y": y},
        "options": {"mode": "markdown", "content": content},
    }


def row_panel(pid: int, title: str, y: int, *, collapsed: bool = False) -> dict:
    return {
        "id": pid,
        "type": "row",
        "title": title,
        "gridPos": {"h": 1, "w": 24, "x": 0, "y": y},
        "collapsed": collapsed,
        "panels": [],
    }


def var_query(name: str, label: str, query: str, *, multi: bool = True, all_value: str = ".*") -> dict:
    return {
        "name": name,
        "label": label,
        "type": "query",
        "datasource": PROM,
        "query": {"qryType": 1, "query": query, "refId": "PrometheusVariableQueryEditor-VariableQuery"},
        "definition": query,
        "includeAll": True,
        "multi": multi,
        "allValue": all_value,
        "refresh": 1,
        "sort": 1,
        "current": {},
        "options": [],
    }


def var_custom(name: str, label: str, values: str) -> dict:
    return {
        "name": name,
        "label": label,
        "type": "custom",
        "query": values,
        "includeAll": False,
        "multi": False,
        "current": {"text": values.split(",")[0], "value": values.split(",")[0]},
        "options": [],
    }


def var_interval() -> dict:
    return {
        "name": "interval",
        "label": "Resolución",
        "type": "interval",
        "query": "1m,5m,15m,30m,1h",
        "auto": True,
        "auto_count": 30,
        "auto_min": "10s",
        "current": {"text": "5m", "value": "5m"},
        "options": [],
    }


def var_region() -> dict:
    return {
        "name": "region",
        "label": "Región",
        "type": "query",
        "datasource": PG,
        "query": "SELECT code AS __text, code AS __value FROM regions ORDER BY 1",
        "definition": "SELECT code AS __text, code AS __value FROM regions ORDER BY 1",
        "includeAll": True,
        "multi": False,
        "allValue": ".*",
        "refresh": 1,
        "current": {},
        "options": [],
    }


def write(rel_path: str, doc: dict) -> None:
    path = LABS / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> None:
    print("Generando dashboards de ejemplo…")

    # M01
    write(
        "m01-introduccion-grafana/examples/lab-m01-03-stack-health.json",
        dash(
            "lab-m01-03-stack",
            "Lab M01-03 — Stack health",
            ["m01"],
            [
                stat_panel(1, "Grafana", "1", 0, 0),
                stat_panel(2, "Prometheus up", 'up{job="prometheus"}', 8, 0),
                stat_panel(3, "node-exporter up", 'up{job="node-exporter"}', 16, 0),
                text_panel(
                    4,
                    "Info",
                    "Dashboard de ejemplo tras levantar `infra/up.sh`. Importar y mapear **Prometheus-Lab**.",
                    4,
                ),
            ],
            ds_inputs=("prometheus",),
        ),
    )

    # M02
    write(
        "m02-explorando-interfaz/examples/lab-m02-02-timeseries-testdata.json",
        dash(
            "lab-m02-02",
            "Lab M02-02 — Time series TestData",
            ["m02", "testdata"],
            [
                {
                    "id": 1,
                    "type": "timeseries",
                    "title": "CPU demo (TestData)",
                    "gridPos": {"h": 10, "w": 24, "x": 0, "y": 0},
                    "datasource": TESTDATA,
                    "targets": [{"datasource": TESTDATA, "refId": "A", "scenarioId": "random_walk"}],
                    "fieldConfig": {"defaults": {"custom": {"drawStyle": "line"}}, "overrides": []},
                    "options": {"legend": {"displayMode": "list", "placement": "bottom", "showLegend": True}},
                }
            ],
            ds_inputs=(),
            refresh="",
        ),
    )

    write(
        "m02-explorando-interfaz/examples/lab-m02-03-config-panel.json",
        dash(
            "lab-m02-03",
            "Lab M02-03 — Config panel",
            ["m02"],
            [
                {
                    "id": 1,
                    "type": "timeseries",
                    "title": "CPU demo — unidad y leyenda",
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
                    "datasource": TESTDATA,
                    "targets": [{"datasource": TESTDATA, "refId": "A", "scenarioId": "random_walk", "alias": "CPU %"}],
                    "fieldConfig": {"defaults": {"unit": "percent", "custom": {"drawStyle": "line"}}, "overrides": []},
                },
                {
                    "id": 2,
                    "type": "barchart",
                    "title": "CPU demo — bar chart",
                    "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
                    "datasource": TESTDATA,
                    "targets": [{"datasource": TESTDATA, "refId": "A", "scenarioId": "random_walk"}],
                    "fieldConfig": {"defaults": {}, "overrides": []},
                },
            ],
            ds_inputs=(),
        ),
    )

    write(
        "m02-explorando-interfaz/examples/lab-m02-04-variables.json",
        dash(
            "lab-m02-04",
            "Lab M02-04 — Variables",
            ["m02", "variables"],
            [
                {
                    "id": 1,
                    "type": "timeseries",
                    "title": "CPU demo — $scenario",
                    "gridPos": {"h": 8, "w": 24, "x": 0, "y": 0},
                    "datasource": TESTDATA,
                    "targets": [
                        {
                            "datasource": TESTDATA,
                            "refId": "A",
                            "scenarioId": "$scenario",
                        }
                    ],
                    "fieldConfig": {"defaults": {}, "overrides": []},
                }
            ],
            templating=[var_custom("scenario", "Escenario demo", "random_walk,csv_metric"), var_interval()],
            ds_inputs=(),
        ),
    )

    # M03
    write(
        "m03-fuentes-datos/examples/lab-m03-datasources-smoke.json",
        dash(
            "lab-m03-smoke",
            "Lab M03 — Smoke datasources",
            ["m03"],
            [
                ts_panel(1, "up — targets scrapeados", "up", 0, unit="short"),
                ts_panel(
                    2,
                    "node_cpu_seconds_total (sample)",
                    'rate(node_cpu_seconds_total{job="node-exporter", mode="idle"}[5m])',
                    8,
                    unit="short",
                    legend="{{instance}}",
                ),
                table_panel(
                    3,
                    "Revenue diario (PostgreSQL)",
                    'SELECT day AS "time", SUM(revenue)::float AS value FROM daily_sales GROUP BY day ORDER BY 1',
                    16,
                ),
            ],
            ds_inputs=("prometheus", "postgres"),
            time_from="now-24h",
        ),
    )

    # M04
    write(
        "m04-paneles-personalizacion/examples/lab-m04-01-cpu-thresholds.json",
        dash(
            "lab-m04-01",
            "Lab M04-01 — CPU thresholds",
            ["m04"],
            [
                ts_panel(
                    1,
                    "CPU usage (node)",
                    '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                    0,
                    unit="percent",
                    thresholds=[(70, "yellow"), (90, "red")],
                    fill=20,
                )
            ],
        ),
    )

    write(
        "m04-paneles-personalizacion/examples/lab-m04-02-prom-sql.json",
        dash(
            "lab-m04-02",
            "Lab M04-02 — PromQL + SQL",
            ["m04"],
            [
                ts_panel(
                    1,
                    "Network RX by device",
                    'sum by (device) (rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))',
                    0,
                    unit="Bps",
                    legend="{{device}}",
                ),
                {
                    "id": 2,
                    "type": "timeseries",
                    "title": "Daily revenue (all regions)",
                    "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8},
                    "datasource": PG,
                    "targets": [
                        {
                            "datasource": PG,
                            "format": "time_series",
                            "rawSql": 'SELECT day AS "time", SUM(revenue)::float AS value FROM daily_sales GROUP BY day ORDER BY 1',
                            "refId": "A",
                        }
                    ],
                    "fieldConfig": {"defaults": {"unit": "currencyUSD"}, "overrides": []},
                },
            ],
            ds_inputs=("prometheus", "postgres"),
            time_from="now-30d",
        ),
    )

    write(
        "m04-paneles-personalizacion/examples/lab-m04-03-funciones.json",
        dash(
            "lab-m04-03",
            "Lab M04-03 — Funciones",
            ["m04"],
            [
                ts_panel(
                    1,
                    "CPU max (15m window)",
                    'max_over_time((100 - avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)[15m:])',
                    0,
                    unit="percent",
                ),
                table_panel(
                    2,
                    "HTTP latency & 5xx (6h)",
                    """SELECT service, AVG(latency_ms)::int AS avg_ms,
  COUNT(*) FILTER (WHERE status >= 500) AS errors_5xx
FROM http_events WHERE ts > NOW() - INTERVAL '6 hours'
GROUP BY service ORDER BY errors_5xx DESC""",
                    8,
                ),
            ],
            ds_inputs=("prometheus", "postgres"),
        ),
    )

    write(
        "m04-paneles-personalizacion/examples/lab-m04-04-filtros-region.json",
        dash(
            "lab-m04-04",
            "Lab M04-04 — Filtros región",
            ["m04", "variables"],
            [
                {
                    "id": 1,
                    "type": "timeseries",
                    "title": "Revenue — $region",
                    "gridPos": {"h": 8, "w": 24, "x": 0, "y": 0},
                    "datasource": PG,
                    "targets": [
                        {
                            "datasource": PG,
                            "format": "time_series",
                            "rawSql": """SELECT d.day AS "time", SUM(d.revenue)::float AS value
FROM daily_sales d JOIN regions r ON d.region_id = r.id
WHERE r.code = '${region}' GROUP BY d.day ORDER BY 1""",
                            "refId": "A",
                        }
                    ],
                },
                ts_panel(
                    2,
                    "Network TX by device",
                    'sum by (device) (rate(node_network_transmit_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))',
                    8,
                    unit="Bps",
                    legend="{{device}}",
                ),
            ],
            templating=[var_region()],
            ds_inputs=("prometheus", "postgres"),
            time_from="now-30d",
        ),
    )

    # Update network job/device dashboard with rate()
    write(
        "m04-paneles-personalizacion/examples/lab-network-rx-job-device.json",
        dash(
            "lab-network-rx-job-device",
            "Lab — Network RX job/device",
            ["m04", "network", "variables"],
            [
                ts_panel(
                    1,
                    "Network RX — max by device",
                    'max by (device) (rate(node_network_receive_bytes_total{job=~"$job", device=~"$device"}[5m]))',
                    0,
                    unit="Bps",
                    legend="{{device}}",
                ),
                dashboard_range_table(
                    2,
                    "Network RX — media y máximo por device (rango dashboard)",
                    1,
                    9,
                    h=8,
                ),
            ],
            templating=[
                var_query("job", "Job", "label_values(node_network_receive_bytes_total, job)"),
                var_query(
                    "device",
                    "Device",
                    'label_values(node_network_receive_bytes_total{job=~"$job"}, device)',
                ),
            ],
        ),
    )

    # M05
    write(
        "m05-visualizaciones-avanzadas/examples/lab-m05-01-series-temporales.json",
        dash(
            "lab-m05-01",
            "Lab M05-01 — Series temporales",
            ["m05"],
            [
                ts_panel(
                    1,
                    "CPU by mode (stacked)",
                    'sum by (mode) (rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait"}[5m])) * 100',
                    0,
                    unit="percent",
                    stack="normal",
                    fill=30,
                ),
                {
                    "id": 2,
                    "type": "timeseries",
                    "title": "CPU % vs Network RX",
                    "gridPos": {"h": 9, "w": 24, "x": 0, "y": 8},
                    "datasource": PROM,
                    "targets": [
                        {
                            "datasource": PROM,
                            "expr": '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                            "legendFormat": "CPU %",
                            "refId": "A",
                        },
                        {
                            "datasource": PROM,
                            "expr": 'sum(rate(node_network_receive_bytes_total{job="node-exporter"}[5m]))',
                            "legendFormat": "Network RX",
                            "refId": "B",
                        },
                    ],
                    "fieldConfig": {
                        "defaults": {"unit": "percent"},
                        "overrides": [
                            {
                                "matcher": {"id": "byFrameRefID", "options": "B"},
                                "properties": [
                                    {"id": "unit", "value": "Bps"},
                                    {"id": "custom.axisPlacement", "value": "right"},
                                ],
                            }
                        ],
                    },
                },
            ],
        ),
    )

    write(
        "m05-visualizaciones-avanzadas/examples/lab-m05-02-tablas.json",
        dash(
            "lab-m05-02",
            "Lab M05-02 — Tablas",
            ["m05"],
            [
                table_panel(
                    1,
                    "HTTP services (3h)",
                    """SELECT service, COUNT(*) AS requests, AVG(latency_ms)::int AS avg_ms,
  MAX(latency_ms) AS max_ms, COUNT(*) FILTER (WHERE status >= 500) AS errors
FROM http_events WHERE ts > NOW() - INTERVAL '3 hours'
GROUP BY service ORDER BY errors DESC, avg_ms DESC""",
                    0,
                ),
                table_panel(
                    2,
                    "Revenue by region (30d)",
                    """SELECT r.code AS region, SUM(d.orders) AS orders,
  ROUND(SUM(d.revenue)::numeric, 2) AS revenue
FROM daily_sales d JOIN regions r ON d.region_id = r.id
WHERE d.day > CURRENT_DATE - INTERVAL '30 days'
GROUP BY r.code ORDER BY revenue DESC""",
                    8,
                ),
            ],
            ds_inputs=("postgres",),
        ),
    )

    geomap_sql = """SELECT r.code AS name,
  CASE r.code WHEN 'EMEA' THEN 50.1109 WHEN 'APAC' THEN 35.6762 WHEN 'AMER' THEN 40.7128 END AS latitude,
  CASE r.code WHEN 'EMEA' THEN 8.6821 WHEN 'APAC' THEN 139.6503 WHEN 'AMER' THEN -74.0060 END AS longitude,
  SUM(d.revenue)::float AS value
FROM daily_sales d JOIN regions r ON d.region_id = r.id
WHERE d.day > CURRENT_DATE - INTERVAL '30 days' GROUP BY r.code"""
    write(
        "m05-visualizaciones-avanzadas/examples/lab-m05-03-geomap.json",
        dash(
            "lab-m05-03",
            "Lab M05-03 — Geomap",
            ["m05"],
            [
                {
                    "id": 1,
                    "type": "geomap",
                    "title": "Revenue by region (map)",
                    "gridPos": {"h": 14, "w": 24, "x": 0, "y": 0},
                    "datasource": PG,
                    "targets": [{"datasource": PG, "format": "table", "rawSql": geomap_sql, "refId": "A"}],
                    "fieldConfig": {"defaults": {}, "overrides": []},
                    "options": {
                        "view": {"id": "fit", "lat": 20, "lon": 0, "zoom": 1},
                        "basemap": {"type": "default", "name": "Layer 0"},
                        "layers": [
                            {
                                "type": "markers",
                                "config": {
                                    "name": "Revenue",
                                    "location": {"mode": "coords", "latitude": "latitude", "longitude": "longitude"},
                                    "style": {"size": {"field": "value", "fixed": 5, "max": 15, "min": 2}, "symbol": {"fixed": "img/icons/marker/circle.svg", "mode": "fixed"}},
                                    "text": {"field": "name"},
                                },
                            }
                        ],
                    },
                }
            ],
            ds_inputs=("postgres",),
            time_from="now-30d",
        ),
    )

    write(
        "m05-visualizaciones-avanzadas/examples/lab-m05-04-alertas.json",
        dash(
            "lab-m05-04",
            "Lab M05-04 — Alertas y umbrales",
            ["m05"],
            [
                ts_panel(
                    1,
                    "CPU usage — visual thresholds",
                    '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                    0,
                    unit="percent",
                    thresholds=[(70, "yellow"), (90, "red")],
                ),
                text_panel(
                    2,
                    "Alert rules",
                    "Reglas de alerta: **Alerting → Alert rules** (`Lab node-exporter down`, `Lab CPU high`). Los thresholds del panel son solo visuales.",
                    8,
                ),
            ],
        ),
    )

    # M06
    write(
        "m06-paneles-fuentes-personalizados/examples/lab-m06-01-biblioteca-base.json",
        dash(
            "lab-m06-01",
            "Lab M06-01 — Base library panel",
            ["m06", "library"],
            [
                ts_panel(
                    1,
                    "CPU usage — library candidate",
                    '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                    0,
                    unit="percent",
                ),
                text_panel(
                    2,
                    "Library panel",
                    "Convierte el panel CPU en **Library panel** (⋮ → Create library panel). Reutilízalo en otros dashboards del curso.",
                    8,
                    h=4,
                ),
            ],
        ),
    )

    write(
        "m06-paneles-fuentes-personalizados/examples/lab-m06-02-mixed.json",
        dash(
            "lab-m06-02",
            "Lab M06-02 — Mixed Prometheus + SQL",
            ["m06", "mixed"],
            [
                {
                    "id": 1,
                    "type": "timeseries",
                    "title": "Ops traffic vs revenue (Mixed A/B)",
                    "gridPos": {"h": 9, "w": 24, "x": 0, "y": 0},
                    "datasource": MIXED,
                    "targets": [
                        {
                            "datasource": PROM,
                            "editorMode": "code",
                            "expr": 'sum(rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))',
                            "legendFormat": "Network RX",
                            "range": True,
                            "refId": "A",
                        },
                        {
                            "datasource": PG,
                            "format": "time_series",
                            "rawSql": 'SELECT day AS time, SUM(revenue)::float AS value FROM daily_sales WHERE $__timeFilter(day) GROUP BY day ORDER BY day',
                            "refId": "B",
                        },
                    ],
                    "fieldConfig": {
                        "defaults": {"unit": "Bps"},
                        "overrides": [
                            {
                                "matcher": {"id": "byFrameRefID", "options": "B"},
                                "properties": [
                                    {"id": "unit", "value": "currencyUSD"},
                                    {"id": "custom.axisPlacement", "value": "right"},
                                ],
                            }
                        ],
                    },
                    "options": {
                        "legend": {"displayMode": "list", "placement": "bottom", "showLegend": True},
                        "tooltip": {"mode": "multi"},
                    },
                },
                {
                    "id": 2,
                    "type": "table",
                    "title": "Network RX — join by device (Prometheus A/B)",
                    "gridPos": {"h": 8, "w": 24, "x": 0, "y": 9},
                    "datasource": PROM,
                    "targets": [
                        {
                            "datasource": PROM,
                            "editorMode": "code",
                            "expr": 'avg by (device) (rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))',
                            "format": "table",
                            "instant": True,
                            "range": False,
                            "refId": "A",
                        },
                        {
                            "datasource": PROM,
                            "editorMode": "code",
                            "expr": 'max by (device) (rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))',
                            "format": "table",
                            "instant": True,
                            "range": False,
                            "refId": "B",
                        },
                    ],
                    "fieldConfig": {"defaults": {"unit": "Bps"}, "overrides": []},
                    "options": {"showHeader": True, "sortBy": [{"desc": True, "displayName": "Max (B/s)"}]},
                    "transformations": [
                        {"id": "merge", "options": {}},
                        {"id": "joinByField", "options": {"byField": "device", "mode": "outer"}},
                        {
                            "id": "organize",
                            "options": {
                                "renameByName": {
                                    "device": "Interfaz",
                                    "Value #A": "Avg (B/s)",
                                    "Value #B": "Max (B/s)",
                                },
                            },
                        },
                    ],
                },
                text_panel(
                    3,
                    "Runbook",
                    "## Lab M06-02\n\n- **Panel 1:** datasource **Mixed** — A Prometheus (RX) + B PostgreSQL (revenue).\n- **Panel 2:** solo Prometheus — queries A/B + **Merge** + **Join by field** (`device`).\n- En clase: comparar dual axis (panel 1) vs tabla unida por label (panel 2).",
                    17,
                    h=4,
                ),
            ],
            ds_inputs=("prometheus", "postgres"),
            time_from="now-6h",
        ),
    )

    # M07
    write(
        "m07-tableros-organizacion/examples/lab-m07-01-diseno-links.json",
        dash(
            "lab-m07-01",
            "Lab M07-01 — Diseño y links",
            ["m07"],
            [
                row_panel(1, "Ops", 0),
                stat_panel(2, "node-exporter up", 'up{job="node-exporter"}', 0, 1),
                ts_panel(
                    3,
                    "CPU usage",
                    '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                    1,
                    h=6,
                    unit="percent",
                ),
                row_panel(4, "Business", 7),
                stat_panel(5, "Revenue today", "0", 0, 8, w=12),
                text_panel(
                    6,
                    "Navegación",
                    "- [Lab M04-04 — Filtros región](/d/lab-m04-04)\n- [Lab M05-02 — Tablas](/d/lab-m05-02)\n- Tags: `lab`, `overview`, `m07`",
                    12,
                    h=5,
                ),
            ],
            ds_inputs=("prometheus",),
        ),
    )

    ann_http = {
        "builtIn": 0,
        "datasource": PG,
        "enable": True,
        "hide": False,
        "iconColor": "red",
        "name": "HTTP 5xx",
        "target": {
            "limit": 100,
            "matchAny": False,
            "tags": [],
            "type": "dashboard",
        },
        "type": "dashboard",
    }
    write(
        "m07-tableros-organizacion/examples/lab-m07-02-anotaciones.json",
        dash(
            "lab-m07-02",
            "Lab M07-02 — Anotaciones",
            ["m07", "annotations"],
            [
                ts_panel(
                    1,
                    "Network RX",
                    'sum(rate(node_network_receive_bytes_total{job="node-exporter"}[5m]))',
                    0,
                    unit="Bps",
                ),
                text_panel(
                    2,
                    "Anotaciones",
                    "Añade capa **Manual deploys** y query **HTTP 5xx** en Dashboard settings → Annotations.",
                    8,
                ),
            ],
            annotations=[
                ann_http,
                {
                    "builtIn": 1,
                    "datasource": GRAFANA_DS,
                    "enable": True,
                    "hide": False,
                    "iconColor": "rgba(0, 211, 255, 1)",
                    "name": "Annotations & Alerts",
                    "type": "dashboard",
                },
            ],
        ),
    )

    write(
        "m07-tableros-organizacion/examples/lab-m07-03-carpetas-playlist.json",
        dash(
            "lab-m07-03",
            "Lab M07-03 — Playlists",
            ["m07"],
            [
                stat_panel(1, "Dashboards lab", "1", 0, 0, w=24),
                text_panel(
                    2,
                    "Playlists",
                    "Organiza dashboards en carpetas **Lab Ops** / **Lab Business** y crea una **Playlist** con este tablero y `Lab M04-04`.",
                    4,
                ),
            ],
            ds_inputs=("prometheus",),
        ),
    )

    # M08
    write(
        "m08-administracion/examples/lab-m08-01-usuarios-roles.json",
        dash(
            "lab-m08-01",
            "Lab M08-01 — Usuarios y roles",
            ["m08", "rbac"],
            [
                ts_panel(1, "CPU (Viewer puede ver)", 'up{job="node-exporter"}', 0),
                text_panel(
                    2,
                    "RBAC",
                    "Prueba acceso con usuario **viewer** / **editor**. Viewer: solo lectura. Editor: puede editar paneles.",
                    8,
                ),
            ],
        ),
    )

    write(
        "m08-administracion/examples/lab-m08-02-permisos-carpetas.json",
        dash(
            "lab-m08-02",
            "Lab M08-02 — Permisos carpetas",
            ["m08"],
            [
                text_panel(
                    1,
                    "Carpetas",
                    "Guarda este dashboard en carpeta **Lab Ops**. Asigna permisos de carpeta a team **Lab Editors**.",
                    0,
                    h=6,
                )
            ],
            ds_inputs=(),
        ),
    )

    write(
        "m08-administracion/examples/lab-m08-03-contact-points.json",
        dash(
            "lab-m08-03",
            "Lab M08-03 — Contact points",
            ["m08", "alerting"],
            [
                ts_panel(1, "up{job=node-exporter}", 'up{job="node-exporter"}', 0),
                text_panel(
                    2,
                    "Alerting",
                    "Configura **Contact point** webhook y **Notification policy** en Alerting. Reglas en carpeta `Lab Alerts`.",
                    8,
                ),
            ],
        ),
    )

    # M09
    write(
        "m09-integraciones/examples/lab-m09-01-provisioned-export.json",
        dash(
            "lab-m09-01-export",
            "Lab M09-01 — Export provisioning",
            ["m09", "provisioning"],
            [
                ts_panel(
                    1,
                    "CPU idle % (exportable)",
                    '100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)',
                    0,
                    unit="percent",
                ),
                text_panel(
                    2,
                    "Git / provisioning",
                    "Exporta este JSON a `infra/grafana/provisioning/examples/dashboards/` y activa el volumen en docker-compose (M09-01).",
                    8,
                ),
            ],
        ),
    )

    write(
        "m09-integraciones/examples/lab-m09-02-api-import.json",
        dash(
            "lab-m09-02-api",
            "Lab M09-02 — API import",
            ["m09", "api"],
            [
                stat_panel(1, "Importado vía API", 'count(up)', 0, 0, w=12),
                text_panel(
                    2,
                    "API",
                    "Importar con `POST /api/dashboards/db` y script `scripts/lab-api-demo.sh`.",
                    4,
                ),
            ],
        ),
    )

    # README index
    readme = """# Dashboards de ejemplo (importables)

JSON listos para **Dashboards → Import** en Grafana 11.

| Archivo | Unidad |
|---------|--------|
"""
    for path in sorted(LABS.glob("**/examples/*.json")):
        rel = path.relative_to(LABS)
        readme += f"| [{rel.name}](../{rel.parent.parent.name}/{rel.parent.name}/{rel.name}) | {rel.parent.parent.name} |\n"

    readme += """
## Importar

1. **Dashboards → Import → Upload JSON**
2. Mapea datasources: `Prometheus-Lab`, `PostgreSQL-Lab`, `Loki-Lab` (según el dashboard)
3. TestData (`-- Grafana --`) no requiere mapeo

Los UIDs (`lab-m04-01`, etc.) permiten enlaces entre dashboards del curso.
"""
    (LABS / "examples" / "README.md").parent.mkdir(parents=True, exist_ok=True)
    (LABS / "examples" / "README.md").write_text(readme, encoding="utf-8")
    print(f"  wrote labs/examples/README.md")


if __name__ == "__main__":
    main()
