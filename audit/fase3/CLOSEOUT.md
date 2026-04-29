# F3 CLOSEOUT — Gates de cierre

Fecha: 2026-04-29
Branch: `refactor/v3`
Reporte: [`benchmarks/viz/REPORT.md`](../../benchmarks/viz/REPORT.md)
Decisión: [`decision_final.md`](decision_final.md)

## Gates duros (PLAN F3 sección 2.5)

| # | Gate | Threshold | Resultado | Estado |
|---|---|---|---|---|
| 1 | Bundle gzip Δ marginal sobre prod actual | ≤ +30 kB total | recharts custom <5 kB; ECharts +193 kB; Plotly +373 kB | PASS solo recharts |
| 2 | TS strict + noUncheckedIndexedAccess | 0 errores | recharts PASS, ECharts PASS, Plotly PASS con shim | PASS |
| 3 | WCAG AA básico (axe-core) | 0 violations críticas | recharts 0 violations + 1 incomplete (color-contrast no-bloqueante); ECharts 0 violations | PASS |
| 4 | Outlier E4 visible | Sin clipping del $23.990.000 | recharts: visible (punto azul); ECharts: visible y etiquetado "24.0M" | PASS |

**Veredicto: 4/4 gates PASS para la decisión "mantener recharts".**

## Métricas soft (informan, no descalifican)

| Métrica | recharts | ECharts | Diferencia |
|---|---|---|---|
| First render time mediana (ms, n=5) | 1920 | 1897 | -1.2% (ruido) |
| Heap delta tras 10 ciclos toggle (MB) | 18 (combinado) | (mismo experimento) | — |
| LOC para 3 canarios | 411 | 298 | +28% favor ECharts |
| Iteraciones para render correcto | 3 | 1 | recharts paga DX overhead |

## Decisión humana validada

Decisión técnica: mantener recharts.
Validación humana: pendiente (Andrés revisa este CLOSEOUT + REPORT antes de merge a `main`).

Tras validación, ejecutar:
```bash
git checkout refactor/v3
gh pr create --base main --head refactor/v3 --title "F3: stack visual decision" \
  --body-file audit/fase3/PR_BODY.md
gh pr merge --merge --delete-branch=false
git checkout main && git pull
git tag v0.3.0
git push origin v0.3.0
```

## Archivos producidos en F3

```
benchmarks/viz/
├── package.json                    # deps aisladas
├── vite.config.ts                  # multi-mode build
├── tsconfig.json                   # strict mirror
├── index.html                      # unified app entry
├── src/
│   ├── App.tsx                     # router (recharts/ECharts/Plotly/Stress)
│   ├── main.tsx, main-recharts.tsx, main-echarts.tsx, main-plotly.tsx, main-baseline.tsx
│   ├── entry-{recharts,echarts,plotly,baseline}.html
│   ├── fixtures.ts                 # type-safe loader + computeBoxStats helper
│   ├── theme.ts                    # subset de THEME del root
│   ├── shims.d.ts                  # plotly-basic-min type shim
│   └── pages/
│       ├── recharts/{All,Boxplot,Heatmap,Pyramid}.tsx
│       ├── echarts/{All,Boxplot,Heatmap,Pyramid,registry}.ts(x)
│       ├── plotly-smoke/Boxplot.tsx
│       └── stress/Stress.tsx
├── fixtures/
│   ├── e4-boxplot.json             # n=24, outlier presente
│   ├── st6-heatmap.json            # n=79, ρ=0.5617
│   └── p3-pyramid.json             # n=80, H=47/M=33
├── scripts/
│   ├── extract_fixtures.py         # READ-ONLY desde xlsx gitignored
│   └── measure_bundle.mjs          # gzip nivel 9 + deltas
├── results/
│   ├── bundle.json                 # 4 builds + deltas
│   ├── render.json                 # mediana toggle 5 ciclos
│   ├── lighthouse.json             # stress mobile + prod referencia
│   └── loc.json                    # LOC por chart por stack
└── REPORT.md                       # comparación + decisión

audit/fase3/
├── HANDOFF.md                      # (heredado de F2 closeout, sin cambios)
├── decision_final.md               # NUEVO
├── CLOSEOUT.md                     # NUEVO (este archivo)
├── PLAN.md                         # NUEVO (plan F4 derivado)
└── PR_BODY.md                      # NUEVO (body para gh pr create)

audit/fase4/
└── HANDOFF.md                      # NUEVO (entry point F4)
```

## Caveats heredados a F4

- 49 indicadores sin disclosure individual (deuda F2, queueada a F4/F5)
- 14 componentes con inspección asimétrica (V3 deuda) — pasada byte-a-byte requerida si F4 toca esos archivos
- KpiCard regression test no agregado en F2 — pre-requisito antes de modificar `KpiCard.tsx` en F4
- Tailwind CDN warning + importmap dead code — candidatos cleanup F4 si abre la oportunidad
- Outlier labeling, count=0 label, log scale toggle — refinements visuales para F4 sobre los 3 canarios

## Anti-objetivos respetados

- ✅ NO se modificó `src/` durante F3 (todo en `benchmarks/viz/`)
- ✅ NO se instalaron echarts/plotly en `src/` (sólo en `benchmarks/viz/package.json`)
- ✅ NO se descartaron candidatos por opinión: visx/observable/uPlot documentados en REPORT con argumento técnico (no incluidos en benchmark por argumento técnico explícito en el plan); Plotly evaluado empíricamente con smoke test
- ✅ NO se amplió scope a F4 (la implementación de los 10 issues queda para F4)
- ✅ NO se mergeó a `main` antes de validación humana
