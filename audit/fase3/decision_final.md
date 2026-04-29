# F3 Decisión final — Stack visual

Fecha: 2026-04-29
Branch: `refactor/v3`
Reporte completo: [`benchmarks/viz/REPORT.md`](../../benchmarks/viz/REPORT.md)

## Decisión

**Mantener recharts 3.6 como único stack visual** del dashboard, extendido con `ReferenceArea`/`ReferenceLine` para los 3 canarios complejos del Bucket B (boxplot doble, heatmap 5×5 Likert, pirámide simétrica).

**No introducir ECharts ni Plotly al producto.**

## Justificación condensada

| Criterio | Recharts mantener | ECharts añadir | Plotly |
|---|---|---|---|
| Bundle gzip Δ marginal | <5 KB (solo lógica) | +193 KB (viola gate +30 kB en 6.4×) | +373 KB para 1 chart (descalificado) |
| LCP impact mobile (extrapolado) | ≈prod actual 4134 ms | +500-1000 ms ⇒ 4600-5100 ms | >+1500 ms |
| TS strict | PASS (cast puntual) | PASS | PASS con shim |
| axe a11y | 0 violations | 0 violations | (no testeado) |
| Render time mediana | 1920 ms | 1897 ms | (no testeado) |
| LOC para 3 canarios | 411 | 298 | 73 (1 chart smoke) |
| Iteraciones para render correcto | 3 | 1 first-try | 1 smoke |
| Calidad visual de los canarios | Aceptable post-iter | Mejor (outliers labeled, count=0 visible) | (no testeado) |
| **Bundle gate del proyecto** | **PASS** | **FAIL sin code-splitting** | **FAIL absoluto** |

El driver decisivo es el bundle. Lighthouse mobile actual está en Performance 61 (target ≥80 deseable, mínimo aceptable 40). Añadir +193 KB gzip de ECharts al chunk único actual (sin code-splitting) degradaría LCP en ~500-1000 ms en mobile 4G, empujando Performance hacia 50 — **regresión** vs F2.

ECharts es técnicamente superior (DX, calidad visual nativa). Pero el costo de bundle no se compensa con el beneficio visual cuando recharts custom es funcional con esfuerzo adicional acotado.

## Mapa indicador → librería + viz F4

Ningún issue del backlog F4 requiere librería distinta de recharts.

| ID | Indicador | Viz actual | Viz target | Recharts API | Esfuerzo |
|---|---|---|---|---|---|
| D1 | E1 Tenencia | pie 2-cat | Wilson IC bar | `BarChart` + `ErrorBar` | Bajo |
| D2 | E4 Brecha género ingreso | bar vertical | Boxplot doble + scatter jitter | `ScatterChart` + `ReferenceArea` + `ReferenceLine` (templated en `benchmarks/viz/src/pages/recharts/Boxplot.tsx`) | Medio (+ outlier labels custom) |
| D3 | ST1 Índice Orgullo | pie 2-cat | Wilson IC bar | `BarChart` + `ErrorBar` | Bajo |
| D4 | ST6 Confianza/Puntualidad | Pearson r + OLS | Spearman scatter (primario) + opcional heatmap 5×5 | `ScatterChart` + `Line` (existing, ajustes); heatmap si se decide en F4 con `ReferenceArea` × 25 templated | Medio |
| D5 | ST5 Motivación | sin n explícito | Mostrar n=77 + missing rate | Footer académico, sin cambio chart | Trivial |
| D6 | E3 Erosión Incentivo | cifras 2022/2023 | Update AVG(134 FC) | Sin cambio chart, solo `data.tsx` | Trivial |
| H1-VIZ | Ambiental 5 charts → 1 | 5 SiNo charts | 1 índice agregado Wilson IC | `BarChart` + `ErrorBar` + reescritura copy sección | Medio |
| N1 | SR2 attribution + deadweight | attribution 63% | attribution 65% + deadweight 10% | Etiqueta SROI, extender tipo SR2 | Bajo |
| N2 | SR2 decrecimiento | implícito | 5% explícito | Etiqueta SROI | Bajo |
| N3 | SR2 deadweight terminología | "20% (Peso muerto)" en displacement | "20% (Peso muerto)" en deadweight + displacement 0% | Etiqueta SROI | Bajo |

## Caveats que F4 debe absorber

1. **Outlier labeling**: el boxplot recharts del benchmark NO etiqueta outliers automáticamente. F4 debe agregar `LabelList` o `<Label>` per outlier IQR-fence.
2. **Heatmap count=0**: el cell vacío recharts es blank con dashed outline. F4 debe agregar `<Label value="0">` para paridad con la práctica académica.
3. **Boxplot scale comprimido por outlier**: ambos stacks sufren — F4 debe ofrecer toggle `lin/log` opcional para E4 (issue D2 lleva esa nota).
4. **DX overhead recharts**: cada implementación de Bucket B requiere ~3× iteraciones. Reservar buffer en estimaciones F4. El template del benchmark (`benchmarks/viz/src/pages/recharts/{Boxplot,Heatmap,Pyramid}.tsx`) acelera por reuso.
5. **KpiCard regression test (deuda V3)**: queueado a F4 como pre-requisito antes de tocar componentes con branches lógicas no-ejercitadas. Documentado en `audit/fase4/HANDOFF.md`.

## Reversibilidad

Si en F4+ se descubre que recharts custom no escala (e.g., F5 introduce sankey, treemap, scatterplot matrix), la decisión es reversible:
- ECharts ya está benchmark-evaluated; el código en `benchmarks/viz/src/pages/echarts/` sirve de template
- Code-splitting via `import('./echarts/Boxplot')` + Suspense permite añadir ECharts sin viola el gate de bundle inicial — solo carga el chunk al activar la tab que lo usa.
- Decision_final.md actualizado en F5+ si se reabre la decisión.

## Outputs F3

- [`benchmarks/viz/REPORT.md`](../../benchmarks/viz/REPORT.md) — comparación detallada
- [`benchmarks/viz/results/bundle.json`](../../benchmarks/viz/results/bundle.json) — medidas raw
- [`benchmarks/viz/results/render.json`](../../benchmarks/viz/results/render.json)
- [`benchmarks/viz/results/lighthouse.json`](../../benchmarks/viz/results/lighthouse.json)
- [`benchmarks/viz/results/loc.json`](../../benchmarks/viz/results/loc.json)
- [`audit/fase3/decision_final.md`](decision_final.md) — este archivo
- [`audit/fase3/CLOSEOUT.md`](CLOSEOUT.md) — gates cerrados
- [`audit/fase3/PLAN.md`](PLAN.md) — plan F4 derivado
- [`audit/fase4/HANDOFF.md`](../fase4/HANDOFF.md) — entry point F4
