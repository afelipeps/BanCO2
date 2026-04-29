/**
 * Smoke 8 tabs × 2 viewports en Vercel preview — Paso 3 CLOSEOUT F2.
 *
 * Captura console.error (críticos) y page errors (uncaught) por tab.
 * Gate: 0 errores rojos por celda. Warnings amarillos OK (informativos).
 *
 * Uso:
 *   node audit/baseline/smoke_preview.mjs --url <preview-url>
 *
 * Output: tabla con sección × viewport · status · errors · warnings.
 * Exit 0 si total errores = 0; exit 1 si cualquier error.
 */
import { chromium } from 'playwright';
import { argv } from 'node:process';

const args = Object.fromEntries(
  argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const URL = args.url;
if (!URL) {
  console.error('--url <preview-url> required');
  process.exit(2);
}
// Vercel deployment-protection bypass token (opcional)
const BYPASS = args['bypass-token'] ?? process.env.VERCEL_BYPASS_TOKEN;
const extraHeaders = BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {};

const SECTIONS = [
  { id: 'geografia', label: '1. Geografía' },
  { id: 'poblacion', label: '2. Población' },
  { id: 'ambiental', label: '3. Ambiental' },
  { id: 'social', label: '4. Social' },
  { id: 'economica', label: '5. Economía' },
  { id: 'gobernanza', label: '6. Gobernanza' },
  { id: 'sostenibilidad', label: '7. Sostenibilidad' },
  { id: 'sroi', label: '8. SROI' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function ensureSidebarOpen(page, isMobile) {
  if (!isMobile) return;
  const hamburger = page.locator('header button:has(svg.lucide-menu)').first();
  if (await hamburger.isVisible().catch(() => false)) {
    await hamburger.click();
    await page.waitForTimeout(350);
  }
}

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      extraHTTPHeaders: extraHeaders,
    });
    const page = await context.newPage();
    const isMobile = vp.width < 1024;

    // Buffers globales del context (se filtran por tab abajo)
    const errors = [];
    const warnings = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Filtrar el warning [F2-debt] (es nuestro, dev-only — no debería
      // aparecer en preview pero por las dudas).
      if (text.includes('[F2-debt]')) return;
      if (type === 'error') errors.push(text);
      else if (type === 'warning') warnings.push(text);
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('aside nav button', { timeout: 10000 });
    } catch (err) {
      console.error(`FAIL navigate ${vp.name}: ${err.message}`);
      await context.close();
      continue;
    }

    for (const section of SECTIONS) {
      const errSnap = errors.length;
      const warnSnap = warnings.length;
      const peSnap = pageErrors.length;

      try {
        await ensureSidebarOpen(page, isMobile);
        const button = page.locator(`aside nav button:has-text("${section.label}")`);
        await button.click();
        await page.waitForTimeout(1500);
        await page.waitForLoadState('networkidle').catch(() => {});

        const newErrors = errors.length - errSnap;
        const newWarnings = warnings.length - warnSnap;
        const newPageErrors = pageErrors.length - peSnap;
        const totalErr = newErrors + newPageErrors;
        const status = totalErr === 0 ? 'OK' : 'FAIL';
        const tag = status === 'OK' ? 'OK  ' : 'FAIL';
        console.log(`${tag} ${section.id.padEnd(15)} ${vp.name.padEnd(8)} err=${totalErr} warn=${newWarnings}`);
        results.push({
          section: section.id,
          viewport: vp.name,
          status,
          errors: totalErr,
          warnings: newWarnings,
          errorMessages: errors.slice(errSnap).concat(pageErrors.slice(peSnap)),
        });
      } catch (err) {
        console.error(`FAIL ${section.id} ${vp.name}: ${err.message}`);
        results.push({ section: section.id, viewport: vp.name, status: 'FAIL', errors: 1, errorMessages: [err.message] });
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const totalErr = results.reduce((s, r) => s + (r.errors ?? 0), 0);
console.log(`\n${results.filter((r) => r.status === 'OK').length}/${results.length} OK · ${totalErr} errores totales`);

if (totalErr > 0) {
  console.error('\n=== Errores capturados ===');
  for (const r of results) {
    if (r.errors > 0) {
      console.error(`\n[${r.section} ${r.viewport}]`);
      r.errorMessages.forEach((m) => console.error(`  ${m}`));
    }
  }
  process.exit(1);
}
