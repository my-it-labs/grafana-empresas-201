/** Utilidades compartidas — capturas con momento UI explícito */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../..");
export const CAPTURAS_M02 = path.join(REPO_ROOT, "docs/capturas/m02-explorando-interfaz");
export const BASE = process.env.GRAFANA_URL ?? "http://localhost:3000";
export const TESTDATA = { type: "grafana-testdata-datasource", uid: "grafana" };

export async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="user"]').fill(process.env.GRAFANA_USER ?? "admin");
  await page.locator('input[name="password"]').fill(process.env.GRAFANA_PASS ?? "admin");
  await page.getByRole("button", { name: /^log in$/i }).click();
  await page.waitForTimeout(1200);
  const skip = page
    .getByRole("link", { name: /^skip$/i })
    .or(page.getByRole("button", { name: /^skip$/i }));
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) await skip.click();
  await page.waitForSelector('[data-testid="data-testid Nav toolbar"]', { timeout: 20000 });
}

export async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
  }
}

export async function shot(page, name, opts = {}) {
  const file = path.join(CAPTURAS_M02, name);
  await page.screenshot({ path: file, ...opts });
  console.log("  📷", path.relative(REPO_ROOT, file));
}

export async function openAddMenu(page) {
  await dismissOverlays(page);
  await page.getByRole("button", { name: /^add$/i }).click({ force: true });
  await page.getByRole("menuitem", { name: /visualization|visualización/i }).waitFor({ timeout: 5000 });
}

export async function openPanelEditorFromNewDashboard(page) {
  await openAddMenu(page);
  await page.getByRole("menuitem", { name: /visualization|visualización/i }).click({ force: true });
  await page.waitForTimeout(3500);
  await page.locator('[data-testid="data-testid Select a data source"], [data-testid="data-testid query-editor-row"]').first().waitFor({ timeout: 15000 });
}

export async function openDatasourcePicker(page) {
  const ds = page.locator('[data-testid="data-testid Select a data source"]');
  await ds.click({ force: true });
  await ds.fill("grafana");
  await page.waitForTimeout(700);
}

export async function selectGrafanaTestData(page) {
  await openDatasourcePicker(page);
  await page.getByRole("button", { name: /-- Grafana --/ }).first().click({ force: true });
  await page.waitForTimeout(2000);
}

export async function setPanelTitle(page, title) {
  const titleInput = page.locator('#panel-title-input input, input[name="title"]').first();
  if (await titleInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    await titleInput.fill(title);
    await page.waitForTimeout(400);
  }
}

export async function focusPanelOptionSearch(page, term) {
  const search = page.getByPlaceholder("Search options");
  await search.waitFor({ timeout: 8000 });
  await search.fill("");
  await search.fill(term);
  await page.waitForTimeout(700);
}

export async function openUnitPicker(page) {
  await focusPanelOptionSearch(page, "Unit");
  await page.getByText("Unit", { exact: true }).click({ force: true });
  await page.waitForTimeout(400);
  const current = page
    .locator('[data-testid="data-testid Unit picker"]')
    .or(page.locator("button").filter({ hasText: /^(short|none|percent|bytes|decibel)/i }))
    .first();
  if (await current.isVisible({ timeout: 3000 }).catch(() => false)) {
    await current.click({ force: true });
    await page.waitForTimeout(500);
  }
}

export async function selectUnitPercent(page) {
  await openUnitPicker(page);
  const search = page.getByPlaceholder(/search|buscar/i).last();
  if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
    await search.fill("percent (0-100)");
    await page.waitForTimeout(500);
  }
  await page.getByText(/percent \(0-100\)/i).first().click({ force: true });
  await page.waitForTimeout(800);
}

export async function configureLegendLastMax(page) {
  await focusPanelOptionSearch(page, "Legend");
  const legendToggle = page.locator('[data-testid="data-testid Options group Legend toggle"]');
  if (await legendToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await legendToggle.click({ force: true });
    await page.waitForTimeout(400);
  }
  for (const calc of ["Last", "Max"]) {
    const toggle = page.getByLabel(calc).or(page.getByText(calc, { exact: true })).first();
    if (await toggle.isVisible({ timeout: 1500 }).catch(() => false)) {
      await toggle.click({ force: true }).catch(() => {});
    }
  }
  const bottom = page.getByText(/^Bottom$/i).or(page.getByLabel(/bottom/i)).first();
  if (await bottom.isVisible({ timeout: 1500 }).catch(() => false)) {
    await bottom.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(500);
}

export async function selectVisualization(page, name) {
  await dismissOverlays(page);
  const picker = page.locator('[data-testid="data-testid Panel editor viz picker"]').first();
  await picker.click({ force: true });
  await page.waitForTimeout(500);
  const re = new RegExp(`^${name}$`, "i");
  await page.getByRole("menuitemradio", { name: re }).click({ force: true }).catch(() =>
    page.getByRole("menuitem", { name: re }).click({ force: true }).catch(() =>
      page.getByText(re).first().click({ force: true })
    )
  );
  await page.waitForTimeout(2000);
}

/** Grafana 11: Apply o Back to dashboard confirman el panel en el tablero. */
export async function applyPanel(page) {
  const apply = page.getByRole("button", { name: /^apply$/i });
  if (await apply.isVisible({ timeout: 2000 }).catch(() => false)) {
    await apply.click({ force: true });
  } else {
    await page.getByRole("button", { name: /back to dashboard/i }).click({ force: true });
  }
  await page.waitForTimeout(2500);
}

export async function openSaveDashboardDialog(page) {
  await dismissOverlays(page);
  let saveBtn = page.getByRole("button", { name: /^save dashboard$/i });
  if (!(await saveBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
    await page.getByRole("button", { name: /^edit$/i }).click({ force: true });
    await page.waitForTimeout(1500);
    saveBtn = page.getByRole("button", { name: /^save dashboard$/i });
  }
  await saveBtn.click({ force: true }).catch(() =>
    page.locator('[data-testid="data-testid Save dashboard button"]').click({ force: true })
  );
  await page.waitForTimeout(1200);
  await page.locator('[role="dialog"]').filter({ hasText: /save dashboard|guardar/i }).first().waitFor({ timeout: 8000 });
}

export async function fillDashboardTitleInDialog(page, title) {
  const input = page.locator('[role="dialog"] input[type="text"], [role="dialog"] textarea').first();
  await input.waitFor({ timeout: 5000 });
  await input.fill(title);
  await page.waitForTimeout(400);
}

export async function confirmSaveDashboard(page) {
  await page.getByRole("button", { name: /^save$/i }).last().click({ force: true });
  await page.waitForTimeout(2500);
}

export async function editFirstPanel(page) {
  const header = page.locator('[data-testid*="Panel header"]').first();
  await header.hover();
  await page.locator('[data-testid*="Panel menu"]').first().click({ force: true });
  await page.getByRole("menuitem", { name: /^edit$|editar/i }).click({ force: true });
  await page.waitForTimeout(2500);
}

export async function seedDashboardViaApi(request, { title, uid, panels }) {
  const res = await request.post(`${BASE}/api/dashboards/db`, {
    headers: { "Content-Type": "application/json" },
    data: {
      dashboard: {
        title,
        uid,
        timezone: "browser",
        schemaVersion: 39,
        version: 1,
        panels,
      },
      overwrite: true,
    },
  });
  if (!res.ok()) throw new Error(`API dashboard ${title}: ${res.status()} ${await res.text()}`);
  return (await res.json()).url;
}

export function basicTimeseriesPanel(id = 1, { title = "CPU demo (TestData)", unit = "short", legendCalcs = [] } = {}) {
  return {
    id,
    type: "timeseries",
    title,
    gridPos: { h: 8, w: 24, x: 0, y: id === 1 ? 0 : 8 },
    datasource: TESTDATA,
    targets: [{ refId: "A", scenarioId: "random_walk", datasource: TESTDATA }],
    fieldConfig: {
      defaults: { unit, custom: { drawStyle: "line", lineWidth: 1 } },
      overrides: [],
    },
    options: {
      legend: {
        calcs: legendCalcs,
        displayMode: legendCalcs.length ? "table" : "list",
        placement: "bottom",
        showLegend: true,
      },
      tooltip: { mode: "single" },
    },
  };
}

export function basicBarChartPanel(id = 2, title = "Random walk (bar)") {
  return {
    id,
    type: "barchart",
    title,
    gridPos: { h: 8, w: 24, x: 0, y: 8 },
    datasource: TESTDATA,
    targets: [{ refId: "A", scenarioId: "random_walk", datasource: TESTDATA }],
    fieldConfig: { defaults: { unit: "short" }, overrides: [] },
    options: {
      legend: { showLegend: true, placement: "bottom" },
      orientation: "auto",
    },
  };
}

export async function waitForDashboardPanel(page) {
  await page
    .locator('[data-testid*="Panel header"], [data-testid*="panel header"], [data-testid="data-testid panel content"]')
    .first()
    .waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
}
