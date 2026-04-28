/**
 * Visual diff F2 — pixelmatch entre baseline pre-refactor (v2/) y
 * post-refactor (v2-after/). 8 secciones × 2 viewports = 16 PNGs.
 *
 * Gate F2: 16/16 PASS con diff < 0,1% pixels distintos.
 * pixelmatch config: { threshold: 0.1, includeAA: false }.
 *
 * Uso:
 *   node audit/baseline/diff_v2.mjs
 *
 * Output: audit/baseline/v2-diff/<seccion>-<viewport>.png con
 * píxeles diferentes coloreados en magenta. Stdout: tabla con %
 * y PASS/FAIL por celda.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASELINE_DIR = resolve('audit/baseline/v2');
const AFTER_DIR = resolve('audit/baseline/v2-after');
const DIFF_DIR = resolve('audit/baseline/v2-diff');

if (!existsSync(DIFF_DIR)) mkdirSync(DIFF_DIR, { recursive: true });

const SECTIONS = ['geografia', 'poblacion', 'ambiental', 'social', 'economica', 'gobernanza', 'sostenibilidad', 'sroi'];
const VIEWPORTS = ['desktop', 'mobile'];

const THRESHOLD_PCT = 0.1; // 0.1% del total de píxeles
const PIXELMATCH_OPTS = { threshold: 0.1, includeAA: false };

let pass = 0;
let fail = 0;
const results = [];

for (const section of SECTIONS) {
  for (const viewport of VIEWPORTS) {
    const filename = `${section}-${viewport}.png`;
    const baselinePath = resolve(BASELINE_DIR, filename);
    const afterPath = resolve(AFTER_DIR, filename);

    if (!existsSync(baselinePath) || !existsSync(afterPath)) {
      console.error(`MISS ${section.padEnd(15)} ${viewport.padEnd(8)} (baseline o after no existe)`);
      results.push({ section, viewport, status: 'miss' });
      fail++;
      continue;
    }

    const img1 = PNG.sync.read(readFileSync(baselinePath));
    const img2 = PNG.sync.read(readFileSync(afterPath));

    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.error(`SIZE ${section.padEnd(15)} ${viewport.padEnd(8)} baseline ${img1.width}x${img1.height} != after ${img2.width}x${img2.height}`);
      results.push({ section, viewport, status: 'size_mismatch' });
      fail++;
      continue;
    }

    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, PIXELMATCH_OPTS);
    const totalPixels = width * height;
    const diffPct = (diffPixels / totalPixels) * 100;
    const status = diffPct < THRESHOLD_PCT ? 'PASS' : 'FAIL';

    writeFileSync(resolve(DIFF_DIR, filename), PNG.sync.write(diff));

    const tag = status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`${tag} ${section.padEnd(15)} ${viewport.padEnd(8)} ${diffPct.toFixed(4).padStart(8)}% (${diffPixels}/${totalPixels})`);
    results.push({ section, viewport, status, diffPct, diffPixels, totalPixels });
    if (status === 'PASS') pass++;
    else fail++;
  }
}

console.log(`\n${pass}/${results.length} PASS · umbral <${THRESHOLD_PCT}% · pixelmatch threshold=${PIXELMATCH_OPTS.threshold} includeAA=${PIXELMATCH_OPTS.includeAA}`);

if (fail > 0) {
  console.error(`\n${fail} FAIL — diffs visibles en ${DIFF_DIR}`);
  process.exit(1);
}
