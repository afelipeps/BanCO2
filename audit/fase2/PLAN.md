# PLAN F2 — Refactor de arquitectura de datos

Fecha aprobación: 2026-04-28
Plan completo: `whimsical-churning-crab.md` (sesión origen). Este archivo es el snapshot final con bloqueos B1-B3 + ajustes A1-A6 + M1-M2 incorporados, según la versión ejecutada.

## Resumen ejecutivo

Migrar el monolito `data.tsx` (1004 líneas) + `IndicatorRenderer.tsx` (615 líneas) + `types.ts` permisivo a una arquitectura tipada en `src/data/`, `src/types/`, `src/components/{cards,charts,tables,sroi}/`, `src/lib/`, `src/theme/`, con TypeScript strict + noImplicitAny + noUncheckedIndexedAccess y discriminated union de 18 variantes.

Visual diff cero contra baseline F0/pre-refactor sobre 8 secciones × 2 viewports.

## Estructura final (src/)

```
src/
├── App.tsx · index.tsx
├── data/        9 archivos (8 secciones + index, 53 indicadores)
├── types/       5 archivos (disclosure, story, viz, indicator, index)
├── lib/         2 archivos (stats.ts + stats.test.ts, 30 tests)
├── theme/       3 archivos (tokens, palette, index)
└── components/
    ├── IndicatorRenderer.tsx (router puro, switch + never exhaustive)
    ├── CustomTooltip.tsx · StoryBox.tsx
    ├── cards/   2 (KpiCard, KpiRating)
    ├── charts/  11 (PieChart, BarHorizontal, BarVertical, BarStacked,
    │              Scatter, Radar, LineMulti, Combo, Erosion, Funnel,
    │              Correlation)
    ├── tables/  2 (WordCountTable, TextMatrix)
    └── sroi/    3 (SroiBalanceChart, SroiEvidenceTable, SroiFutureImpactTable)
```

## Pre-migración (PM1-PM7)

| PM | Resultado |
|---|---|
| PM1 | `audit/fase2/` creado |
| PM2 | 53 indicadores en `data.tsx` (no 54 como decía plan original); 51 entradas en F1 = 49 indicadores + 2 anclas (E_ANCLA, S_ANCLA); 4 SROI faltantes (SR1, SR2, SR3, SR5) confirmando "F1 SROI parcial". Ver `reconciliation_54_vs_51.md`. |
| PM3 | 4 shapes TBD cerrados: `chart_erosion`, `sroi_balance_chart` (con index signature), `sroi_evidence_table`, `sroi_future_impact_table` |
| PM4 | 0 matches `kpi_sroi_master`/`chart_treemap` en `data.tsx` → eliminados del switch (commit 8) |
| PM5 | 0 matches `type:` literal en `data.tsx` → `story.type` siempre auto-derivado por App.tsx (`indicator.story.type \|\| (isAlert ? 'alert' : 'info')`); auto-detect por keywords en StoryBox era dead code post-strict, eliminado en commit 9a |
| PM6 | `chart_radar` single instance (A2) con serie única `A` — plan original correcto |
| PM7 | Baseline 16/16 capturado; `dist/` = 736 KB; chunk JS = 747.46 kB; **importmap es código muerto** (Vite bundlea React desde node_modules; R4 no se materializó). Ver `baseline_metrics.md`. |

## Commits ejecutados

| # | Hash | Scope | Notas |
|---|---|---|---|
| pre | a3423fb | docs(audit-f2) | Pre-migración: reconciliation, baseline_metrics, capture_v2 |
| 1 | d31379b | chore(arch) | Scaffold src/ + move App+index, alias `@/* → ./src/*` |
| 2 | 3ab8a0b | chore(test) | Vitest 2.1.9 + coverage-v8, threshold 80% sobre src/lib |
| 3 | 1c30dd1 | feat(types) | Discriminated union 16+ variantes, types.ts shim transicional |
| 4 | e9f7367 | feat(lib) | stats.ts (wilsonCI, median, iqr, mean, stdev, spearman) + 30 tests |
| 5 | 96ed158 | feat(theme) | THEME tokens + sroiPalette extraída; coverage/ gitignored |
| 6 | 7fa61c9 | refactor(data) | 53 indicadores en 8 archivos src/data/; data.tsx shim |
| 7 | d861938 | refactor(arch) | Components → src/components/; @/ aliases; eliminados 3 shims raíz + IndicatorLegacy |
| 8 | 60209a3 | refactor(components) | Split IndicatorRenderer en 18 componentes; +@types/react |
| 9a | db221a2 | chore(ts) | strict + noImplicitAny; 4 any callsites limpiados |
| 9b | 68f01f9 | chore(ts) | noUncheckedIndexedAccess (0 errores, gate condicional no se disparó) |
| 10 | (pendiente) | docs(audit-f2) | Visual diff 16/16 PASS, disclosure_debt, CLOSEOUT |

## Gates de cierre

Ver `CLOSEOUT.md` para el checklist completo y los resultados.
