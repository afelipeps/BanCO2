# F3 Benchmark — Stack visual para 10 issues backlog F4

Fecha: 2026-04-29
Branch: `refactor/v3`
Workspace aislado: `benchmarks/viz/` (deps independientes, sin pollution de `src/`)

## Contexto

F2 cerró con bundle prod 219 KB gzip, Lighthouse mobile Performance 61, LCP 3928 ms, recharts 3.6 como único stack visual. El [backlog F4](../../backlog/fase4_visuales.md) enumeró 10 issues visuales, de los cuales 3 son **canarios técnicos** que recharts no soporta nativamente: boxplot doble (E4), heatmap 5×5 Likert (ST6), pirámide poblacional simétrica (P3).

F3 evalúa empíricamente si:
- Recharts puede cubrir los 3 canarios con `ReferenceArea`/`ReferenceLine` (sin custom shape API), o
- Hay que adoptar ECharts (Apache 2.0, soporta nativo los 3 tipos), o
- Combinación (recharts simples + ECharts complejos), o
- Plotly (replicabilidad con notebooks Python).

## Setup

| Aspecto | Valor |
|---|---|
| Workspace | `benchmarks/viz/` (Vite 6 isolated, package.json propio) |
| Vite modes | `baseline` (React only), `recharts`, `echarts`, `plotly`, default unified (App.tsx con tabs) |
| TS config | strict + noImplicitAny + noUncheckedIndexedAccess (espejo del root) |
| Fixtures | 3 JSON committeables generados por `scripts/extract_fixtures.py` desde el xlsx gitignored |
| n efectivo | E4 n=24, ST6 n=79 (1 null en Confianza), P3 n=80 |
| Outlier E4 | $23.990.000 COP (ID 40, M, PECUARIO) — anchored, presente en fixture |

## Bundle (gates duros)

Medición con gzip nivel 9 sobre los builds aislados (`scripts/measure_bundle.mjs`):

| Build | Raw | Gzip | Δ raw vs base | Δ gzip vs base | Δ gzip/chart |
|---|---|---|---|---|---|
| baseline (React only) | 190.19 KB | 59.40 KB | — | — | — |
| recharts (3 charts) | 577.95 KB | 174.11 KB | +387.76 KB | +114.72 KB | 38.24 KB |
| echarts (3 charts) | 772.92 KB | 253.01 KB | +582.72 KB | +193.61 KB | 64.54 KB |
| plotly (1 boxplot) | 1281.00 KB | 432.67 KB | +1090.81 KB | **+373.28 KB** | 373.28 KB |

### Gate dual (PLAN F3 sección 2.5):

- **Gate gzip delta total ≤ +30 kB sobre prod actual (219 KB gzip)** — solo aplica a deltas marginales si añadimos un stack al producto.
- **Plotly gate ≤ +500 kB gzip absoluto** — declara descarte si excede.

### Lectura:

**Plotly: DESCALIFICADO.** +373 KB gzip por UN solo boxplot. Extrapolar a 3 canarios + integración real (~+500-700 KB gzip) viola el gate +500 kB y degradaría LCP en >1500 ms en mobile 4G.

**ECharts vs recharts custom**: la diferencia es +79 KB gzip (recharts 115 → ECharts 194). Si añadimos ECharts al producto actual además de recharts, el delta marginal sería **+193 KB gzip** sobre 219 KB de bundle base — **fuera del gate +30 kB en 6.4×**. Para no violar el gate, una decisión de "combinación" requeriría code-splitting con lazy import + Suspense del Bucket B (3 charts ECharts cargados solo en tabs Económica/Sostenibilidad).

**Recharts solo**: ya está en bundle actual. El delta marginal de añadir CustomShape via `ReferenceArea`/`ReferenceLine` para los 3 canarios es **<5 KB gzip** (lógica nueva pero ningún módulo nuevo).

## TypeScript strict (gate duro)

| Stack | `tsc --noEmit` (strict + noUncheckedIndexedAccess) | Notas |
|---|---|---|
| recharts custom | PASS | Tooltip formatter requiere `as never` cast por unión `ValueType\|undefined` en types de recharts 3.6 |
| ECharts | PASS | `echarts/core` API tipada vía `EChartsCoreOption`. ReactEChartsCore acepta tipos sin gaps |
| Plotly | PASS con shim | `plotly.js-basic-dist-min` no exporta tipos — `declare module` en `shims.d.ts` mínimo |

Veredicto: ningún candidato falla TS strict. ECharts tiene la API más limpia con types correctos; recharts requiere casting puntual; Plotly requiere shim manual.

## A11y axe-core (gate duro)

Resultados con `axe-core@4.10.0` cargado vía CDN:

| Stack | Violations | Passes | Incomplete |
|---|---|---|---|
| recharts page | 0 | 27 | 1 (color-contrast en text-muted, candidato F4) |
| ECharts page | 0 | 20 | 0 |
| Stress page (3 ECharts) | 0 | (similar) | 0 |

Veredicto: **ambos pasan**. Diferencia: ECharts canvas-rendered no expone DOM accesible — los counts de cells aparecen como labels canvas, no DOM. Recharts SVG-rendered tiene mejor estructura DOM por defecto (cada elemento es accesible). Para WCAG AA del proyecto, ambos requieren wrappers `aria-labelledby` manuales (ya implementados en ambos benchmarks).

## Edge cases (lección F2 L1: visual diff cero NO valida lógica)

| Caso | recharts custom | ECharts | Veredicto |
|---|---|---|---|
| Outlier E4 $23.990.000 visible | ✓ visible (punto azul superior) | ✓ visible y **etiquetado "24.0M"** | ECharts mejor por etiquetado nativo |
| Heatmap celda count=0 distinguible | ⚠ blank con dashed outline; sin label "0" | ✓ celda con "0" explícito y color del rango bajo | ECharts mejor |
| Pirámide bin con sexo=0 | (no hay datos en fixture, ningún bin tiene 0) | (igual) | Empate (no testeable con fixture actual) |
| Box pequeña por compresión por outlier | ⚠ caja H comprimida visualmente | ⚠ misma compresión (ambos usan misma escala lineal) | Empate; ambos requerirían escala log opcional en F4 |

Veredicto edge cases: ECharts entrega mejor calidad visual con menor esfuerzo. Recharts requiere F4 polish para llegar a paridad (etiquetar outliers, mostrar "0" en celdas vacías).

## Métricas soft

### Render time (mediana, n=5 ciclos tab toggle)

| Stack | Median (ms) | Range | Interpretación |
|---|---|---|---|
| recharts | 1920 | 1846–1933 | — |
| ECharts | 1897 | 1730–1921 | -23 ms vs recharts (ruido de sampling) |

**Paridad práctica.** Ambos stacks responden en ~1.9 s al tab switch (incluye mount + ResponsiveContainer dimension resolution + animaciones). Diferencia dentro de varianza.

### Heap

| Estado | Heap (MB) |
|---|---|
| Post-page-load (un solo tab activo) | 15 |
| Tras 5 ciclos tab toggle (5× recharts + 5× ECharts) | 33 |
| Δ por ciclo | +1.8 MB |

Caveat: en producción solo se cargaría UN stack a la vez. El benchmark carga ambos simultáneamente. Nota para F4: validar GC tras dismount para detectar leaks de event listeners.

### Lighthouse mobile (Hodges-Lehmann mediana, n=3 default)

| Página | Performance | LCP (ms) | TBT (ms) | A11y |
|---|---|---|---|---|
| Stress benchmark (recharts+ECharts+Plotly cargados) | 59 | 4798 | 479 | 100 |
| Prod actual (solo recharts en src/) | 63 | 4134 | 570 | 94 |

**El benchmark stress NO es representativo del producto final** — carga las 3 librerías candidatas para visual inspection en una sola página. La extrapolación importante:

- **Si decidimos solo recharts** (custom shape para Bucket B): LCP ≈ prod actual (~4134 ms)
- **Si añadimos ECharts** (+193 KB gzip): LCP ≈ prod + 500-1000 ms ⇒ ~4600-5100 ms (degradación)
- **Si reemplazamos completamente con ECharts**: LCP incierto (depende de paridad recharts → ECharts en los 7 charts simples del Bucket A)

Variance Performance entre 3 runs: 4 puntos (≤10), no requiere escalar a 5 runs.

### LOC por chart

| Stack | Boxplot | Heatmap | Pyramid | Total | + setup |
|---|---|---|---|---|---|
| recharts custom | 175 | 122 | 114 | 411 | 0 |
| ECharts | 115 | 91 | 92 | 298 | +27 (registry tree-shake) |
| Plotly smoke | 73 | — | — | 73 | 0 |

ECharts es ~28% más conciso (-113 LOC sobre 3 canarios). Recharts custom paga el sobrecosto de orquestar `ReferenceArea` × 25 celdas + `ReferenceLine` × 4 por boxplot.

## Iteraciones requeridas (DX, lección operativa)

| Stack | Iteraciones para render correcto |
|---|---|
| ECharts | 1 (first-try) |
| recharts custom | 3 (CustomShape no recibe scale → migrar a ReferenceArea/Line con coords data) |
| Plotly | 1 (smoke test, no requiere paridad visual) |

Recharts custom requirió:
1. Intento inicial con `<Scatter shape={...}>` + acceso a `xAxis.scale` — **falla**: recharts 3.x no pasa la scale function al shape (solo `cx, cy` proyectadas).
2. Refactor a `ReferenceArea`/`ReferenceLine` con coordenadas data — funciona.
3. Pirámide: ajuste de `barGap`, `barCategoryGap`, eliminación de `stackId` para evitar bars invisibles en layout vertical con valores negativos.

Costo de iteración medido: ~45 minutos de debugging + tooling (browser inspection, screenshot diffing). Multiplicar este overhead × 10 issues backlog F4 si todas requieren custom — significativo.

## Decisión

### Mantener recharts (con CustomShape via ReferenceArea/Line para Bucket B)

**Argumentos primarios:**

1. **Bundle**: añadir ECharts viola gate +30 kB gzip en 6.4× (+193 KB). Sin code-splitting, degradaría LCP mobile en ~500-1000 ms — empeoraría Lighthouse Performance respecto a la baseline F2 (61) en lugar de mejorarla.
2. **Recharts ya pagado**: el chunk del producto ya incluye recharts. El costo marginal de Bucket B con ReferenceArea/Line es <5 KB gzip.
3. **A11y empate**: ambos pasan axe; recharts con SVG tiene marginal ventaja DOM-accesible vs ECharts canvas.
4. **Performance empate**: render time ~1900 ms ambos; sin discriminador.

**Caveats documentados:**

1. **DX deficit recharts**: 3× iteraciones vs ECharts first-try. F4 absorberá ese overhead pero queda registrado como deuda de productividad. Si F5+ requiere más visualizaciones complejas (sankey, treemap, sunburst), revisitar la decisión.
2. **Calidad visual gap recharts**: outliers no etiquetados nativamente, heatmap count=0 sin label "0" — F4 debe mejorar via custom labels.
3. **Sin escala log opcional para boxplot**: ambos stacks comprimen H/M box visualmente cuando el outlier de $24M domina. F4 debe agregar toggle log/lin scale en E4 (issue D2 backlog).

**Plan de mitigación de caveats** (queueado a F4):
- Etiquetado de outliers via Scatter `<Label>` o `LabelList` por punto fuera de fences IQR.
- Custom label en `ReferenceArea` para celdas heatmap count=0 ("0" en gris).
- Scale toggle (estado `'lin'|'log'`) en E4 boxplot.

## Mapa de las 10 issues backlog F4 → librería destino

Todas se implementan en **recharts** (mantenemos stack actual). Ningún issue requiere swap.

| ID | Indicador | Viz target | Implementación recharts |
|---|---|---|---|
| D1 | E1 Tenencia | Wilson IC bar | `BarChart` + `ErrorBar` (nativo) |
| D2 | E4 Brecha género ingreso | Boxplot doble + scatter jitter | `ScatterChart` + `ReferenceArea`/`Line` (este benchmark) + outlier labels en F4 |
| D3 | ST1 Índice Orgullo | Wilson IC bar | `BarChart` + `ErrorBar` |
| D4 | ST6 Confianza/Puntualidad | Spearman scatter | `ScatterChart` + `Line` (existente, ajustes) |
| D5 | ST5 Motivación | n efectivo + missing rate | Sin cambio chart, sólo footer académico |
| D6 | E3 Erosión Incentivo | Update cifras | Sin cambio chart, sólo data.tsx |
| H1-VIZ | Ambiental 5 charts → 1 índice | Wilson IC bar | `BarChart` + `ErrorBar` |
| N1 | SR2 attribution 65% + deadweight 10% | Etiqueta SROI | Sin cambio chart |
| N2 | SR2 decrecimiento 5% explícito | Etiqueta SROI | Sin cambio chart |
| N3 | SR2 deadweight terminología | Etiqueta SROI | Sin cambio chart |

Ver detalle en [decision_final.md](../../audit/fase3/decision_final.md).

## Output

- Workspace `benchmarks/viz/` con 7 implementaciones (3 recharts + 3 ECharts + 1 Plotly smoke)
- Fixtures committeados (3 JSON sin PII)
- Resultados en `benchmarks/viz/results/`: `bundle.json`, `render.json`, `lighthouse.json`, `loc.json`
- Screenshots de validación: `recharts-fixed.png`, `echarts-actual.png`, `benchmark-recharts.png` (referencias en `.playwright-mcp/`)

## Próximos pasos

1. `audit/fase3/CLOSEOUT.md` — gates cerrados
2. `audit/fase3/PLAN.md` — orden de migración F4
3. `audit/fase4/HANDOFF.md` — entry point F4
4. PR `refactor/v3` → `main`, merge `--merge`, tag `v0.3.0`
