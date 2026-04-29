#!/usr/bin/env node
// measure_bundle.mjs — Compila gzip-sizes y deltas vs baseline para los 4 builds.
// Salida: results/bundle.json + tabla en stdout.
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BUILDS = [
  { name: 'baseline', dir: 'dist-baseline', label: 'React only (baseline)', charts: 0 },
  { name: 'recharts', dir: 'dist-recharts', label: 'Recharts custom (3 charts)', charts: 3 },
  { name: 'echarts', dir: 'dist-echarts', label: 'ECharts (3 charts)', charts: 3 },
  { name: 'plotly', dir: 'dist-plotly', label: 'Plotly basic-min (1 boxplot smoke)', charts: 1 },
];

function bytes(n) {
  return (n / 1024).toFixed(2) + ' KB';
}

function measureBuild(dir) {
  const assetsDir = join(ROOT, dir, 'assets');
  const files = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  let raw = 0;
  let gzip = 0;
  for (const f of files) {
    const buf = readFileSync(join(assetsDir, f));
    raw += buf.length;
    gzip += gzipSync(buf, { level: 9 }).length;
  }
  return { raw, gzip, files: files.length };
}

const baseline = measureBuild('dist-baseline');
const results = BUILDS.map((b) => {
  const m = measureBuild(b.dir);
  const deltaRaw = m.raw - baseline.raw;
  const deltaGzip = m.gzip - baseline.gzip;
  return {
    ...b,
    rawBytes: m.raw,
    gzipBytes: m.gzip,
    files: m.files,
    deltaRawBytes: deltaRaw,
    deltaGzipBytes: deltaGzip,
    perChartGzipBytes: b.charts > 0 ? Math.round(deltaGzip / b.charts) : 0,
  };
});

mkdirSync(join(ROOT, 'results'), { recursive: true });
writeFileSync(
  join(ROOT, 'results/bundle.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      baselineRawBytes: baseline.raw,
      baselineGzipBytes: baseline.gzip,
      builds: results,
      gateGzipDeltaTotal: 30 * 1024,
      gatePlotlyDelta: 500 * 1024,
    },
    null,
    2,
  ),
);

console.log('\nBundle measurement (vs React-only baseline):\n');
console.log('build              | raw     | gzip    | Δraw      | Δgzip     | Δgzip/chart');
console.log('-------------------|---------|---------|-----------|-----------|------------');
for (const r of results) {
  const cols = [
    r.name.padEnd(18),
    bytes(r.rawBytes).padStart(7),
    bytes(r.gzipBytes).padStart(7),
    (r.deltaRawBytes >= 0 ? '+' : '') + bytes(r.deltaRawBytes).padStart(8),
    (r.deltaGzipBytes >= 0 ? '+' : '') + bytes(r.deltaGzipBytes).padStart(8),
    r.charts > 0 ? bytes(r.perChartGzipBytes).padStart(10) : '—'.padStart(10),
  ];
  console.log(cols.join(' | '));
}
console.log('\nresults/bundle.json escrito.');
