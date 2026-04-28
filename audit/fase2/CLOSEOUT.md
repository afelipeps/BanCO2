# CLOSEOUT F2 — Refactor de arquitectura de datos

Fecha: 2026-04-28
Branch: refactor/v2 (HEAD post-commit 10)
Commits: pre + 10 = 11 commits sobre `main`

## Veredicto

**F2 cerrada sin bloqueos.** Todos los gates duros y condicionales en verde. 1 gate informativo pendiente (Lighthouse mobile en Vercel preview, requiere deploy).

## Métricas finales

### Bundle

| Métrica | Pre-refactor (3d50da2) | Post-refactor (HEAD) | Δ | Gate |
|---|---|---|---|---|
| `dist/` total | 736 KB | 736 KB | 0 | < 773 KB ✓ |
| chunk JS raw | 747.46 kB | 748.45 kB | +0.99 kB (+0.13%) | < 785 KB OR < +10 KB ✓ |
| chunk JS gzip | 219.06 kB | 219.13 kB | +0.07 kB | informativo |

### Visual diff (`audit/baseline/v2-diff/`)

16/16 PASS · pixelmatch `{ threshold: 0.1, includeAA: false }` · umbral <0.1%

| Sección | desktop | mobile |
|---|---|---|
| geografia | 0.0000% | 0.0000% |
| poblacion | 0.0000% | 0.0049% |
| ambiental | 0.0000% | 0.0000% |
| social | 0.0000% | 0.0000% |
| economica | 0.0000% | 0.0196% |
| gobernanza | 0.0011% | 0.0000% |
| sostenibilidad | 0.0070% | 0.0000% |
| sroi | 0.0000% | 0.0000% |

Nota: las primeras capturas reportaron 5/16 FAIL (poblacion-desktop 0.34%, ambiental-desktop 0.33%, economica-desktop 0.43%, gobernanza-desktop 0.38%, poblacion-mobile 0.23%) por **animation timing inconsistente** (fadeInUp 0.5s + stagger por card + recharts mount animation). Solución: `capture_v2.mjs` ahora inyecta CSS que deshabilita todas las `animation` y `transition` con duration 0s vía `addStyleTag` antes de cualquier click. Re-captura sobre worktree del commit 3d50da2 (baseline) y sobre HEAD (after) confirmó 16/16 PASS. **NO se aflojó el umbral 0.1% — la solución fue determinismo de captura.**

### TypeScript

- `strict: true` ✓
- `noImplicitAny: true` ✓
- `noUncheckedIndexedAccess: true` ✓ (gate condicional no se disparó: 0 errores)
- `npx tsc --noEmit` → exit 0
- 0 `: any` en `src/` (excluyendo `react-redux` node_modules)
- 0 `as any` en `src/`

### Tests

- 30/30 vitest pass sobre `src/lib/stats.test.ts`
- Coverage v8: 92.8% lines, 95.16% branches, 100% funcs sobre `src/lib/`
- Threshold de cierre F2: ≥80% ✓
- Líneas no cubiertas: 155-160, 169-174 de `stats.ts` (ramas de `invNormal` Beasley-Springer-Moro usadas solo cuando `alpha != 0.05`; los tests cubren el path por defecto)

## Reconciliación honesta del plan vs ejecución

### Discrepancias numéricas vs plan original

- **53 indicadores, no 54** — el plan asumía 54 sin contar gaps. La realidad: SR4 está ausente por diseño (gap documentado en `audit/fase1/sroi_REPORT.md`).
- **4 SROI sin auditar en F1, no 3** — plan original asumía 3 missing. Reconciliación reveló SR1+SR2+SR3+SR5 todos sin entrada formal en `Resumen_global` (cubiertos por `sroi_REPORT.md` pero no por scripts de auditoría).
- **49 disclosure debt, no 47** — derivado del nuevo conteo (53 − 4 V-L-O ya documentados = 49 sin disclosure). Ver `disclosure_debt.md`.

### Variantes del Indicator union: 18, no "10 esperados o 18 declarados con 2 deprecated"

Conteo real:
- 16 variantes con instancias reales en `data.tsx`
- 0 instancias de `cards_grid`/`kpi_sroi_master`/`chart_treemap` (PM4 grep verificó)
- Eliminadas del router en commit 8

El número 18 del plan venía contando los handlers del switch monolítico, no las variantes con uso real. Quedan 18 cases en el nuevo router porque eliminar los 2-3 dead casts no aplicaba (eran `return null`).

### Desviaciones documentadas

1. **TODO disclosures inline NO se agregaron** (commit 6). Razón: 49 × ~5 líneas = 245 líneas de placeholder noise. La deuda queda enumerada en `disclosure_debt.md` con plan F4/F5 para fillar y endurecer `IndicatorBase.disclosure` a obligatorio.

2. **StoryBox auto-detección por keywords eliminada** (commit 9a). Razón: era dead code post-strict — App.tsx siempre coalesce `story.type` a `'info'\|'alert'` antes de pasar a StoryBox; data.tsx no tiene `story.type='success'` literal en ningún indicador. La eliminación NO cambia comportamiento runtime y simplifica el componente. Visual diff confirma cero regresión.

3. **A11y axe-core gate no implementado** (A6 del adendum). Razón: scope reducido por timebox. Documentado como deuda F4 — agregar smoke axe-core sobre home post-refactor cuando se introduzcan visuales nuevos. F2 no debe regresar a11y, pero no se midió.

4. **Lighthouse mobile gate no medido**. Requiere Vercel preview deploy. Fuera del flujo local de F2. Cuando el branch se promote a deploy preview (post-/ultrareview, post-merge a main vía PR), correr 3 corridas, reportar mediana, comparar contra baseline F1 (Performance ≥40, LCP ≤4500 ms). Gate informativo, no bloqueante.

5. **Bundle delta gate clarificado vs plan original**. Plan decía "+5%". Real: dual gate `dist/` < 773 KB OR chunk < 785 KB OR Δ chunk < +10 KB (lo más conservador). Razón: con importmap dead, `dist/` baseline es ~736 KB y +5% relativo (≈37 KB) es excesivamente generoso para un refactor estructural sin features.

### Riesgos del plan que NO se materializaron

- **R3 antialiasing**: 16/16 PASS limpio con `includeAA: false`. No se necesitó loosening.
- **R4 importmap+Vite divergen**: Vite bundlea todo; importmap es dead code en `index.html`. Documentado en `baseline_metrics.md`. Deuda separada para F3 (eliminar importmap o hacerlo realmente externo).
- **R5 regressionPoints any[]**: Tipado como `Array<{ x: number; y: number }>` sin issues.
- **R8 strict rompe componentes**: Solo 3 errores con strict, todos cosméticos (LabelList formatter, DataSource indexing).
- **R9 conteo cobertura F1**: Reconciliado, sin sorpresas.

### Riesgos que SÍ se materializaron

- **Animation timing en visual diff**: las primeras 5 fallas eran por `style={{ animation: ... }}` con stagger por card y recharts mount animations no-deterministas. Resuelto inyectando CSS que deshabilita animations en captura. Worktree del commit pre-refactor + re-captura ambas sides.

## Listas de archivos críticos

### Creados (37 nuevos en src/)

- `src/types/{disclosure,story,viz,indicator,index}.ts` (5)
- `src/lib/{stats,stats.test}.ts` (2)
- `src/theme/{tokens,palette,index}.ts` (3)
- `src/data/{geografia,poblacion,ambiental,social,economica,gobernanza,sostenibilidad,sroi,index}.ts` (9)
- `src/components/{IndicatorRenderer,CustomTooltip,StoryBox}.tsx` (3 movidos + reescritos)
- `src/components/cards/{KpiCard,KpiRating}.tsx` (2)
- `src/components/charts/{PieChart,BarHorizontal,BarVertical,BarStacked,Scatter,Radar,LineMulti,Combo,Erosion,Funnel,Correlation}.tsx` (11)
- `src/components/tables/{WordCountTable,TextMatrix}.tsx` (2)
- `src/components/sroi/{SroiBalanceChart,SroiEvidenceTable,SroiFutureImpactTable}.tsx` (3)
- `src/{App,index}.tsx` (2 movidos)

### Eliminados

- `data.tsx` raíz (1004 líneas → migrado a 9 archivos `src/data/`)
- `types.ts` raíz (58 líneas → migrado a 5 archivos `src/types/`)
- `theme.ts` raíz (16 líneas → migrado a 3 archivos `src/theme/`)
- `components/` raíz (3 archivos → movidos a `src/components/`)
- `src/types/legacy.ts` (transicional commit 3-7)

### Modificados

- `tsconfig.json` (paths + strict + noImplicitAny + noUncheckedIndexedAccess)
- `vite.config.ts` (alias `@` → `./src`)
- `index.html` (`/index.tsx` → `/src/index.tsx`)
- `package.json` (+ vitest, @vitest/coverage-v8, @types/react, @types/react-dom, pixelmatch, pngjs)
- `.gitignore` (+ coverage/)

## Checklist de cierre

### Pre-migración
- [x] `audit/fase2/reconciliation_54_vs_51.md` — 4 missing identificados (todos SROI)
- [x] Baseline v2 generado en `audit/baseline/v2/` con 16 PNGs
- [x] SR3 verificado en `sroi_REPORT.md`, SR4 documentado como ausente

### Gates duros
- [x] `npx tsc --noEmit` pasa con strict + noImplicitAny + noUncheckedIndexedAccess
- [x] `npm run build` pasa
- [x] `npm run preview` arranca en localhost:4173 sin errores de consola (verificado durante captura v2-after)
- [x] `grep -rn ": any" src/` retorna 0 (excluyendo node_modules)
- [x] `grep -rn "as any" src/` retorna 0
- [x] `npm run test` pasa (30/30)
- [x] `npm run test:coverage` reporta ≥80% en src/lib/ (92.8%)
- [x] `audit/baseline/v2-after/` generado; `node audit/baseline/diff_v2.mjs` reporta 16/16 PASS
- [x] Bundle size delta `dist/` vs main < +5% AND Δ chunk < +10 KB (Δ +0.99 kB / +0.13%)

### Gates condicionales
- [x] `noUncheckedIndexedAccess` activado (commit 9b, 0 errores, sin escape hatch)

### Gates informativos (NO bloqueantes)
- [ ] Lighthouse mobile en Vercel preview post-F2 — pendiente deploy
- [ ] axe-core smoke sobre home post-F2 — diferido a F4

### Cierre documental
- [x] `audit/fase2/PLAN.md` commiteado
- [x] `audit/fase2/CLOSEOUT.md` (este archivo) commiteado
- [x] `audit/fase2/disclosure_debt.md` con 49 TODOs enumerados
- [x] `audit/fase2/baseline_metrics.md` (commit pre)
- [x] `audit/fase2/reconciliation_54_vs_51.md` (commit pre)
- [ ] `/ultrareview` ejecutado — **acción del usuario**, billing del usuario
- [ ] Push a `refactor/v2` con preview Vercel funcional — **acción del usuario** tras /ultrareview

## Próximos pasos (orden estricto, gates inter-paso)

### Paso 1 — /ultrareview local
**Acción**: usuario ejecuta `/ultrareview` sobre refactor/v2.
**Gate**: 0 P0/P1 flags. Si hay P1: resolver antes de paso 2.
**Si pasa**: continuar paso 2.

### Paso 2 — Push a origin/refactor/v2
**Acción**: usuario ejecuta `git push origin refactor/v2`.
**Resultado esperado**: Vercel deploy preview generado automáticamente.
**Gate**: build de Vercel exitoso (verificar dashboard Vercel).
**Si falla**: abrir question/014 con log de Vercel.

### Paso 3 — Smoke visual en preview
**Acción**: validar las 8 tabs sobre desktop + mobile en preview URL.
**Cobertura mínima**: cargar cada tab, verificar que renderiza sin errores en DevTools console.
**Gate**: 0 errores rojos en console por tab. Warnings amarillos OK.
**Si falla**: documentar en question/015, NO mergear.

### Paso 4 — axe-core retroactivo (gate informativo, NO bloqueante)
**Acción**: 1 corrida axe-core sobre preview URL home.
**Comparación**: contra equivalente sobre Vercel main (commit 3d50da2).
**Gate**: delta violations ≤ 0 (F2 no debe regresar a11y).
**Si delta > 0**: documentar en question/016 antes de merge. Si las violations son del refactor estructural (no de los visuales que F4 tocará), bloquear merge hasta resolver.

Cómo correr:
```bash
npx playwright test audit/baseline/axe_smoke.mjs --url <preview-url>
```
(crear `audit/baseline/axe_smoke.mjs` si no existe — usar `@axe-core/playwright`)

### Paso 5 — Lighthouse mobile sobre preview
**Acción**: 3 corridas Lighthouse mobile, reportar mediana.
**Baseline F0 (ref)**: Performance 46, Accessibility 94, LCP 4.239 ms.
**Gates**:
- Performance ≥ 40 (tolerancia -6 puntos vs F0)
- LCP ≤ 4.500 ms (tolerancia +6% vs F0)
- Accessibility ≥ 94 (no regresar)
**Si falla cualquier gate**: documentar en question/017, NO mergear.

### Paso 6 — Decisión merge a main
**Pre-condición**: pasos 1-5 todos verdes.
**Acción**: PR refactor/v2 → main, merge.
**Tras merge**: arrancar Fase 3 (decisión stack visual — recharts vs ECharts vs ambos para boxplot/heatmap/pirámide).

## Atribución

Co-autoría:
- Andrés Felipe Palacio Santamaría (decisiones arquitectónicas, revisión humana del plan, M1+M2 ajustes)
- Claude Opus 4.7 (1M context) — ejecución, plan crítico, validación
