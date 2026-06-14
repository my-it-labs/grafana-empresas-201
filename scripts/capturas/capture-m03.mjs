#!/usr/bin/env node
/** Capturas M03 — catálogo DS, Prometheus, PostgreSQL, Loki, Explore */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M03,
  dismissOverlays,
  ensureLabDatasources,
  login,
  shotIn,
  waitGrafana,
} from "./capture-utils.mjs";

async function main() {
  await waitGrafana();
  await mkdir(CAPTURAS_M03, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);

    // M03-01 — catálogo Add datasource
    await page.goto(`${BASE}/connections/datasources/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await shotIn(page, CAPTURAS_M03, "M03-01-catalogo-fuentes.png");

    // M03-02 — listado (puede estar vacío antes de UI)
    await page.goto(`${BASE}/connections/datasources`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await shotIn(page, CAPTURAS_M03, "M03-02-datasources-lista.png");

    // Formulario Prometheus (UI)
    await page.goto(`${BASE}/connections/datasources/new`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Prometheus" }).click();
    await page.waitForURL(/datasources\/edit\//, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    const nameInput = page.locator('#basic-settings-name, input[data-testid*="name"], input[name="name"]').first();
    if (await nameInput.isVisible({ timeout: 5000 })) await nameInput.fill("Prometheus-Lab");
    await page.locator('input[placeholder*="http"], input[name="url"]').first().fill("http://prometheus:9090");
    await shotIn(page, CAPTURAS_M03, "M03-02-prometheus-formulario.png");
    await page.getByRole("button", { name: /save & test|guardar y probar/i }).click();
    await page.waitForTimeout(3500);
    await shotIn(page, CAPTURAS_M03, "M03-02-prometheus-save-test.png");

    const ds = await ensureLabDatasources(page.request);

    // Explore Prometheus up
    const promUid = ds.prometheus.uid;
    const exploreProm = `${BASE}/explore?orgId=1&left=${encodeURIComponent(
      JSON.stringify({
        datasource: promUid,
        queries: [{ refId: "A", expr: "up", range: true, datasource: { type: "prometheus", uid: promUid } }],
        range: { from: "now-1h", to: "now" },
      })
    )}`;
    await page.goto(exploreProm, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
    await dismissOverlays(page);
    await shotIn(page, CAPTURAS_M03, "M03-02-explore-up.png");

    // M03-03 — PostgreSQL form (UI fresh)
    await page.goto(`${BASE}/connections/datasources/new`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /PostgreSQL/i }).click();
    await page.waitForURL(/datasources\/edit\//, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.locator('#basic-settings-name').fill("PostgreSQL-Lab");
    await page.locator('input[name="host"], input[placeholder*="5432"]').first().fill("postgres:5432");
    await page.locator('input[name="database"], input[placeholder="Database"]').first().fill("lab");
    await page.locator('input[placeholder="Username"]').fill("grafana");
    await page.locator('input[placeholder="Password"]').fill("grafana");
    await shotIn(page, CAPTURAS_M03, "M03-03-postgres-formulario.png");
    await page.getByRole("button", { name: /save & test|guardar y probar/i }).click();
    await page.waitForTimeout(3500);
    await shotIn(page, CAPTURAS_M03, "M03-03-postgres-save-test.png");

    // Explore SQL
    const pgUid = ds.postgres.uid;
    const sql = `SELECT day AS "time", SUM(revenue)::float AS value FROM daily_sales GROUP BY day ORDER BY day`;
    const explorePg = `${BASE}/explore?orgId=1&left=${encodeURIComponent(
      JSON.stringify({
        datasource: pgUid,
        queries: [
          {
            refId: "A",
            rawSql: sql,
            format: "time_series",
            datasource: { type: "grafana-postgresql-datasource", uid: pgUid },
          },
        ],
        range: { from: "now-30d", to: "now" },
      })
    )}`;
    await page.goto(explorePg, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
    await shotIn(page, CAPTURAS_M03, "M03-03-explore-sql.png");

    // Loki form
    await page.goto(`${BASE}/connections/datasources/new`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Loki" }).click();
    await page.waitForURL(/datasources\/edit\//, { timeout: 15000 });
    await page.locator('#basic-settings-name').fill("Loki-Lab");
    await page.locator('input[name="url"], input[placeholder*="http"]').first().fill("http://loki:3100");
    await shotIn(page, CAPTURAS_M03, "M03-03-loki-formulario.png");
    await page.getByRole("button", { name: /save & test|guardar y probar/i }).click();
    await page.waitForTimeout(3000);
    await shotIn(page, CAPTURAS_M03, "M03-03-loki-save-test.png");

    // Explore Loki
    const lokiUid = ds.loki.uid;
    const exploreLoki = `${BASE}/explore?orgId=1&left=${encodeURIComponent(
      JSON.stringify({
        datasource: lokiUid,
        queries: [{ refId: "A", expr: '{job="demo-app"}', datasource: { type: "loki", uid: lokiUid } }],
        range: { from: "now-1h", to: "now" },
      })
    )}`;
    await page.goto(exploreLoki, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
    await shotIn(page, CAPTURAS_M03, "M03-03-explore-loki.png");

    // Listado final tres fuentes
    await page.goto(`${BASE}/connections/datasources`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await shotIn(page, CAPTURAS_M03, "M03-03-datasources-completas.png");

    console.log("OK — capturas M03");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
