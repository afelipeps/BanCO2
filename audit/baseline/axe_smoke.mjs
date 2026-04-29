/**
 * axe-core smoke retroactivo — Paso 4 CLOSEOUT F2.
 *
 * Corre axe sobre 2 URLs (preview F2 + production main) y reporta
 * delta violations. Gate: delta ≤ 0 (F2 no debe regresar a11y).
 *
 * Uso:
 *   node audit/baseline/axe_smoke.mjs --preview <url> [--bypass-token <t>]
 *   node audit/baseline/axe_smoke.mjs --prod <url>
 *   (corrida única) o sin --prod, solo --preview con bypass.
 *
 * Output JSON: { preview: {violations, ids}, prod: {...}, delta }.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { argv } from 'node:process';

const args = Object.fromEntries(
  argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const PREVIEW_URL = args.preview;
const PROD_URL = args.prod ?? 'https://evaluacionbanco2.com';
const BYPASS = args['bypass-token'] ?? process.env.VERCEL_BYPASS_TOKEN;

if (!PREVIEW_URL) {
  console.error('--preview <url> required');
  process.exit(2);
}

async function runAxe(url, headers = {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: headers,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('aside nav button', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await browser.close();
  return results;
}

console.log(`=== axe @ preview (${PREVIEW_URL}) ===`);
const preview = await runAxe(PREVIEW_URL, BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {});
console.log(`violations: ${preview.violations.length}, passes: ${preview.passes.length}`);
preview.violations.forEach((v) => {
  console.log(`  - ${v.id} (${v.impact ?? 'n/a'}, ${v.nodes.length} nodes): ${v.description.slice(0, 100)}`);
});

console.log(`\n=== axe @ prod (${PROD_URL}) ===`);
const prod = await runAxe(PROD_URL);
console.log(`violations: ${prod.violations.length}, passes: ${prod.passes.length}`);
prod.violations.forEach((v) => {
  console.log(`  - ${v.id} (${v.impact ?? 'n/a'}, ${v.nodes.length} nodes): ${v.description.slice(0, 100)}`);
});

const delta = preview.violations.length - prod.violations.length;
console.log(`\n=== Delta ===`);
console.log(`preview - prod = ${delta} violations`);

const previewIds = new Set(preview.violations.map((v) => v.id));
const prodIds = new Set(prod.violations.map((v) => v.id));
const newViolations = [...previewIds].filter((id) => !prodIds.has(id));
const fixedViolations = [...prodIds].filter((id) => !previewIds.has(id));

if (newViolations.length > 0) console.log(`new in F2: ${newViolations.join(', ')}`);
if (fixedViolations.length > 0) console.log(`fixed in F2: ${fixedViolations.join(', ')}`);

if (delta > 0 || newViolations.length > 0) {
  console.error(`\nGATE FAIL: F2 introduce a11y violations.`);
  process.exit(1);
}
console.log(`\nGATE PASS: F2 no regresa a11y (delta=${delta}, newViolations=${newViolations.length}).`);
