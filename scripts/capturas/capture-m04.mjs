#!/usr/bin/env node
/** Capturas M04 — paneles avanzados Lab M04-01 … M04-04 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M04,
  customVariable,
  dismissOverlays,
  ensureLabDatasources,
  focusPanelOptionSearch,
  login,
  promPanel,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

function cpuExpr() {
  return `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`;
}

function thresholdsCpu() {
  return {
    mode: "absolute",
    steps: [
      { color: "green", value: null },
      { color: "yellow", value: 70 },
      { color: "red", value: 90 },
    ],
  };
}

async function main() {
  await mkdir(CAPTURAS_M04, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    const ds = await ensureLabDatasources(page.request);
    const promUid = ds.prometheus.uid;
    const pgUid = ds.postgres.uid;

    // M04-01 — editor thresholds
    const m0401Url = await seedDashboardViaApi(page.request, {
      title: "Lab M04-01",
      uid: "lab-m04-01-cap",
      panels: [
        promPanel(1, {
          title: "CPU usage (node)",
          expr: cpuExpr(),
          uid: promUid,
          unit: "percent",
          thresholds: thresholdsCpu(),
          gridPos: { h: 9, w: 24, x: 0, y: 0 },
        }),
      ],
    });
    await page.goto(`${BASE}${m0401Url}?editPanel=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await focusPanelOptionSearch(page, "Thresholds");
    await page.waitForTimeout(600);
    await shotIn(page, CAPTURAS_M04, "M04-01-thresholds-editor.png");
    await page.goto(`${BASE}${m0401Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M04, "M04-01-dashboard-cpu.png");

    // M04-02 — Prom + SQL
    const m0402Url = await seedDashboardViaApi(page.request, {
      title: "Lab M04-02",
      uid: "lab-m04-02-cap",
      panels: [
        promPanel(1, {
          title: "Network RX by device",
          expr: `sum by (device) (rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))`,
          uid: promUid,
          unit: "Bps",
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
        }),
        {
          id: 2,
          type: "timeseries",
          title: "Daily revenue (all regions)",
          gridPos: { h: 8, w: 12, x: 12, y: 0 },
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          targets: [
            {
              refId: "A",
              rawSql: `SELECT day AS "time", SUM(revenue)::float AS value FROM daily_sales GROUP BY day ORDER BY 1`,
              format: "time_series",
              datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
            },
          ],
          fieldConfig: { defaults: { unit: "currencyUSD" }, overrides: [] },
          options: { legend: { showLegend: true, placement: "bottom" } },
        },
      ],
    });
    await page.goto(`${BASE}${m0402Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M04, "M04-02-dashboard-prom-sql.png");

    // M04-03 — tabla HTTP + prom
    const m0403Url = await seedDashboardViaApi(page.request, {
      title: "Lab M04-03",
      uid: "lab-m04-03-cap",
      panels: [
        promPanel(1, {
          title: "CPU max (15m window)",
          expr: `avg(100 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          uid: promUid,
          unit: "percent",
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
        }),
        {
          id: 2,
          type: "table",
          title: "HTTP latency & 5xx (6h)",
          gridPos: { h: 8, w: 12, x: 12, y: 0 },
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          targets: [
            {
              refId: "A",
              rawSql: `SELECT service, AVG(latency_ms)::int AS avg_ms, COUNT(*) FILTER (WHERE status >= 500) AS errors_5xx FROM http_events WHERE ts > NOW() - INTERVAL '6 hours' GROUP BY service ORDER BY errors_5xx DESC`,
              format: "table",
              datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
            },
          ],
          fieldConfig: {
            defaults: {},
            overrides: [
              {
                matcher: { id: "byName", options: "errors_5xx" },
                properties: [
                  {
                    id: "custom.cellOptions",
                    value: { type: "color-background", mode: "gradient" },
                  },
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
      ],
    });
    await page.goto(`${BASE}${m0403Url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M04, "M04-03-tabla-http.png");

    // M04-04 — variable region
    const regionVar = {
      ...customVariable("region", "EMEA,APAC,AMER", "Región"),
      datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
      definition: "SELECT code AS __text, code AS __value FROM regions ORDER BY 1",
      query: {
        queryType: "",
        rawSql: "SELECT code AS __text, code AS __value FROM regions ORDER BY 1",
        refId: "StandardVariableQuery",
      },
      type: "query",
    };
    const m0404Url = await seedDashboardViaApi(page.request, {
      title: "Lab M04-04",
      uid: "lab-m04-04-cap",
      templating: { list: [regionVar] },
      panels: [
        {
          id: 1,
          type: "timeseries",
          title: "Revenue — $region",
          gridPos: { h: 9, w: 24, x: 0, y: 0 },
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          targets: [
            {
              refId: "A",
              rawSql: `SELECT d.day AS "time", SUM(d.revenue)::float AS value FROM daily_sales d JOIN regions r ON d.region_id = r.id WHERE r.code = '$region' GROUP BY d.day ORDER BY 1`,
              format: "time_series",
              datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
            },
          ],
          fieldConfig: { defaults: { unit: "currencyUSD" }, overrides: [] },
        },
        promPanel(2, {
          title: "Network TX by device",
          expr: `sum by (device) (rate(node_network_transmit_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))`,
          uid: promUid,
          unit: "Bps",
          gridPos: { h: 8, w: 24, x: 0, y: 9 },
        }),
      ],
    });
    await page.goto(`${BASE}${m0404Url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M04, "M04-04-variable-region.png");
    await page.getByText("Región", { exact: false }).first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    await shotIn(page, CAPTURAS_M04, "M04-04-selector-region.png");

    console.log("OK — capturas M04");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
