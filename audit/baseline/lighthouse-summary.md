# Lighthouse baseline - Fase 0

Generado: 2026-04-17 22:53

| Env | Viewport | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) |
|-----|----------|-----:|-----:|---:|----:|---------:|----:|---------:|
| prod | desktop | 74 | 90 | 96 | 90 | 1083 | 0 | 412 |
| prod | mobile | 46 | 94 | 96 | 90 | 4239 | 0 | 1787 |
| local | desktop | 28 | 90 | 96 | 82 | 7037 | 0 | 955 |
| local | mobile | 26 | 94 | 96 | 82 | 25039 | 0.014 | 2583 |

## Targets

- **prod** = https://evaluacionbanco2.com (rama `main`, Vercel)
- **local** = http://localhost:3000 (Vite dev server sobre `refactor/v2`)

## Notas

- JSONs crudos en `audit/baseline/raw/` (gitignored via `audit/**/raw/`).
- 1 run por combinacion (baseline, no median-of-5).
- Headless Chromium, preset desktop o mobile (throttling Lighthouse por defecto).
- Comparacion prod vs local permite medir el gap antes del refactor.
