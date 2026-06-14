#!/usr/bin/env node
/** Capturas M05 — time series avanzado, tabla, geomap, alertas */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M05,
  dismissOverlays,
  ensureLabDatasources,
  login,
  promPanel,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M05, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    const ds = await ensureLabDatasources(page.request);
    const promUid = ds.prometheus.uid;
    const pgUid = ds.postgres.uid;

    // M05-01 — stacked CPU
    const stackedPanel = promPanel(1, {
      title: "CPU by mode (stacked)",
      expr: `sum by (mode) (rate(node_cpu_seconds_total{job="node-exporter", mode=~"user|system|iowait"}[5m])) * 100`,
      uid: promUid,
      unit: "percent",
      gridPos: { h: 9, w: 24, x: 0, y: 0 },
    });
    stackedPanel.fieldConfig.defaults.custom.stacking = { mode: "normal", group: "A" };
    stackedPanel.fieldConfig.defaults.custom.fillOpacity = 30;

    const dualPanel = {
      id: 2,
      type: "timeseries",
      title: "CPU % vs Network RX",
      gridPos: { h: 9, w: 24, x: 0, y: 9 },
      datasource: { type: "prometheus", uid: promUid },
      targets: [
        {
          refId: "A",
          expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          datasource: { type: "prometheus", uid: promUid },
        },
        {
          refId: "B",
          expr: `sum(rate(node_network_receive_bytes_total{job="node-exporter"}[5m]))`,
          datasource: { type: "prometheus", uid: promUid },
        },
      ],
      fieldConfig: {
        defaults: { unit: "percent" },
        overrides: [
          {
            matcher: { id: "byFrameRefID", options: "B" },
            properties: [
              { id: "unit", value: "Bps" },
              { id: "custom.axisPlacement", value: "right" },
            ],
          },
        ],
      },
      options: { legend: { showLegend: true, placement: "bottom" } },
    };

    const m0501Url = await seedDashboardViaApi(page.request, {
      title: "Lab M05-01",
      uid: "lab-m05-01-cap",
      panels: [stackedPanel, dualPanel],
    });
    await page.goto(`${BASE}${m0501Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M05, "M05-01-stacked-cpu.png");
    await page.locator('[data-testid*="Panel header"]').nth(1).scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(800);
    await shotIn(page, CAPTURAS_M05, "M05-01-dual-axis.png");

    // M05-02 — tabla ventas/HTTP
    const m0502Url = await seedDashboardViaApi(page.request, {
      title: "Lab M05-02",
      uid: "lab-m05-02-cap",
      panels: [
        {
          id: 1,
          type: "table",
          title: "HTTP services (3h)",
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          targets: [
            {
              refId: "A",
              rawSql: `SELECT service, COUNT(*) AS requests, AVG(latency_ms)::int AS avg_ms, COUNT(*) FILTER (WHERE status >= 500) AS errors FROM http_events WHERE ts > NOW() - INTERVAL '3 hours' GROUP BY service ORDER BY errors DESC`,
              format: "table",
              datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
            },
          ],
          fieldConfig: {
            defaults: {},
            overrides: [
              {
                matcher: { id: "byName", options: "errors" },
                properties: [
                  { id: "custom.cellOptions", value: { type: "color-background" } },
                  {
                    id: "thresholds",
                    value: {
                      mode: "absolute",
                      steps: [
                        { color: "green", value: null },
                        { color: "yellow", value: 1 },
                        { color: "red", value: 5 },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          id: 2,
          type: "table",
          title: "Sales by region (14d)",
          gridPos: { h: 8, w: 12, x: 12, y: 0 },
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          targets: [
            {
              refId: "A",
              rawSql: `SELECT r.code AS region, SUM(d.orders) AS orders, ROUND(SUM(d.revenue)::numeric, 2) AS revenue FROM daily_sales d JOIN regions r ON d.region_id = r.id WHERE d.day > CURRENT_DATE - INTERVAL '14 days' GROUP BY r.code ORDER BY revenue DESC`,
              format: "table",
              datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
            },
          ],
        },
      ],
    });
    await page.goto(`${BASE}${m0502Url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await shotIn(page, CAPTURAS_M05, "M05-02-tablas.png");

    // M05-03 — Geomap
    const geoPanel = {
      id: 1,
      type: "geomap",
      title: "Revenue by region (map)",
      gridPos: { h: 12, w: 24, x: 0, y: 0 },
      datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
      targets: [
        {
          refId: "A",
          rawSql: `SELECT r.code AS name, CASE r.code WHEN 'EMEA' THEN 50.1109 WHEN 'APAC' THEN 35.6762 WHEN 'AMER' THEN 40.7128 END AS latitude, CASE r.code WHEN 'EMEA' THEN 8.6821 WHEN 'APAC' THEN 139.6503 WHEN 'AMER' THEN -74.0060 END AS longitude, SUM(d.revenue)::float AS value FROM daily_sales d JOIN regions r ON d.region_id = r.id WHERE d.day > CURRENT_DATE - INTERVAL '30 days' GROUP BY r.code`,
          format: "table",
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
        },
      ],
      fieldConfig: {
        defaults: {
          custom: { hideFrom: { tooltip: false, viz: false, legend: false } },
        },
        overrides: [],
      },
      options: {
        view: { id: "coords", lat: 25, lon: 0, zoom: 1.5 },
        controls: { showZoom: true, showAttribution: true },
        basemap: { type: "default", name: "Layer 0" },
        layers: [
          {
            type: "markers",
            config: {
              style: { size: { field: "value", fixed: 5, max: 15, min: 2 }, color: { fixed: "dark-blue" } },
              name: "Revenue",
            },
            location: { mode: "coords", latitude: "latitude", longitude: "longitude" },
          },
        ],
      },
    };
    const m0503Url = await seedDashboardViaApi(page.request, {
      title: "Lab M05-03",
      uid: "lab-m05-03-cap",
      panels: [geoPanel],
    });
    await page.goto(`${BASE}${m0503Url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M05, "M05-03-geomap.png");

    // M05-04 — panel thresholds + alert rules UI
    const m0504Url = await seedDashboardViaApi(page.request, {
      title: "Lab M05-04",
      uid: "lab-m05-04-cap",
      panels: [
        promPanel(1, {
          title: "CPU usage — visual thresholds",
          expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          uid: promUid,
          unit: "percent",
          thresholds: {
            mode: "absolute",
            steps: [
              { color: "green", value: null },
              { color: "yellow", value: 70 },
              { color: "red", value: 90 },
            ],
          },
          gridPos: { h: 9, w: 24, x: 0, y: 0 },
        }),
        {
          id: 2,
          type: "text",
          title: "Alert rules",
          gridPos: { h: 4, w: 24, x: 0, y: 9 },
          options: { content: "Ver **Alerting → Alert rules** para reglas del lab.", mode: "markdown" },
        },
      ],
    });
    await page.goto(`${BASE}${m0504Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await shotIn(page, CAPTURAS_M05, "M05-04-panel-thresholds.png");

    await page.goto(`${BASE}/alerting/list`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M05, "M05-04-alert-rules-lista.png");

    await page.goto(`${BASE}/alerting/new/alerting`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await shotIn(page, CAPTURAS_M05, "M05-04-nueva-regla.png");

    console.log("OK — capturas M05");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
