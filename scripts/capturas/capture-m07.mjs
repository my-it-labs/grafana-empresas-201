#!/usr/bin/env node
/** Capturas M07 — diseño, anotaciones, folders y playlists */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M07,
  customVariable,
  dismissOverlays,
  ensureFolder,
  ensureLabDatasources,
  login,
  promPanel,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M07, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    const ds = await ensureLabDatasources(page.request);
    const promUid = ds.prometheus.uid;
    const pgUid = ds.postgres.uid;

    const opsFolder = await ensureFolder(page.request, { title: "Lab Ops", uid: "lab-ops-cap" });
    const bizFolder = await ensureFolder(page.request, { title: "Lab Business", uid: "lab-biz-cap" });

    const m0401 = await seedDashboardViaApi(page.request, {
      title: "Lab M04-01",
      uid: "lab-m04-01-m07",
      panels: [
        promPanel(1, {
          title: "CPU usage (node)",
          expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          uid: promUid,
          unit: "percent",
          gridPos: { h: 6, w: 12, x: 0, y: 0 },
        }),
      ],
    });

    const m0701Url = await seedDashboardViaApi(page.request, {
      title: "Lab M07-01",
      uid: "lab-m07-01-cap",
      panels: [
        {
          id: 1,
          type: "row",
          title: "Ops",
          gridPos: { h: 1, w: 24, x: 0, y: 0 },
          collapsed: false,
        },
        promPanel(2, {
          title: "Targets UP",
          expr: `sum(up{job="node-exporter"})`,
          uid: promUid,
          gridPos: { h: 6, w: 8, x: 0, y: 1 },
        }),
        promPanel(3, {
          title: "Network RX",
          expr: `sum(rate(node_network_receive_bytes_total{job="node-exporter"}[5m]))`,
          uid: promUid,
          unit: "Bps",
          gridPos: { h: 6, w: 16, x: 8, y: 1 },
        }),
        {
          id: 4,
          type: "row",
          title: "Business",
          gridPos: { h: 1, w: 24, x: 0, y: 7 },
        },
        {
          id: 5,
          type: "text",
          title: "Index",
          gridPos: { h: 4, w: 24, x: 0, y: 8 },
          options: {
            mode: "markdown",
            content: "## Lab index\n- [M04-01 CPU](/d/lab-m04-01-m07)\n- Tags: `lab`, `overview`",
          },
        },
      ],
    });

    await page.goto(`${BASE}${m0701Url}?editview=settings`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /links/i }).click({ force: true }).catch(() => {});
    await page.waitForTimeout(1500);
    await shotIn(page, CAPTURAS_M07, "M07-01-settings-links.png");

    await page.goto(`${BASE}${m0701Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M07, "M07-01-dashboard-filas.png");

    const m0702Url = await seedDashboardViaApi(page.request, {
      title: "Lab M07-02",
      uid: "lab-m07-02-cap",
      panels: [
        promPanel(1, {
          title: "Network RX",
          expr: `sum(rate(node_network_receive_bytes_total{job="node-exporter", device!~"lo|veth.*"}[5m]))`,
          uid: promUid,
          unit: "Bps",
          gridPos: { h: 9, w: 24, x: 0, y: 0 },
        }),
      ],
    });

    await page.goto(`${BASE}${m0702Url}?editview=settings`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /annotations/i }).click({ force: true }).catch(() => {});
    await page.waitForTimeout(1500);
    await shotIn(page, CAPTURAS_M07, "M07-02-anotaciones-settings.png");

    await page.request.post(`${BASE}/api/annotations`, {
      headers: { "Content-Type": "application/json" },
      data: {
        dashboardUID: "lab-m07-02-cap",
        time: Date.now() - 3600000,
        timeEnd: Date.now() - 1800000,
        text: "Deploy demo v1.2",
        tags: ["deploy"],
      },
    });

    await page.goto(`${BASE}${m0702Url}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M07, "M07-02-dashboard-anotaciones.png");

    await seedDashboardViaApi(page.request, {
      title: "Lab M04-01 Ops",
      uid: "lab-m04-01-ops-cap",
      panels: [
        promPanel(1, {
          title: "CPU",
          expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          uid: promUid,
          unit: "percent",
          gridPos: { h: 6, w: 24, x: 0, y: 0 },
        }),
      ],
    });

    await page.goto(`${BASE}/dashboards`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await shotIn(page, CAPTURAS_M07, "M07-03-folders-browse.png");

    await page.goto(`${BASE}/playlists`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M07, "M07-03-playlists.png");

    console.log("OK — capturas M07");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
