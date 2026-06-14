#!/usr/bin/env node
/**
 * Capturas M02-03 — cada PNG = un paso distinto del lab.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M02,
  basicBarChartPanel,
  basicTimeseriesPanel,
  configureLegendLastMax,
  confirmSaveDashboard,
  dismissOverlays,
  fillDashboardTitleInDialog,
  focusPanelOptionSearch,
  login,
  openSaveDashboardDialog,
  openUnitPicker,
  seedDashboardViaApi,
  setPanelTitle,
  shot,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M02, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);

    const dashUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-02",
      uid: "lab-m02-02-capturas",
      panels: [basicTimeseriesPanel(1)],
    });

    await page.goto(`${BASE}${dashUrl}?editPanel=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);

    // 1. Campo Unit visible (Search options filtrado + picker abierto si es posible)
    await focusPanelOptionSearch(page, "Unit");
    await openUnitPicker(page);
    await shot(page, "M02-03-unidad-medida.png");

    // 2. Sección Legend con Last/Max
    await configureLegendLastMax(page);
    await shot(page, "M02-03-leyenda.png");

    // 3. Vista del panel refinado (%, leyenda con valores)
    const refinedUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-02",
      uid: "lab-m02-02-capturas",
      panels: [basicTimeseriesPanel(1, { unit: "percent", legendCalcs: ["last", "max"] })],
    });
    await page.goto(`${BASE}${refinedUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shot(page, "M02-03-panel-vista.png");

    // 4. Editor del segundo panel Bar chart
    const twoPanelUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-02",
      uid: "lab-m02-02-capturas",
      panels: [
        basicTimeseriesPanel(1, { unit: "percent", legendCalcs: ["last", "max"] }),
        basicBarChartPanel(2),
      ],
    });
    await page.goto(`${BASE}${twoPanelUrl}?editPanel=2`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await setPanelTitle(page, "Random walk (bar)");
    await dismissOverlays(page);
    await shot(page, "M02-03-bar-chart.png");

    // 5. Modal Save con Lab M02-03
    await page.goto(`${BASE}${twoPanelUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await openSaveDashboardDialog(page);
    await fillDashboardTitleInDialog(page, "Lab M02-03");
    await shot(page, "M02-03-save-dialog.png");

    // 6. Dashboard final con dos paneles
    await confirmSaveDashboard(page).catch(() => {});
    const finalUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-03",
      uid: "lab-m02-03-capturas",
      panels: [
        basicTimeseriesPanel(1, { unit: "percent", legendCalcs: ["last", "max"] }),
        basicBarChartPanel(2),
      ],
    });
    await page.goto(`${BASE}${finalUrl}`, { waitUntil: "networkidle" });
    await page.locator('[data-testid*="Panel header"]').nth(1).waitFor({ timeout: 10000 });
    await page.getByText("Lab M02-03").first().waitFor({ timeout: 10000 });
    await dismissOverlays(page);
    await shot(page, "M02-03-dashboard-guardado.png");

    console.log("OK — capturas M02-03");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
