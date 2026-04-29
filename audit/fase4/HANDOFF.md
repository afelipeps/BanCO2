# Handoff — Fase 4: Migración de visuales (10 issues backlog)

Fecha generación: 2026-04-29
Tras merge: F3 cerrada en `main`, tag `v0.3.0`
Branch sugerida: `refactor/v4` (crear desde `main` al arrancar F4)
Sesión: continuar en sesión fresca con `/clear`.

## Contexto F3 (no repetir)

- F3 cerró con decisión: **mantener recharts 3.6** como único stack visual.
- ECharts y Plotly evaluados empíricamente y descartados por bundle:
  - ECharts +193 KB gzip (viola gate +30 kB en 6.4×)
  - Plotly +373 KB gzip por 1 chart (descalificado)
- Workspace `benchmarks/viz/` queda en repo como referencia de templates (recharts custom para boxplot/heatmap/pirámide).
- Bundle prod tras F3: idéntico al F2 (F3 no tocó `src/`).

## Lecturas obligatorias antes de empezar

En orden:

1. [`audit/fase3/decision_final.md`](../fase3/decision_final.md) — qué se decidió y por qué
2. [`audit/fase3/PLAN.md`](../fase3/PLAN.md) — orden de migración propuesto (10 issues, 4 lotes)
3. [`backlog/fase4_visuales.md`](../../backlog/fase4_visuales.md) — detalle por issue
4. [`audit/fase2/scope_review.md`](../fase2/scope_review.md) — lección V3 KpiCard byte-a-byte
5. [`audit/fase2/MERGE_REPORT.md`](../fase2/MERGE_REPORT.md) — métricas baseline post-F2

Templates de implementación (recharts custom para Bucket B):
- [`benchmarks/viz/src/pages/recharts/Boxplot.tsx`](../../benchmarks/viz/src/pages/recharts/Boxplot.tsx)
- [`benchmarks/viz/src/pages/recharts/Heatmap.tsx`](../../benchmarks/viz/src/pages/recharts/Heatmap.tsx)
- [`benchmarks/viz/src/pages/recharts/Pyramid.tsx`](../../benchmarks/viz/src/pages/recharts/Pyramid.tsx) (P3 no está en backlog F4 pero el template existe)

## Pre-requisitos antes de tocar src/

### 1. Test de regresión KpiCard (deuda V3 — bloqueante)

Antes de cualquier cambio en `src/`:

```bash
git checkout -b refactor/v4
mkdir -p tests/components
```

Crear `tests/components/KpiCard.test.tsx` con los 4 casos documentados en [`audit/fase2/scope_review.md`](../fase2/scope_review.md) líneas 132-141. El test debe pasar contra el código actual ANTES de cualquier modificación.

Razón: en F2 se identificó que `KpiCard` tiene branches asimétricas para `'Atención'` (icon usa 3 keywords, badge usa 2). Visual diff zero NO detectó la regresión potencial porque el data actual no activa esa branch. Si F4 introduce algún `trend` con esos keywords (probable en `data.tsx` post-update), el test debe ya estar pasando.

### 2. Verificación de scope MCPs

```bash
gh auth status
vercel whoami
ls .mcp.json && cat .mcp.json | head -5
```

MCPs útiles para F4:
- `chrome-devtools` para Lighthouse mobile + screenshots
- `playwright` para visual diff + axe a11y smoke
- `context7` para verificar APIs recharts 3.6 (especialmente `ErrorBar`, `LabelList`, `ReferenceArea`)

### 3. Working tree limpio + sync con main

```bash
git checkout main && git pull --ff-only origin main
git log --oneline -3   # debe mostrar tag v0.3.0
git checkout -b refactor/v4
```

## Plan F4 según [`audit/fase3/PLAN.md`](../fase3/PLAN.md)

4 lotes, ~12.75 h totales (+20% buffer = 15 h):

| Lote | Issues | Estimado |
|---|---|---|
| 1. Cambios sin chart (D5, D6, N1, N2, N3) | 5 | 2.25 h |
| 2. Wilson IC bars (D1, D3, H1-VIZ) | 3 | 4 h |
| 3. Bucket B custom (D2, D4) | 2 | 4.5 h |
| 4. Polish + disclosures + QA | — | 2 h |

Commits granulares por sub-tarea (no por lote completo).

## Anti-objetivos F4

- NO crear nuevas variantes de discriminated union sin justificación de tipo
- NO añadir `any` en componentes nuevos
- NO modificar componentes con inspección asimétrica V3 (`charts/*`, `tables/*`, `sroi/*` excepto los con pasada profunda) sin pasada byte-a-byte previa
- NO instalar nuevas dependencias en `src/`
- NO modificar `data.tsx` con cifras nuevas sin cita en `<source>` y respeto de jerarquía: microdatos > tesis > código
- NO comprometer cifras-ancla del CLAUDE.md sin escribir `questions/NNN_ancla.md` previo
- NO tocar `KpiCard.tsx` antes de que el test de regresión esté en green

## Gates de cierre F4

1. **Visual diff vs F3**: 16/16 PASS sobre indicadores no-tocados; tolerancia documentada para los 10 que cambian intencionalmente
2. `npx tsc --noEmit` sin errores en strict mode
3. `vitest run`: 100% pass, coverage ≥ 90% en `src/lib/`
4. `axe smoke`: 0 critical violations en páginas tocadas
5. Lighthouse mobile preview Vercel: Performance ≥ 61, LCP ≤ 4500 ms
6. KpiCard regression test agregado y pasando
7. 10 indicadores tocados con `disclosure: { source, transformation, timeWindow, n, missingRate? }` shape completo

## Lecciones de F2-F3 que aplican a F4

1. **Visual diff zero NO valida lógica byte-a-byte** (V3 KpiCard) — pasada manual sobre branches no-ejercitadas en cualquier componente que F4 modifique.
2. **Lighthouse 5 runs > 3** cuando varianza Performance > 10 puntos (Hodges-Lehmann simplificado).
3. **Bundle delta gate dual** (+10 kB absoluto Y +5% relativo). F4 no debería incrementar bundle (sólo añade lógica recharts custom; el módulo recharts ya está pagado).
4. **Tree-shake verificable con grep** — si F4 introduce alguna lib auxiliar (improbable), grep `dist/assets/*.js` para confirmar.
5. **Ejecutar `common.validate_cardinality`** antes de calcular proporciones nuevas sobre categóricas (statistical_rules CLAUDE.md).
6. **Mediana por defecto** si asimetría/outliers/ordinal — para D2 boxplot E4, ya cubierto por boxplot. Para D4 Spearman ρ correlación, también ordinal-friendly.
7. **Proporciones binomiales con IC Wilson** — D1, D3, H1-VIZ usan Wilson explícitamente. Crear `src/lib/wilson.ts` antes de usar.
8. **DX overhead recharts custom**: F3 documentó que cada chart Bucket B requiere ~3 iteraciones para render correcto. Reservar buffer de 50% extra al estimado por chart.

## Output esperado F4

- `src/components/charts/WilsonBar.tsx` (nuevo, ~80 LOC)
- `src/components/charts/Boxplot.tsx` (nuevo, ~200 LOC con outlier labels)
- `src/components/charts/Correlation.tsx` (update: Spearman primario, Pearson secundario)
- `src/lib/wilson.ts` (nuevo)
- `src/types/sroi.ts` (extendido)
- `src/data.tsx` (10 indicadores actualizados)
- `tests/components/KpiCard.test.tsx` (nuevo, deuda V3)
- `audit/fase4/CLOSEOUT.md`
- `audit/fase4/MERGE_REPORT.md`
- Tag `v0.4.0` post-merge

## Co-autoría

- Andrés Felipe Palacio Santamaría — coautor humano, validación de cifras y narrativas
- Claude Opus 4.7 — generación HANDOFF y ejecución F4 (en sesión fresca con `/clear`)
