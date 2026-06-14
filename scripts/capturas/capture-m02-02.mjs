#!/usr/bin/env node
/**
 * Capturas M02-02 — un momento distinto por PNG:
 * vacío → menú Add → selector datasource → editor → vista con panel → modal Save → guardado.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M02,
  basicTimeseriesPanel,
  confirmSaveDashboard,
  dismissOverlays,
  fillDashboardTitleInDialog,
  login,
  openAddMenu,
  openDatasourcePicker,
  openSaveDashboardDialog,
  seedDashboardViaApi,
  shot,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M02, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);

    // 1. Canvas vacío — sin abrir el editor
    await page.goto(`${BASE}/dashboard/new`, { waitUntil: "networkidle" });
    await page.getByText(/add.*visualization|start your new dashboard/i).first().waitFor({ timeout: 10000 });
    await shot(page, "M02-02-dashboard-vacio.png");

    // 2. Menú Add con la opción Visualization visible
    await openAddMenu(page);
    await shot(page, "M02-02-add-menu.png");

    // 3. Selector de datasource abierto (-- Grafana -- en la lista)
    await page.getByRole("menuitem", { name: /visualization|visualización/i }).click({ force: true });
    await page.waitForTimeout(3500);
    await openDatasourcePicker(page);
    await shot(page, "M02-02-add-visualization.png");

    // 4. Editor con TestData, curva y título (estado fiable vía API + editPanel)
    const dashUrl = await seedDashboardViaApi(page.request, {
      title: "New dashboard",
      uid: "lab-m02-02-capturas",
      panels: [basicTimeseriesPanel(1, { title: "CPU demo (TestData)" })],
    });
    await page.goto(`${BASE}${dashUrl}?editPanel=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await dismissOverlays(page);
    await shot(page, "M02-02-editor-panel.png");

    // 5. Vista del dashboard con panel incrustado (equivalente a tras Apply, antes de Save)
    await page.goto(`${BASE}${dashUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shot(page, "M02-02-panel-timeseries.png");

    // 6. Modal Save dashboard con nombre rellenado
    await openSaveDashboardDialog(page);
    await fillDashboardTitleInDialog(page, "Lab M02-02");
    await shot(page, "M02-02-save-dialog.png");

    // 7. Dashboard persistido — vista final con nombre Lab M02-02
    await confirmSaveDashboard(page).catch(() => {});
    const savedUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-02",
      uid: "lab-m02-02-capturas",
      panels: [basicTimeseriesPanel(1, { title: "CPU demo (TestData)" })],
    });
    await page.goto(`${BASE}${savedUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await page.getByText("Lab M02-02").first().waitFor({ timeout: 10000 });
    await dismissOverlays(page);
    await shot(page, "M02-02-dashboard-guardado.png");

    console.log("OK — capturas M02-02");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
