#!/usr/bin/env node
/**
 * Prueba de capturas automáticas — Grafana lab (M01 / M03).
 * Requiere: bash infra/up.sh
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(REPO_ROOT, "docs/capturas/_prueba");
const BASE = process.env.GRAFANA_URL ?? "http://localhost:3000";
const USER = process.env.GRAFANA_USER ?? "admin";
const PASS = process.env.GRAFANA_PASS ?? "admin";
const HEADED = process.env.HEADED === "1";

const log = [];
function step(name) {
  log.push(name);
  console.log(`→ ${name}`);
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📷 ${path.relative(REPO_ROOT, file)}`);
  return file;
}

async function waitGrafana() {
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

async function login(page) {
  await page.locator('input[name="user"]').fill(USER);
  await page.locator('input[name="password"]').fill(PASS);
  await page.getByRole("button", { name: /^log in$/i }).click();
  await page.waitForTimeout(1500);

  const skip = page
    .getByRole("link", { name: /^skip$/i })
    .or(page.getByRole("button", { name: /^skip$/i }));
  if (await skip.isVisible({ timeout: 8000 }).catch(() => false)) {
    await skip.click();
    await page.waitForLoadState("networkidle");
  }

  const newPassword = page.locator('input[name="newPassword"]');
  if (await newPassword.isVisible({ timeout: 2000 }).catch(() => false)) {
    await newPassword.fill(PASS);
    await page.locator('input[name="confirmNewPassword"]').fill(PASS);
    await page.getByRole("button", { name: /^submit$/i }).click();
    await page.waitForLoadState("networkidle");
  }

  await page.waitForSelector('[data-testid="data-testid Nav toolbar"]', {
    timeout: 20000,
  });
}

async function addPrometheusDatasource(page) {
  await page.goto(`${BASE}/connections/datasources/new`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);

  await page.getByRole("heading", { name: "Prometheus" }).click();
  await page.waitForURL(/datasources\/edit\//, { timeout: 15000 });
  await page.waitForLoadState("networkidle");

  const nameInput = page.locator('input[data-testid*="name"], input[name="name"]').first();
  if (await nameInput.isVisible({ timeout: 5000 })) {
    await nameInput.fill("Prometheus-Lab");
  }

  const urlInput = page.locator('input[placeholder*="http"], input[name="url"]').first();
  await urlInput.fill("http://prometheus:9090");

  await shot(page, "M03-prometheus-formulario");

  await page.getByRole("button", { name: /save & test|guardar y probar/i }).click();
  await page.waitForTimeout(3500);

  await shot(page, "M03-prometheus-save-test");
}

async function exploreMetrics(page) {
  await page.goto(`${BASE}/explore?orgId=1&left=%7B%22datasource%22:%22Prometheus-Lab%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22up%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(4000);
  await shot(page, "M03-explore-inicio");
  await shot(page, "M03-explore-prometheus-query");
}

async function main() {
  await waitGrafana();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: !HEADED,
    channel: "chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });
  const page = await context.newPage();

  try {
    step("Login Grafana");
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[name="user"]').waitFor({ state: "visible" });
    await shot(page, "M01-login-formulario");
    await login(page);
    await shot(page, "M01-login-home");

    step("Administration → General");
    await page.goto(`${BASE}/admin/general`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await shot(page, "M01-admin-general");

    step("Connections → Data sources");
    await page.goto(`${BASE}/connections/datasources`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1500);
    await shot(page, "M03-datasources-lista");

    step("Alta datasource Prometheus");
    await addPrometheusDatasource(page);

    step("Explore — consulta Prometheus");
    await exploreMetrics(page);

    await writeFile(
      path.join(OUT_DIR, "manifest.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          grafanaUrl: BASE,
          browser: "Google Chrome (system) via Playwright",
          steps: log,
          files: [
            "M01-login-formulario.png",
            "M01-login-home.png",
            "M01-admin-general.png",
            "M03-datasources-lista.png",
            "M03-prometheus-formulario.png",
            "M03-prometheus-save-test.png",
            "M03-explore-inicio.png",
            "M03-explore-prometheus-query.png",
          ],
        },
        null,
        2
      )
    );

    console.log("\nOK — capturas en docs/capturas/_prueba/");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
