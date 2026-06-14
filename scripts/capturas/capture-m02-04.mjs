#!/usr/bin/env node
/** Capturas M02-04 — variables custom/interval y dashboard Lab M02-04 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M02,
  basicTimeseriesPanel,
  confirmSaveDashboard,
  customVariable,
  dismissOverlays,
  fillDashboardTitleInDialog,
  intervalVariable,
  login,
  openSaveDashboardDialog,
  seedDashboardViaApi,
  shotIn,
  waitForDashboardPanel,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M02, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);

    const basePanels = [
      basicTimeseriesPanel(1, {
        title: "CPU demo — $scenario",
        unit: "percent",
        legendCalcs: ["last", "max"],
      }),
    ];
    const templating = {
      list: [
        customVariable("scenario", "random_walk,csv_metric", "Escenario demo"),
        intervalVariable(),
      ],
    };

    const dashUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-03",
      uid: "lab-m02-04-capturas",
      panels: basePanels,
      templating,
    });

    // 1. Settings → Variables (lista)
    await page.goto(`${BASE}${dashUrl}?editview=settings`, { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: /^Variables$/i }).click();
    await page.waitForTimeout(1500);
    await shotIn(page, CAPTURAS_M02, "M02-04-variables-lista.png");

    // 2. Formulario variable custom scenario
    await page.goto(`${BASE}${dashUrl}?editview=variables&editIndex=0`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M02, "M02-04-variable-scenario-form.png");

    // 3. Vista dashboard con selectores superiores
    await page.goto(`${BASE}${dashUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M02, "M02-04-dashboard-selectors.png");

    // 4. Título con interpolación $scenario (editor)
    await page.goto(`${BASE}${dashUrl}?editPanel=1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M02, "M02-04-titulo-variable.png");

    // 5. Modal Save Lab M02-04
    await page.goto(`${BASE}${dashUrl}`, { waitUntil: "networkidle" });
    await waitForDashboardPanel(page);
    await openSaveDashboardDialog(page);
    await fillDashboardTitleInDialog(page, "Lab M02-04");
    await shotIn(page, CAPTURAS_M02, "M02-04-save-dialog.png");

    // 6. Dashboard guardado
    await confirmSaveDashboard(page).catch(() => {});
    const finalUrl = await seedDashboardViaApi(page.request, {
      title: "Lab M02-04",
      uid: "lab-m02-04-final",
      panels: [
        basicTimeseriesPanel(1, {
          title: "CPU demo — $scenario",
          unit: "percent",
          legendCalcs: ["last", "max"],
        }),
        basicTimeseriesPanel(2, { title: "Serie $scenario" }),
      ],
      templating,
    });
    await page.goto(`${BASE}${finalUrl}`, { waitUntil: "networkidle" });
    await page.getByText("Lab M02-04").first().waitFor({ timeout: 10000 });
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M02, "M02-04-dashboard-guardado.png");

    console.log("OK — capturas M02-04");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
