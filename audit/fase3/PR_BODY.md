## Summary

F3 cierra con la decisión de **mantener recharts 3.6** como único stack visual del dashboard. ECharts y Plotly evaluados empíricamente y descartados por bundle (+193 KB y +373 KB gzip respectivamente, vs gate +30 kB).

El `benchmarks/viz/` es un workspace aislado (deps independientes, NO toca `src/`) con 7 implementaciones (3 recharts custom + 3 ECharts + 1 Plotly smoke) sobre los 3 canarios técnicos del backlog F4: boxplot doble (E4 brecha género ingreso, n=24 con outlier $24M), heatmap 5×5 Likert (ST6 confianza × puntualidad, n=79, ρ=0.56), pirámide poblacional simétrica (P3, n=80).

## Decisión técnica

| Criterio | recharts mantener | ECharts añadir | Plotly |
|---|---|---|---|
| Bundle gzip Δ marginal | <5 KB (lógica) | +193 KB (viola gate) | +373 KB para 1 chart |
| Lighthouse LCP impact (extrapolado) | ≈prod actual 4134 ms | +500-1000 ms | >+1500 ms |
| TS strict + noUncheckedIndexedAccess | PASS | PASS | PASS con shim |
| axe a11y | 0 violations | 0 violations | (no testeado) |
| Iteraciones para render correcto | 3 | 1 first-try | 1 smoke |

Driver decisivo: el bundle. Lighthouse mobile actual está en Performance 61. Añadir +193 KB gzip de ECharts degradaría LCP en ~500-1000 ms en mobile 4G, regresando vs F2. Recharts ya está en bundle; CustomShape via `ReferenceArea`/`ReferenceLine` para Bucket B es <5 KB gzip marginales.

## Files changed

- `benchmarks/viz/` (nuevo workspace aislado con package.json propio, no incluido en build de prod)
- `audit/fase3/decision_final.md`, `CLOSEOUT.md`, `PLAN.md`, `PR_BODY.md` (nuevos)
- `audit/fase4/HANDOFF.md` (entry point para F4)
- `src/` **sin cambios** (anti-objetivo respetado)

## Gates de cierre F3

| # | Gate | Estado |
|---|---|---|
| 1 | Bundle gzip Δ marginal ≤ +30 kB | PASS solo recharts |
| 2 | TS strict en benchmark | PASS |
| 3 | axe a11y 0 violations críticas | PASS |
| 4 | Outlier E4 visible sin clipping | PASS ambos stacks |

## Test plan

- [x] `npx tsc --noEmit` en `benchmarks/viz/` (PASS)
- [x] `vite build --mode {recharts,echarts,plotly,baseline}` (PASS los 4)
- [x] `vite build` unified (PASS, 2.31 MB raw / 761 KB gzip — solo carga las 3 libs juntas para visual inspection, no es prod-bound)
- [x] axe-core@4.10.0 sobre páginas recharts y echarts — 0 violations
- [x] Render time mediana 5 ciclos (recharts 1920 ms ≈ ECharts 1897 ms)
- [x] Lighthouse mobile 3 runs sobre stress page (variance 4 pts, no escalar a 5)
- [ ] Validación humana del REPORT.md + decision_final.md (Andrés)

## Próximos pasos post-merge

1. Tag `v0.3.0` desde `main`
2. Sesión fresca `/clear` para arrancar F4 desde [`audit/fase4/HANDOFF.md`](audit/fase4/HANDOFF.md)
3. F4 implementa los 10 issues del backlog en recharts (~15 h)
4. KpiCard regression test (deuda V3) como pre-requisito antes de tocar `src/components/cards/`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
