/**
 * Captura baseline F2 — 8 secciones × 2 viewports = 16 PNGs.
 *
 * Uso:
 *   # arrancar build prod previamente:
 *   npm run build && npm run preview &  # localhost:4173
 *
 *   # capturar baseline pre-refactor:
 *   node audit/baseline/capture_v2.mjs --output v2
 *
 *   # capturar post-refactor:
 *   node audit/baseline/capture_v2.mjs --output v2-after
 *
 * Output: audit/baseline/<output>/<seccion>-<viewport>.png
 *
 * Estrategia: navegar a localhost:4173, esperar app montada, iterar sobre
 * los 8 tabs del sidebar. En desktop el sidebar arranca abierto; en mobile
 * hay que abrir el hamburguesa primero. Tras click en tab esperar
 * networkidle + 500 ms para animación fadeInUp + recharts mount.
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";

const args = Object.fromEntries(
  argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const OUTPUT_NAME = args.output ?? "v2";
const URL = args.url ?? "http://localhost:4173";

const OUT_DIR = resolve("audit/baseline", OUTPUT_NAME);
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const SECTIONS = [
  { id: "geografia", label: "1. Geografía" },
  { id: "poblacion", label: "2. Población" },
  { id: "ambiental", label: "3. Ambiental" },
  { id: "social", label: "4. Social" },
  { id: "economica", label: "5. Economía" },
  { id: "gobernanza", label: "6. Gobernanza" },
  { id: "sostenibilidad", label: "7. Sostenibilidad" },
  { id: "sroi", label: "8. SROI" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function ensureSidebarOpen(page, isMobile) {
  if (!isMobile) return;
  const hamburger = page.locator('header button:has(svg.lucide-menu)').first();
  if (await hamburger.isVisible().catch(() => false)) {
    await hamburger.click();
    await page.waitForTimeout(350);
  }
}

async function clickTab(page, label, isMobile) {
  await ensureSidebarOpen(page, isMobile);
  const button = page.locator(`aside nav button:has-text("${label}")`);
  await button.click();
  await page.waitForTimeout(700);
  await page.waitForLoadState("networkidle").catch(() => {});
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const isMobile = vp.width < 1024;

    try {
      await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForSelector("aside nav button", { timeout: 10000 });
    } catch (err) {
      console.error(`FAIL navigate ${vp.name}: ${err}`);
      await context.close();
      continue;
    }

    for (const section of SECTIONS) {
      const start = Date.now();
      try {
        await clickTab(page, section.label, isMobile);
        const path = resolve(OUT_DIR, `${section.id}-${vp.name}.png`);
        await page.screenshot({ path, fullPage: false, clip: { x: 0, y: 0, width: vp.width, height: vp.height } });
        const ms = Date.now() - start;
        results.push({ section: section.id, viewport: vp.name, status: "ok", ms, path });
        console.log(`OK  ${section.id.padEnd(15)} ${vp.name.padEnd(8)} ${ms}ms`);
      } catch (err) {
        results.push({
          section: section.id,
          viewport: vp.name,
          status: "fail",
          error: String(err),
        });
        console.error(`FAIL ${section.id} ${vp.name}: ${err}`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => r.status !== "ok");
console.log(`\n${results.length - failed.length}/${results.length} screenshots OK`);
if (failed.length) {
  console.error(`${failed.length} failed`);
  process.exit(1);
}
