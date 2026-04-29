/**
 * Smoke test de Playwright — baseline Fase 0.
 *
 * Captura screenshots fullPage del home en prod y local, con viewports
 * desktop (1440x900) y mobile (390x844). Los PNG quedan locales
 * (gitignored por audit/**\/*.png); sirven como baseline para visual
 * diff en Fase 4 y regression en Fase 7.
 *
 * Uso:
 *   node audit/baseline/smoke_playwright.mjs
 *
 * Requisitos: chromium instalado (`npx playwright install chromium`)
 * y dev server corriendo en http://localhost:3000.
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve("audit/baseline");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = [
  { env: "prod", url: "https://evaluacionbanco2.com" },
  { env: "local", url: "http://localhost:3000" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const { env, url } of TARGETS) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      const start = Date.now();
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        const path = resolve(OUT_DIR, `home-${env}-${vp.name}.png`);
        await page.screenshot({ path, fullPage: true });
        const ms = Date.now() - start;
        results.push({ env, viewport: vp.name, status: "ok", ms, path });
        console.log(`OK  ${env.padEnd(6)} ${vp.name.padEnd(8)} ${ms}ms`);
      } catch (err) {
        results.push({
          env,
          viewport: vp.name,
          status: "fail",
          error: String(err),
        });
        console.error(`FAIL ${env} ${vp.name}: ${err}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => r.status !== "ok");
if (failed.length) {
  console.error(`\n${failed.length} screenshot(s) fallaron`);
  process.exit(1);
}
console.log(`\nSMOKE OK: ${results.length} screenshots`);
