#!/usr/bin/env node
/** Capturas M08 — usuarios, permisos, contact points */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import {
  BASE,
  CAPTURAS_M08,
  ensureFolder,
  login,
  shotIn,
  upsertOrgUser,
} from "./capture-utils.mjs";

async function main() {
  await mkdir(CAPTURAS_M08, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: process.env.HEADED !== "1" ? true : false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await login(page);

    await upsertOrgUser(page.request, {
      login: "viewer.lab",
      name: "Viewer Lab",
      email: "viewer@lab.local",
      password: "viewer",
      role: "Viewer",
    });
    await upsertOrgUser(page.request, {
      login: "editor.lab",
      name: "Editor Lab",
      email: "editor@lab.local",
      password: "editor",
      role: "Editor",
    });

    await page.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M08, "M08-01-users-lista.png");

    await page.goto(`${BASE}/admin/users/create`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M08, "M08-01-user-form.png");

    const bizFolder = await ensureFolder(page.request, { title: "Lab Business", uid: "lab-biz-cap" });

    await page.goto(`${BASE}/dashboards/f/${bizFolder}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    const permTab = page.getByRole("tab", { name: /permissions/i });
    if (await permTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await permTab.click({ force: true });
      await page.waitForTimeout(1200);
    } else {
      await page.getByRole("link", { name: /permissions/i }).click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
    }
    await shotIn(page, CAPTURAS_M08, "M08-02-folder-permissions.png");

    await page.goto(`${BASE}/alerting/notifications`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M08, "M08-03-contact-points.png");

    await page.goto(`${BASE}/alerting/routes`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M08, "M08-03-notification-policies.png");

    await page.goto(`${BASE}/alerting/silences`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shotIn(page, CAPTURAS_M08, "M08-03-silences.png");

    console.log("OK — capturas M08");
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
