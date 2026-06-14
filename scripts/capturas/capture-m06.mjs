#!/usr/bin/env node
/** Capturas M06 — library panels y panel Mixed */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M06,
  createLibraryPanel,
  dismissOverlays,
  ensureLabDatasources,
  login,
  promPanel,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M06, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    const ds = await ensureLabDatasources(page.request);
    const promUid = ds.prometheus.uid;
    const pgUid = ds.postgres.uid;

    const cpuModel = promPanel(1, {
      title: "CPU usage (shared)",
      expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
      uid: promUid,
      unit: "percent",
      gridPos: { h: 8, w: 12, x: 0, y: 0 },
    });
    delete cpuModel.id;

    const lib = await createLibraryPanel(page.request, {
      name: "CPU usage — library",
      panelModel: cpuModel,
    });
    const libUid = lib.uid;

    const linkedPanel = (id, x) => ({
      id,
      type: "library-panel",
      title: "CPU usage (shared)",
      gridPos: { h: 8, w: 12, x, y: 0 },
      libraryPanel: { uid: libUid, name: "CPU usage — library" },
    });

    const m0601Url = await seedDashboardViaApi(page.request, {
      title: "Lab M06-01",
      uid: "lab-m06-01-cap",
      panels: [linkedPanel(1, 0), linkedPanel(2, 12)],
    });

    await page.goto(`${BASE}/library-panels`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M06, "M06-01-panel-library-lista.png");

    await page.goto(`${BASE}${m0601Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M06, "M06-01-dashboard-vinculado.png");

    const mixedPanel = {
      id: 1,
      type: "timeseries",
      title: "Ops traffic vs revenue",
      gridPos: { h: 10, w: 24, x: 0, y: 0 },
      datasource: { type: "datasource", uid: "-- Mixed --" },
      targets: [
        {
          refId: "A",
          expr: `sum(rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))`,
          datasource: { type: "prometheus", uid: promUid },
        },
        {
          refId: "B",
          rawSql: `SELECT day AS time, SUM(revenue)::float AS value FROM daily_sales WHERE $__timeFilter(day) GROUP BY day ORDER BY day`,
          format: "time_series",
          datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
        },
      ],
      fieldConfig: {
        defaults: { unit: "Bps" },
        overrides: [
          {
            matcher: { id: "byFrameRefID", options: "B" },
            properties: [
              { id: "unit", value: "currencyUSD" },
              { id: "custom.axisPlacement", value: "right" },
            ],
          },
        ],
      },
      options: { legend: { showLegend: true, placement: "bottom" } },
    };

    const m0602Url = await seedDashboardViaApi(page.request, {
      title: "Lab M06-02",
      uid: "lab-m06-02-cap",
      panels: [
        mixedPanel,
        {
          id: 2,
          type: "text",
          title: "Runbook",
          gridPos: { h: 4, w: 24, x: 0, y: 10 },
          options: {
            mode: "markdown",
            content: "## Lab M06-02\nMixed Prometheus + PostgreSQL",
          },
        },
      ],
    });

    await page.goto(`${BASE}${m0602Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await page.waitForTimeout(3000);
    await shotIn(page, CAPTURAS_M06, "M06-02-dashboard-mixed.png");

    await page.goto(`${BASE}${m0602Url}?editPanel=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    const transformTab = page.getByRole("tab", { name: /transform/i });
    if (await transformTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await transformTab.click({ force: true });
      await page.waitForTimeout(1200);
    }
    await shotIn(page, CAPTURAS_M06, "M06-02-editor-mixed.png");

    console.log("OK — capturas M06");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
