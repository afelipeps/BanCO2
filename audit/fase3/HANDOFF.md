# Handoff — Fase 3: Decisión de stack visual

Fecha generación: 2026-04-29
Tras merge: F2 cerrada en `main`, tag `v0.2.0` (commit `ef1ef7e`)
Branch sugerida: `refactor/v3` (crear desde `main` al arrancar F3)
Sesión: continuar en sesión fresca (cambio de modo: ejecución → análisis comparativo de librerías)

## Contexto F2 (no repetir)

- F2 cerró con arquitectura tipada en `src/` + discriminated union de 18 variantes
- Stack visual actual: **recharts 3.6** vía importmap (que en realidad Vite bundlea desde `node_modules` — confirmado en F2 baseline_metrics.md; importmap es código muerto en producción)
- Bundle JS actual: chunk `index-aVaBvwIj.js` raw 748 KB (gzip 219 KB) — single chunk, sin code-splitting
- Lighthouse mobile baseline post-F2: Performance **61** (mediana 5 runs), LCP **3928 ms**, A11y **94**
- Visual diff cero post-F2: 16/16 PASS (bundle de prod sirve los 53 indicadores del refactor verificados visualmente)
- Deuda visual heredada: ver [`backlog/fase4_visuales.md`](../../backlog/fase4_visuales.md) (issues enumerados de F1)

Documentación canónica F2 (lectura recomendada al arrancar F3):
- [`audit/fase2/MERGE_REPORT.md`](../fase2/MERGE_REPORT.md) — cierre post-merge con métricas finales
- [`audit/fase2/CLOSEOUT.md`](../fase2/CLOSEOUT.md) — gates + 6 pasos pre-merge
- [`audit/fase2/PLAN.md`](../fase2/PLAN.md) — plan ejecutado
- [`audit/fase2/scope_review.md`](../fase2/scope_review.md) — pasada V1-V4 con KpiCard hallazgo
- [`audit/fase2/preview_validation.md`](../fase2/preview_validation.md) — Lighthouse 5 runs detalle

## Objetivo F3

Decidir stack de visualización para F4 (migración indicador-por-indicador de visuales que F1 marcó como inadecuados).

### Visualizaciones obligatorias del backlog

Revisar `backlog/fase4_visuales.md` para la lista completa. Los 3 más exigentes técnicamente:

1. **Boxplot doble con datos crudos** — E4 brecha género ingreso (n=24)
   - Requiere: cuartiles + whiskers + strip plot de puntos individuales superpuesto
   - Dificultad recharts: alta (no tiene boxplot nativo, requiere CustomShape)
2. **Heatmap 5×5 Likert × Likert** — gobernanza-confianza (n=80)
   - Requiere: matriz coloreada con escala secuencial + tooltips por celda
   - Dificultad recharts: media (vía CustomShape sobre ScatterChart)
3. **Pirámide poblacional real con eje simétrico** — P3
   - Requiere: barras horizontales reflejadas alrededor de eje 0, una serie por sexo
   - Dificultad recharts: media (BarChart con valores negativos en una serie)

Plus visualizaciones adicionales del backlog que F1 marcó como inadecuadas con los visuales actuales.

## Candidatos a evaluar

| # | Stack | Pro | Con |
|---|---|---|---|
| 1 | **recharts 3.6** (current) extendido con CustomShape | bundle ya pagado, API conocida, integra bien con React | boxplot/heatmap requieren código custom no-trivial |
| 2 | **ECharts** vía echarts-for-react | tree-shakeable, soporta TODOS los chart types nativos, performance superior | curva de aprendizaje, +bundle si no se hace tree-shake bien |
| 3 | **react-plotly.js** | replicabilidad con notebooks Python (Plotly), boxplot/heatmap nativos | bundle gigante (~3 MB sin tree-shake), opinionado |
| 4 | **Combinación**: recharts simples + ECharts complejos | mejor de ambos mundos | overhead de mantener 2 stacks |

Otros candidatos a considerar (no descartar a priori):
- **visx** (Airbnb, low-level D3 wrappers React) — máxima flexibilidad, requiere más código
- **observable plot** + d3 — declarativo, buena DX pero menos integration React
- **uPlot** — específicamente para series temporales, ultra-liviano

## Plan F3 según roadmap maestro

Según el roadmap original del proyecto (no en este repo, en notas privadas del coautor humano):

1. **Workspace aislado**: `benchmarks/viz/` (NO `src/`) — proyecto Vite separado dentro del monorepo
2. **Implementar 3 gráficos exigentes en cada librería candidata** (recharts custom, ECharts, plotly, opcionalmente combinación)
3. **Medir con chrome-devtools MCP** o Lighthouse CI:
   - Bundle size (raw + gzip + por chunk)
   - First Contentful Paint
   - Largest Contentful Paint
   - Re-render performance (con React Profiler)
   - Memoria (heap snapshots)
   - Accesibilidad nativa (aria, keyboard nav, prefers-reduced-motion)
4. **Generar `benchmarks/viz/REPORT.md`** con tabla comparativa por métrica
5. **Decisión por bucket**:
   - Bucket A: visuales simples (KPI, bar, pie, line) — mantener recharts
   - Bucket B: visuales complejos (boxplot, heatmap, pirámide) — usar Bucket B-stack
   - Bucket C: ¿alguna razón para abandonar recharts completamente?
   Justificación técnica para cada bucket
6. **Plan de code-splitting** (especialmente si entra ECharts grande):
   - Lazy-load del Bucket B
   - Suspense boundaries
7. **Riesgos identificados** + plan de mitigación

## Lecciones de F2 que aplican a F3

Estas son las 8 lecciones documentadas en `audit/fase2/MERGE_REPORT.md` que vale la pena tener presentes al planear F3:

1. **Visual diff cero NO valida lógica byte-a-byte** (lección V3 KpiCard). Pasada manual sobre condicionales no-ejercitadas requerida en cualquier refactor. Para F3 esto se traduce: si vas a comparar la API de 2 librerías, los benchmarks NO garantizan paridad de features — verificar tooltips, animation, accessibility, edge cases manualmente.

2. **Verificación de scope MCPs antes de delegar**: `gh` + `vercel` CLI debe estar instalado y autenticado. Para F3 con benchmarks complejos, considerar: chrome-devtools MCP (para Lighthouse), context7 MCP (para docs de cada librería).

3. **Lighthouse 5 runs > 3** cuando varianza Performance > 10 puntos. Implementar Hodges-Lehmann simplificado (descarta extremos) para mediana robusta. Aplicable a benchmarks F3 sobre cada librería candidata.

4. **Bundle delta gate**: usar absoluto (+10 kB) además de relativo (+5%). Con bundle base pequeño, % puede engañar. Para F3 con candidatos como Plotly (~3 MB), el % es muy diferente del absoluto — reportar ambos.

5. **Tree-shake de código verificable**: `grep -c "<keyword>" dist/assets/*.js` confirma si Vite/Rollup tree-shake correctamente. Para F3 esto es crítico: ECharts solo justifica su bundle si se tree-shakea (importar solo tipos de chart usados, no `import * from 'echarts'`).

6. **Bypass token Vercel para deploys protegidos**: env var, NUNCA commiteado. Si F3 mantiene Vercel preview con deployment protection, replicar el flow.

7. **`gh pr merge --merge` (no --squash)** para refactors estructurales. Aplicable a F3.

8. **Auto-deploy Vercel desde main**: el setting NO es visible vía CLI directamente. Verificar empíricamente post-merge. F3 puede heredar este comportamiento sin cambios.

## Comando arranque sesión fresca F3 (sugerencia, no rígido)

```bash
/clear
# Modelo: opus suficiente para análisis comparativo (no opusplan, F3 no es
# implementación masiva sino decisión técnica). Si preferís opusplan,
# adelante.
# /effort xhigh recomendado para análisis profundo. Opcional.

cd "C:/Users/andre/Claude Code projects/Banco2 dashboard"
git checkout main && git pull
git checkout -b refactor/v3

cat audit/fase3/HANDOFF.md
cat audit/fase2/MERGE_REPORT.md  # contexto cierre F2

# Verificar estado de baseline para comparar:
ls benchmarks/  # si no existe benchmarks/viz/, crear como Vite isolated
node audit/baseline/lighthouse_mobile.mjs --preview https://evaluacionbanco2.com --runs 5
# (sin bypass-token: prod es público; baseline post-F2 para comparar
#  cuando se introduzcan candidatos)

# Luego: planear F3 con benchmarks/viz/ aislado
# NO tocar src/ hasta tener decisión final del stack
```

## Anti-objetivos F3

- **NO modificar `src/`** durante el benchmark — todo el spike code va en `benchmarks/viz/`
- **NO mergear F3 a `main`** hasta que el `benchmarks/viz/REPORT.md` tenga decisión humana validada
- **NO instalar todas las librerías candidatas en `src/`** (solo en `benchmarks/viz/` aislado). Esto previene bundle pollution accidental antes de la decisión.
- **NO ampliar el scope de F3 a F4** — F3 es solo decisión de stack. La migración indicador-por-indicador es F4.
- **NO descartar candidatos por opinión** — todo descarte requiere métrica concreta (bundle, perf, a11y, DX). Si se descarta por DX, documentar el ejemplo concreto que la motivó.

## Outputs esperados de F3

Al cierre de F3, el repo debe contener:
- `benchmarks/viz/` con implementación de los 3 gráficos exigentes en al menos 2 candidatos (recharts custom + ECharts mínimo)
- `benchmarks/viz/REPORT.md` con tabla comparativa por métrica + decisión razonada
- `audit/fase3/PLAN.md` con plan F4 derivado de la decisión
- `audit/fase3/CLOSEOUT.md` con gates de cierre F3 (decisión humana validada)
- Tag `v0.3.0` post-merge a main (siguiendo el patrón SemVer pre-1.0 de F2)

## Estimación de complejidad F3

Mediana: **8-12 horas** distribuidas:
- 2 h setup `benchmarks/viz/` con Vite aislado
- 3 h implementar 3 gráficos × 2 librerías (recharts custom + ECharts) = 6 implementaciones
- 1 h opcional implementar 3 gráficos en plotly o visx para comparar
- 2 h benchmarking + métricas + REPORT.md
- 1 h plan F4 + decisión
- 1 h buffer

F3 es más corta que F2 estructuralmente, pero requiere más profundidad de análisis comparativo.

## Co-autoría

- Andrés Felipe Palacio Santamaría — coautor humano, decisión de scope F3
- Claude Opus 4.7 — generación HANDOFF, ejecución de benchmarks (en sesión fresca)
