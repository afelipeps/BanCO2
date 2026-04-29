# Fase 0 — Baseline

Cierre formal antes de arrancar Fase 1 (auditoría indicador por indicador contra microdatos).

## Stack técnico instalado

| Categoría | Componente | Versión |
|---|---|---|
| MCPs (project scope, `.mcp.json`) | context7, chrome-devtools, playwright | latest |
| Python venv (`.venv/`) | duckdb / scipy / statsmodels / pandas / openpyxl | 1.5.2 / 1.17.1 / 0.14.6 / 3.0.2 / 3.1.5 |
| Node devDep | playwright | 1.59.1 |
| Browser | Chromium headless (Playwright) | 1217 |
| Herramientas vía `npx` | lighthouse | 13.1.0 |

Stack reproducible: `.mcp.json` + `requirements-audit.txt` + `package.json` en el repo.

## Anclas verificadas contra microdatos

Fuente: `data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx`, hoja `Datos_Normalizados`.

| Ancla CLAUDE.md | Verificación | Estado |
|---|---|---|
| n = 80 | `COUNT(*)` DuckDB = 80; `pd.read_excel` len = 80 | ✓ |
| 79 variables | `pd.read_excel` columnas = 79 | ✓ |
| 58,75% hombres (47/80) | Wilson IC95 = [0,478; 0,689], ancho 0,211 (cubre 0,5875; ancho <0,25) | ✓ |

Las tres anclas elementales sostienen. El resto del `<anchors>` queda para Fase 1.

## Métricas baseline (prod)

| Env | Viewport | Performance | Accessibility | LCP (ms) | CLS | TBT (ms) |
|---|---|---:|---:|---:|---:|---:|
| prod | desktop | 74 | 90 | 1.083 | 0 | 412 |
| prod | mobile | **46** | 94 | **4.239** | 0 | **1.787** |
| local | desktop | 28 | 90 | 7.037 | 0 | 955 |
| local | mobile | 26 | 94 | 25.039 | 0,014 | 2.583 |

Best Practices y SEO quedan fuera de esta tabla; detalle en `audit/baseline/lighthouse-summary.md`. JSONs crudos en `audit/baseline/raw/` (gitignored).

## Hallazgos P0 para Fase 2

1. **Mobile performance crítico en prod.** LCP prod mobile 4,2s vs desktop 1,1s — ratio 3,9×. Contradice directamente el mandato mobile-first del `<visual_rules>`. TBT mobile 1.787ms indica main thread bloqueado por JS pesado. Ruta: reducir bundle (recharts + lucide-react completos), code-split por ruta, lazy-load de componentes heavy (boxplots ECharts que vengan en Fase 6).

2. **Accesibilidad prod desktop 90 — deuda WCAG AA preexistente.** El `<code_rules>` exige WCAG AA; el score actual no lo alcanza ni antes del refactor. Target mínimo post-refactor: ≥95 en ambos viewports. Rubros típicos que restan: contraste (gradientes púrpura que el `<visual_rules>` prohíbe), aria-labels ausentes, orden de headings, `prefers-reduced-motion` no respetado.

## Hallazgos P1

1. **A11y desktop 90 < mobile 94 (prod).** La brecha de 4 puntos es inusual — suele ser al revés (mobile tiene más problemas de touch targets y viewport). Sugiere que el problema desktop es algo estructural que Lighthouse castiga más en ese factor (probablemente contraste/tamaños relativos).

2. **Best Practices 96 en los 4 runs.** Margen de 4 puntos para llegar a 100 — baja fricción para ganar. Típicamente: errores en console, imágenes sin `alt` dimensionado, HTTPS issues menores.

3. **SEO local 82 < prod 90.** Es artefacto del dev server de Vite (no emite ciertas meta tags en dev). No actuar sobre esto — se resuelve al buildear.

4. **LCP local mobile 25s.** Aunque no es métrica real, hace el loop de desarrollo en mobile doloroso. Si Fase 2 requiere iterar mobile localmente, vale la pena medir con `npm run preview` (build production) en vez de `dev`, o usar DevTools throttling sobre desktop como proxy.

## Comparabilidad de métricas

- **Válido**: prod vs prod (antes del refactor vs después del refactor, mismo Vercel).
- **Válido**: prod desktop vs prod mobile (gap real de viewport sobre el mismo build).
- **No válido**: local vs prod. Vite dev está 3–10× más lento por falta de minify, tree-shake y compresión. Para comparar rendimiento post-refactor, correr Lighthouse contra `npm run preview` o contra el deploy preview de Vercel, nunca contra `npm run dev`.
- **Método de medición Fase 2+**: mismo script `run_lighthouse.py`, runs sobre URLs deploy preview + prod, al menos 3 corridas por combinación y reportar mediana (hoy fue 1 run, es un baseline, no un target).

## Notas operativas

- Dev server Vite vivo en background (proceso `bntmiqk9q`) en http://localhost:3000. Útil si se arranca Fase 1 inmediato. Si no, matar manualmente desde otra terminal (`taskkill /F /IM node.exe` o cerrar la sesión de Claude Code).
- MCPs registrados en `.mcp.json` pero Claude Code puede requerir reiniciar para que aparezcan en tools deferidas (los smoke tests de Fase 0 se hicieron por CLI directo, independiente de eso).
- Artefactos tracked de Fase 0 (commiteados en `refactor/v2`):
  - `audit/baseline/REPORT.md` (este archivo)
  - `audit/baseline/lighthouse-summary.md`
  - `audit/baseline/smoke_test_stack.py` + `smoke_test_output.txt`
  - `audit/baseline/smoke_playwright.mjs`
  - `audit/baseline/run_lighthouse.py`
- Artefactos locales (gitignored):
  - `audit/baseline/home-{prod,local}-{desktop,mobile}.png` (4 screenshots)
  - `audit/baseline/raw/lighthouse-*.json` (4 reports crudos)

## Cierre

Fase 0 cerrada. Stack técnico operativo, anclas elementales verificadas, baseline medible. Dos P0 y cuatro P1 identificados. Listo para Fase 1.
