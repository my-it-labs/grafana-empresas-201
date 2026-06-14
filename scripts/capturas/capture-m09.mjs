#!/usr/bin/env node
/** Capturas M09 — export, provisioning-style dashboard, API import */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M09,
  dismissOverlays,
  ensureLabDatasources,
  login,
  promPanel,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M09, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);
    const ds = await ensureLabDatasources(page.request);
    const promUid = ds.prometheus.uid;

    const provUrl = await seedDashboardViaApi(page.request, {
      title: "Lab Provisioned — CPU",
      uid: "lab-provisioned-cpu",
      panels: [
        promPanel(1, {
          title: "CPU idle % (provisioned)",
          expr: `100 - (avg(rate(node_cpu_seconds_total{mode="idle", job="node-exporter"}[5m])) * 100)`,
          uid: promUid,
          unit: "percent",
          gridPos: { h: 9, w: 24, x: 0, y: 0 },
        }),
      ],
    });

    await page.goto(`${BASE}${provUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M09, "M09-01-dashboard-provisioned.png");

    await page.goto(`${BASE}${provUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    const shareBtn = page
      .getByRole("button", { name: /^share dashboard$|^share$|compartir/i })
      .or(page.locator('[data-testid="data-testid share-button"]'))
      .first();
    if (await shareBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await shareBtn.click({ force: true });
    } else {
      await page.goto(`${BASE}${provUrl}?shareView=link`, { waitUntil: "networkidle" });
    }
    await page.waitForTimeout(1500);
    const exportTab = page.getByRole("tab", { name: /export/i });
    if (await exportTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await exportTab.click({ force: true });
      await page.waitForTimeout(800);
    }
    await shotIn(page, CAPTURAS_M09, "M09-01-export-dialog.png");
    await page.keyboard.press("Escape");

    await page.request.post(`${BASE}/api/dashboards/db`, {
      headers: { "Content-Type": "application/json" },
      data: {
        dashboard: {
          uid: "lab-m09-api",
          title: "Lab M09-02 — API import",
          tags: ["lab", "api", "m09"],
          timezone: "browser",
          schemaVersion: 39,
          version: 1,
          panels: [
            {
              id: 1,
              type: "text",
              title: "Imported via API",
              gridPos: { h: 5, w: 24, x: 0, y: 0 },
              options: {
                mode: "markdown",
                content: "# Created by API\n\nScript: `scripts/lab-api-demo.sh`",
              },
            },
          ],
        },
        overwrite: true,
      },
    });

    await page.goto(`${BASE}/d/lab-m09-api/lab-m09-02-api-import`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M09, "M09-02-dashboard-api.png");

    await page.goto(`${BASE}/connections/datasources`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M09, "M09-01-datasources-lista.png");

    console.log("OK — capturas M09");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
