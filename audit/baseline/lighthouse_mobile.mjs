/**
 * Lighthouse mobile × 3 corridas — Paso 5 CLOSEOUT F2.
 *
 * Corre Lighthouse mobile 3 veces sobre preview F2 + 1 sobre prod main
 * (referencia). Reporta mediana de las 3 corridas preview vs prod.
 *
 * Gates:
 *   - Performance ≥ 40 (tolerancia -6 vs baseline F0=46)
 *   - LCP ≤ 4500 ms (tolerancia +6% vs baseline F0=4239 ms)
 *   - Accessibility ≥ 94 (no regresar vs F0=94)
 *
 * Uso:
 *   node audit/baseline/lighthouse_mobile.mjs --preview <url> [--bypass-token <t>]
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
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

async function runLighthouse(url, headers = {}) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
  const opts = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance', 'accessibility'],
    port: chrome.port,
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    extraHeaders: headers,
  };
  try {
    const runnerResult = await lighthouse(url, opts);
    const lhr = runnerResult.lhr;
    return {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
      fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
      tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
      cls: lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3),
    };
  } finally {
    // Windows: chrome-launcher rmSync sobre el temp dir a veces falla por
    // file lock. Ignorar — proceso ya terminó.
    try { await chrome.kill(); } catch (e) { /* ignore */ }
  }
}

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const previewRuns = [];
console.log(`=== Lighthouse mobile × 3 corridas @ preview ===`);
for (let i = 0; i < 3; i++) {
  const r = await runLighthouse(PREVIEW_URL, BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {});
  console.log(`  run ${i + 1}: perf=${r.performance} a11y=${r.accessibility} lcp=${r.lcp}ms tbt=${r.tbt}ms cls=${r.cls}`);
  previewRuns.push(r);
}

console.log(`\n=== Lighthouse mobile × 1 corrida @ prod (referencia) ===`);
const prodRun = await runLighthouse(PROD_URL);
console.log(`  prod: perf=${prodRun.performance} a11y=${prodRun.accessibility} lcp=${prodRun.lcp}ms tbt=${prodRun.tbt}ms cls=${prodRun.cls}`);

const previewMedian = {
  performance: median(previewRuns.map((r) => r.performance)),
  accessibility: median(previewRuns.map((r) => r.accessibility)),
  lcp: median(previewRuns.map((r) => r.lcp)),
};

console.log(`\n=== Mediana preview vs prod ===`);
console.log(`Performance:   preview=${previewMedian.performance}  prod=${prodRun.performance}  delta=${previewMedian.performance - prodRun.performance}`);
console.log(`Accessibility: preview=${previewMedian.accessibility}  prod=${prodRun.accessibility}  delta=${previewMedian.accessibility - prodRun.accessibility}`);
console.log(`LCP (ms):      preview=${previewMedian.lcp}  prod=${prodRun.lcp}  delta=${previewMedian.lcp - prodRun.lcp}`);

const gates = [
  { name: 'Performance ≥ 40', pass: previewMedian.performance >= 40, value: previewMedian.performance },
  { name: 'LCP ≤ 4500 ms', pass: previewMedian.lcp <= 4500, value: previewMedian.lcp },
  { name: 'Accessibility ≥ 94', pass: previewMedian.accessibility >= 94, value: previewMedian.accessibility },
];

console.log(`\n=== Gates ===`);
gates.forEach((g) => {
  const tag = g.pass ? 'PASS' : 'FAIL';
  console.log(`  ${tag} ${g.name} (got ${g.value})`);
});

const failed = gates.filter((g) => !g.pass);
if (failed.length > 0) {
  console.error(`\n${failed.length} gate(s) failed. Documentar en question/017.`);
  process.exit(1);
}
console.log(`\nAll gates PASS.`);
