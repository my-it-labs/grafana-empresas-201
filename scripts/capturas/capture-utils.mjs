/** Utilidades compartidas — capturas con momento UI explícito */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../..");
export const CAPTURAS_M02 = path.join(REPO_ROOT, "docs/capturas/m02-explorando-interfaz");
export const CAPTURAS_M03 = path.join(REPO_ROOT, "docs/capturas/m03-fuentes-datos");
export const CAPTURAS_M04 = path.join(REPO_ROOT, "docs/capturas/m04-paneles-personalizacion");
export const CAPTURAS_M05 = path.join(REPO_ROOT, "docs/capturas/m05-visualizaciones-avanzadas");
export const BASE = process.env.GRAFANA_URL ?? "http://localhost:3000";
export const TESTDATA = { type: "grafana-testdata-datasource", uid: "grafana" };

export async function waitGrafana() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`Grafana no responde en ${BASE}`);
}

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
  return shotIn(page, CAPTURAS_M02, name, opts);
}

export async function shotIn(page, dir, name, opts = {}) {
  const file = path.join(dir, name);
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

export async function seedDashboardViaApi(request, { title, uid, panels, templating = null }) {
  const dashboard = {
    title,
    uid,
    timezone: "browser",
    schemaVersion: 39,
    version: 1,
    panels,
  };
  if (templating) dashboard.templating = templating;
  const res = await request.post(`${BASE}/api/dashboards/db`, {
    headers: { "Content-Type": "application/json" },
    data: { dashboard, overwrite: true },
  });
  if (!res.ok()) throw new Error(`API dashboard ${title}: ${res.status()} ${await res.text()}`);
  return (await res.json()).url;
}

export async function upsertDatasource(request, spec) {
  const auth = {
    username: process.env.GRAFANA_USER ?? "admin",
    password: process.env.GRAFANA_PASS ?? "admin",
  };
  const listRes = await request.get(`${BASE}/api/datasources`, { ...auth });
  const list = await listRes.json();
  const existing = list.find((d) => d.name === spec.name);
  const body = { access: "proxy", orgId: 1, ...spec };
  if (existing) {
    const res = await request.put(`${BASE}/api/datasources/${existing.id}`, {
      ...auth,
      headers: { "Content-Type": "application/json" },
      data: { ...body, id: existing.id },
    });
    if (!res.ok()) throw new Error(`PUT datasource ${spec.name}: ${await res.text()}`);
    return existing.uid;
  }
  const res = await request.post(`${BASE}/api/datasources`, {
    ...auth,
    headers: { "Content-Type": "application/json" },
    data: body,
  });
  if (!res.ok()) throw new Error(`POST datasource ${spec.name}: ${await res.text()}`);
  return (await res.json()).datasource.uid;
}

export async function getDatasourceByName(request, name) {
  const res = await request.get(`${BASE}/api/datasources/name/${encodeURIComponent(name)}`, {
    username: process.env.GRAFANA_USER ?? "admin",
    password: process.env.GRAFANA_PASS ?? "admin",
  });
  if (!res.ok()) return null;
  return await res.json();
}

export async function ensureLabDatasources(request) {
  await upsertDatasource(request, {
    name: "Prometheus-Lab",
    type: "prometheus",
    url: "http://prometheus:9090",
    isDefault: true,
    jsonData: { httpMethod: "POST" },
  });
  await upsertDatasource(request, {
    name: "PostgreSQL-Lab",
    type: "grafana-postgresql-datasource",
    url: "postgres:5432",
    database: "lab",
    user: "grafana",
    secureJsonData: { password: "grafana" },
    jsonData: { sslmode: "disable", postgresVersion: 1600 },
  });
  await upsertDatasource(request, {
    name: "Loki-Lab",
    type: "loki",
    url: "http://loki:3100",
  });
  return {
    prometheus: await getDatasourceByName(request, "Prometheus-Lab"),
    postgres: await getDatasourceByName(request, "PostgreSQL-Lab"),
    loki: await getDatasourceByName(request, "Loki-Lab"),
  };
}

export function customVariable(name, query, label = name) {
  const values = query.split(",").map((v) => v.trim());
  return {
    current: { selected: true, text: values[0], value: values[0] },
    hide: 0,
    includeAll: false,
    label,
    multi: false,
    name,
    options: values.map((v, i) => ({
      selected: i === 0,
      text: v,
      value: v,
    })),
    query,
    skipUrlSync: false,
    type: "custom",
  };
}

export function intervalVariable(name = "interval", label = "Resolución") {
  return {
    auto: true,
    auto_count: 30,
    auto_min: "10s",
    current: { selected: false, text: "1m", value: "1m" },
    hide: 0,
    label,
    name,
    options: [
      { selected: true, text: "1m", value: "1m" },
      { selected: false, text: "5m", value: "5m" },
      { selected: false, text: "15m", value: "15m" },
    ],
    query: "1m,5m,15m,30m,1h",
    refresh: 2,
    skipUrlSync: false,
    type: "interval",
  };
}

export function promPanel(id, { title, expr, uid, gridPos, unit = "short", thresholds = null }) {
  const defaults = { unit, custom: { drawStyle: "line", lineWidth: 1, fillOpacity: 10 } };
  if (thresholds) {
    defaults.thresholds = thresholds;
  }
  return {
    id,
    type: "timeseries",
    title,
    gridPos: gridPos ?? { h: 8, w: 12, x: 0, y: (id - 1) * 8 },
    datasource: { type: "prometheus", uid },
    targets: [{ refId: "A", expr, datasource: { type: "prometheus", uid } }],
    fieldConfig: { defaults, overrides: [] },
    options: {
      legend: { calcs: [], displayMode: "list", placement: "bottom", showLegend: true },
      tooltip: { mode: "single" },
    },
  };
}

export async function openDashboardSettingsVariables(page) {
  await page.goto(`${BASE}/dashboard/new`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(500);
  const settings = page.getByRole("button", { name: /dashboard settings|ajustes/i }).first();
  if (await settings.isVisible({ timeout: 3000 }).catch(() => false)) {
    await settings.click({ force: true });
  } else {
    await page.locator('[aria-label*="Dashboard settings"], [data-testid*="dashboard-settings"]').first().click({ force: true }).catch(() =>
      page.getByRole("button", { name: /^settings$/i }).click({ force: true })
    );
  }
  await page.waitForTimeout(1200);
  await page.getByRole("tab", { name: /^variables$|variables/i }).click({ force: true });
  await page.waitForTimeout(800);
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
