"""Orquesta 4 runs de Lighthouse (prod/local x desktop/mobile) y genera
audit/baseline/lighthouse-summary.md a partir de los JSON crudos.

Los JSON crudos van a audit/baseline/raw/ (gitignored vía audit/**/raw/).
Solo el summary.md se commitea.

Uso:
    .venv/Scripts/python.exe audit/baseline/run_lighthouse.py

Requisitos: dev server en http://localhost:3000 y `npx lighthouse` disponible.
Nota: en Windows, Lighthouse puede emitir EPERM al limpiar su tmp dir.
El JSON se genera igual; el error de cleanup se tolera.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

RAW_DIR = Path("audit/baseline/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)
SUMMARY = Path("audit/baseline/lighthouse-summary.md")

RUNS = [
    ("prod", "https://evaluacionbanco2.com", "desktop"),
    ("prod", "https://evaluacionbanco2.com", "mobile"),
    ("local", "http://localhost:3000", "desktop"),
    ("local", "http://localhost:3000", "mobile"),
]


def run_lighthouse(env: str, url: str, form_factor: str) -> Path:
    out = RAW_DIR / f"lighthouse-{env}-{form_factor}.json"
    cmd = [
        "npx",
        "lighthouse",
        url,
        "--output=json",
        f"--output-path={out}",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--quiet",
        "--chrome-flags=--headless=new --no-sandbox",
    ]
    if form_factor == "desktop":
        cmd.append("--preset=desktop")
    print(f"> {env:5s} {form_factor:8s} ...", flush=True)
    # shell=True en Windows para resolver npx.cmd
    subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=180)
    # El JSON se genera antes del eventual EPERM de cleanup; tolerar returncode.
    if not out.exists() or out.stat().st_size < 1000:
        raise RuntimeError(f"Lighthouse no produjo JSON valido para {env} {form_factor}")
    return out


def extract(report_path: Path) -> dict:
    report = json.loads(report_path.read_text(encoding="utf-8"))
    cats = report["categories"]
    audits = report["audits"]

    def score(cat: str) -> int | str:
        val = cats[cat]["score"]
        return round(val * 100) if val is not None else "n/a"

    def num(audit: str, decimals: int = 0) -> int | float | str:
        val = audits[audit].get("numericValue")
        if val is None:
            return "n/a"
        return round(val, decimals) if decimals else round(val)

    return {
        "perf": score("performance"),
        "a11y": score("accessibility"),
        "bp": score("best-practices"),
        "seo": score("seo"),
        "lcp_ms": num("largest-contentful-paint"),
        "cls": num("cumulative-layout-shift", 3),
        "tbt_ms": num("total-blocking-time"),
    }


def build_summary(results: list) -> str:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [
        "# Lighthouse baseline - Fase 0",
        "",
        f"Generado: {ts}",
        "",
        "| Env | Viewport | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) |",
        "|-----|----------|-----:|-----:|---:|----:|---------:|----:|---------:|",
    ]
    for env, _url, ff, m in results:
        lines.append(
            f"| {env} | {ff} | {m['perf']} | {m['a11y']} | {m['bp']} | "
            f"{m['seo']} | {m['lcp_ms']} | {m['cls']} | {m['tbt_ms']} |"
        )
    lines += [
        "",
        "## Targets",
        "",
        "- **prod** = https://evaluacionbanco2.com (rama `main`, Vercel)",
        "- **local** = http://localhost:3000 (Vite dev server sobre `refactor/v2`)",
        "",
        "## Notas",
        "",
        "- JSONs crudos en `audit/baseline/raw/` (gitignored via `audit/**/raw/`).",
        "- 1 run por combinacion (baseline, no median-of-5).",
        "- Headless Chromium, preset desktop o mobile (throttling Lighthouse por defecto).",
        "- Comparacion prod vs local permite medir el gap antes del refactor.",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    results = []
    for env, url, ff in RUNS:
        try:
            path = run_lighthouse(env, url, ff)
            results.append((env, url, ff, extract(path)))
        except Exception as exc:
            print(f"FAIL {env} {ff}: {exc}", file=sys.stderr)
            return 2

    SUMMARY.write_text(build_summary(results), encoding="utf-8")
    print(f"\nOK: {len(results)} runs -> {SUMMARY}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
