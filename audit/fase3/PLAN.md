# F3 PLAN — derivado: orden de migración para F4

Fecha: 2026-04-29
Branch destino: `refactor/v4` (a crear desde `main` post-merge F3)
Decisión F3: mantener recharts (ver [`decision_final.md`](decision_final.md))

## Contexto

F3 cerró con la decisión de mantener recharts como único stack. F4 implementa los 10 issues del [`backlog/fase4_visuales.md`](../../backlog/fase4_visuales.md) usando recharts custom (`ReferenceArea`/`ReferenceLine` para Bucket B; `BarChart` + `ErrorBar` para Wilson IC bars; cambios de `data.tsx` para el resto).

El template de implementación para Bucket B vive en [`benchmarks/viz/src/pages/recharts/`](../../benchmarks/viz/src/pages/recharts/). F4 los porta a `src/components/charts/` adaptando estilo/theme y agregando los polishes documentados en `decision_final.md`.

## Pre-requisitos antes de tocar src/

1. **Test de regresión KpiCard (deuda V3)** — `tests/components/KpiCard.test.tsx` con casos:
   ```ts
   it("trend con 'Atención requerida' produce icon rojo Y badge gris", ...);
   it("trend con 'Déficit' produce icon rojo Y badge rojo", ...);
   it("trend con 'Riesgo' produce icon rojo Y badge rojo", ...);
   it("trend sin keyword produce icon neutro Y badge neutro", ...);
   ```
   Esto blinda el componente antes de cualquier introducción de trends nuevos en F4 que activen las branches.

2. **Decisión sobre Tailwind CDN warning + importmap dead code**: F4 puede limpiarlos si Andrés lo aprueba (ahorra ~30-50 KB de overhead en mobile cold start). O queueado a F5.

## Orden propuesto de implementación (10 issues)

Agrupados por costo y dependencia. Commits granulares.

### Lote 1 — Cambios sin chart (trivial, sin riesgo visual)

| # | ID | Acción | Estimado |
|---|---|---|---|
| 1 | D5 | Mostrar `n=77` + missing rate 3.75% en footer ST5 | 0.25 h |
| 2 | D6 | Update cifras E3 (E3 sync n=134 FC) en `data.tsx` | 0.5 h |
| 3 | N1 | Etiqueta SR2: attribution 65% + agregar deadweight 10% | 0.5 h |
| 4 | N2 | Etiqueta SR2: agregar campo decrecimiento 5% explícito | 0.5 h |
| 5 | N3 | SR2 Familias Emprendedoras: corregir terminología deadweight/displacement | 0.5 h |

Subtotal: 2.25 h. Salida: extender `src/types/sroi.ts` (+`deadweight?: number`, +`decrecimiento?: number`), update `data.tsx` 4-5 indicadores, sin cambios de `components/`.

### Lote 2 — Wilson IC bars (recharts BarChart + ErrorBar)

Crear utility `src/lib/wilson.ts` (si no existe) con `wilsonInterval(p, n, alpha=0.05)` retornando `{ low, high }`. Usado por D1, D3, H1-VIZ.

| # | ID | Acción | Estimado |
|---|---|---|---|
| 6 | D1 | E1 Tenencia: pie 2-cat → Wilson IC bar | 1 h |
| 7 | D3 | ST1 Orgullo: pie 2-cat → Wilson IC bar + ajustar 98%/2% → 97.5%/2.5% (cifra n=80) | 1 h |
| 8 | H1-VIZ | Ambiental 5 charts → 1 índice agregado Wilson IC + reescribir copy sección | 2 h |

Subtotal: 4 h. Salida: nuevo componente `src/components/charts/WilsonBar.tsx` (~80 LOC), 3 indicadores migrados, copy ambiental reescrita.

### Lote 3 — Bucket B (custom shape via ReferenceArea/Line)

Portar templates de `benchmarks/viz/src/pages/recharts/` a `src/components/charts/`:

| # | ID | Acción | Estimado |
|---|---|---|---|
| 9 | D2 | E4 Brecha género: bar vertical → boxplot doble + scatter + outlier labels | 2.5 h |
| 10 | D4 | ST6 Confianza/Puntualidad: ajustar Spearman ρ=0.5617 como primario (Pearson secundario), considerar heatmap 5×5 si Andrés lo decide | 2 h |

Subtotal: 4.5 h. Salida: nuevo `src/components/charts/Boxplot.tsx` (~200 LOC con outlier labels), update `Correlation.tsx` (Spearman + opcionalmente heatmap auxiliar).

**Pirámide P3** NO está en backlog F4 (no es uno de los 10 issues). El template existe en benchmark pero no migra ahora — queueado a F5 si se decide.

### Lote 4 — Polish y disclosures pendientes

49 indicadores sin disclosure individual (deuda F2). F4 puede absorber los disclosures de los indicadores tocados en lotes 1-3, dejando el resto a F5.

| Acción | Estimado |
|---|---|
| Disclosures `{ source, transformation, timeWindow, n, missingRate? }` para los 10 indicadores tocados | 1 h |
| Visual QA en `npm run dev` + screenshots por indicador | 0.5 h |
| Re-correr auditoría F1 (smoke) sobre los indicadores cambiados | 0.5 h |

Subtotal: 2 h.

## Total F4 estimado

**12.75 h** distribuidas. Buffer +20% → **15 h**.

## Anti-objetivos F4

- NO crear nuevas variantes de IndicatorRenderer sin justificación de tipo (mantener discriminated union acotada)
- NO añadir `any` en componentes nuevos
- NO modificar componentes con inspección asimétrica de V3 sin pasada byte-a-byte previa (`charts/*`, `tables/*`, `sroi/*` excepto los con pasada profunda en F2)
- NO instalar nuevas dependencias en `src/` (recharts ya cubre todo según F3)
- NO modificar `data.tsx` con cifras nuevas sin cita en `<source>` y respeto de jerarquía microdatos > tesis > código

## Gates de cierre F4

1. Visual diff vs F3 baseline: 16/16 PASS sobre indicadores tocados (con tolerancia documentada para los 10 que cambian intencionalmente)
2. `npx tsc --noEmit` sin errores en strict mode
3. `vitest run`: 100% pass, coverage ≥ 90% en `src/lib/` (incluyendo `wilson.ts` nuevo si se crea)
4. `axe smoke`: 0 critical violations sobre páginas tocadas
5. Lighthouse mobile sobre preview Vercel: Performance ≥ 61 (no regresión vs F2), LCP ≤ 4500 ms
6. KpiCard regression test agregado y pasando (deuda V3)
7. 10 indicadores con `disclosure: { ... }` shape completo

## Output esperado F4

- `src/components/charts/WilsonBar.tsx` (nuevo)
- `src/components/charts/Boxplot.tsx` (nuevo)
- `src/components/charts/Correlation.tsx` (update Spearman/Pearson)
- `src/lib/wilson.ts` (nuevo)
- `src/types/sroi.ts` (extendido con `deadweight`, `decrecimiento`)
- `src/data.tsx` (10 indicadores actualizados)
- `tests/components/KpiCard.test.tsx` (nuevo, deuda V3)
- `audit/fase4/CLOSEOUT.md` con gates cerrados
- Tag `v0.4.0` post-merge

## Reversibilidad / escalabilidad

Si en F4 se descubre que un indicador específico requiere visualización fuera del alcance de recharts (e.g., Sankey, treemap real), abrir `questions/NNN_F4_viz_<id>.md` con contexto y reabrir la decisión F3. El benchmark `benchmarks/viz/` está disponible como template de referencia para ECharts si se requiere fallback.
