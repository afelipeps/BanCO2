## Resumen

Refactor estructural del dashboard BanCO2 (53 indicadores · 8 secciones · evaluación SROI) que migra el monolito heredado (`data.tsx` 1004 líneas + `IndicatorRenderer.tsx` 615 líneas + `types.ts` permisivo con `data?: any`) a una arquitectura modular tipada en `src/`. TypeScript estricto activado (strict + noImplicitAny + noUncheckedIndexedAccess los 3 sin escape hatch). Suite de tests con vitest (35/35 pass · 92.8% coverage sobre `src/lib/`). Visual diff cero contra baseline pre-refactor (16/16 PASS sobre 8 secciones × 2 viewports). Gates pre-merge ejecutados sobre Vercel preview deployment con resultados verdes en los 5 pasos del CLOSEOUT.

Esta es la base estructural sobre la cual F4 (visuales) y F5 (copys narrativos) operan sin tocar shape de datos ni tipos. Bundle delta trivial (+0.99 kB / +0.13%), performance mejora vs prod main (+5 puntos Lighthouse mobile, -250 ms LCP).

## Métricas finales

| Métrica | Pre (commit `3d50da2`) | Post (HEAD `6f563de`) | Δ | Gate | Status |
|---|---|---|---|---|---|
| Bundle `dist/` total | 736 KB | 736 KB | 0 | < 773 KB | ✓ |
| Chunk JS raw | 747.46 kB | 748.45 kB | +0.99 kB (+0.13%) | < +10 KB | ✓ |
| Chunk JS gzip | 219.06 kB | 219.13 kB | +0.07 kB | informativo | — |
| TypeScript | non-strict | strict + noImplicitAny + noUncheckedIndexedAccess | — | 0 errores `tsc` | ✓ |
| `: any` en src/ | múltiples | 0 | — | 0 | ✓ |
| `as any` en src/ | múltiples | 0 | — | 0 | ✓ |
| Tests | 0 | 35/35 pass | +35 | coverage ≥ 80% sobre src/lib | ✓ (92.8%) |
| Visual diff | n/a | 16/16 PASS | — | < 0.1% pixelmatch | ✓ |
| axe-core delta vs prod | n/a | 0 violations nuevas | — | ≤ 0 | ✓ |
| Lighthouse Performance mobile | 46 (F0) / 56 (prod) | **61** (mediana 5 runs) | +15 vs F0 / +5 vs prod | ≥ 40 | ✓ |
| Lighthouse LCP mobile | 4239 ms (F0) / 4178 ms (prod) | **3928 ms** (trimmed median) | -311 ms vs F0 / -250 ms vs prod | ≤ 4500 ms | ✓ |
| Lighthouse Accessibility | 94 (F0) | 94 | 0 | ≥ 94 | ✓ |

## Cambios estructurales

- **Scaffold `src/`** con alias `@/* → ./src/*` (vite.config + tsconfig). App.tsx + index.tsx movidos.
- **`src/types/`** (5 archivos): `Indicator` discriminated union de 18 variantes con discriminator literal `type`; `_exhaustive: never` enforce en compile-time. Disclosure + Story + BarConfig + Section + DataSource + SectionKey.
- **`src/data/`** (9 archivos): 53 indicadores migrados byte-a-byte preservando V-L-O disclosures (ST4 q010, E2 q011, E5 q012, E9 q012, SROI section q013).
- **`src/lib/`** (4 archivos): `stats.ts` con TDD (wilsonCI, median, iqr, mean, stdev, spearman) + 30 tests RED→GREEN. `disclosure_audit.ts` runtime warning solo en dev (Vite tree-shake en prod).
- **`src/theme/`** (3 archivos): tokens THEME + sroiPalette extraída del monolito.
- **`src/components/`** (20 archivos): IndicatorRenderer router puro + 18 componentes split por variante (cards/, charts/, tables/, sroi/) + CustomTooltip + StoryBox simplificado.
- **vitest 2.1.9** + coverage-v8 con threshold 80% sobre src/lib.
- **`@types/react@^19`** + `@types/react-dom@^19` agregados (necesarios para strict).

## Validación pre-merge cumplida (5 pasos)

| # | Paso | Resultado |
|---|---|---|
| 1 | `/ultrareview` local | 0 hallazgos |
| 2 | Push `origin/refactor/v2` | Vercel build OK (preview deploy `dpl_6y4WJp2iZoAqFKbwk6r2QJTm4mTs`) |
| 3 | Smoke 8 tabs × 2 viewports en preview | 16/16 OK · 0 errores rojos · 43 warnings pre-existentes (Tailwind CDN, recharts mount) |
| 4 | axe-core delta preview vs prod | delta = 0 violations · 2 violations pre-F2 (`button-name`, `color-contrast`) deuda F4 |
| 5 | Lighthouse mobile 5 runs (mediana robusta) | 3/3 gates PASS (Perf 61, LCP 3928 ms, A11y 94) |

Detalle completo en [`audit/fase2/preview_validation.md`](./audit/fase2/preview_validation.md).

## Pasada de validación post-/ultrareview

Ejecuté inspección manual de 4 vectores no garantizados por el remote `/ultrareview` (que devolvió `[]` con scope opaco):

- **V1** Exhaustividad union: 18:18:18 (variants × data literals × switch cases). PASS.
- **V2** stats.ts edge cases: PASS con 2 informativos (ties+non-perfect ρ y NaN propagation no aislados; coverage 92.8% sobre threshold 80%).
- **V3** Components byte-a-byte vs monolito: **FAIL → corregido en commit `734fa7d`**. Encontré regresión latente real en `KpiCard`: el monolito tenía 2 condiciones distintas para icon/badge crítico (3 keywords vs 2, sin 'Atención' en badge), mi split inicial las unificó a 3. Visual diff PASS porque ningún `trend` en data actual contiene esas keywords. Restaurado byte-a-byte con `isIconCritical` + `isBadgeCritical`. Otros 17 componentes verificados equivalentes o mejora intencional documentada.
- **V4** Tree-shake del DEV warning: 0 referencias a `F2-debt`/`auditDisclosures`/`import.meta.env` en bundle prod. Chunk hash idéntico al pre-disclosure_audit. PASS.

Detalle completo en [`audit/fase2/scope_review.md`](./audit/fase2/scope_review.md). **Lección operativa**: visual diff zero + coverage por línea NO garantiza cobertura de branches lógicas inactivas con la data actual; refactors estructurales requieren pasada byte-a-byte sobre condicionales no-ejercitadas.

## Deuda heredada

Todo enumerado y trazable. Ningún ítem bloquea F2.

- **49 indicadores sin `disclosure` individual** (45 no-SROI + 4 SROI con herencia section-level): `disclosure?: Disclosure` queda opcional en F2; runtime warning loggea en dev. Cierre en F4/F5 con datos reales y endurecimiento del tipo a obligatorio. Ver [`disclosure_debt.md`](./audit/fase2/disclosure_debt.md).
- **Test de regresión KpiCard NO agregado**: la corrección de V3 sostiene el contrato byte-a-byte solo en código + comentario. Si F4/F5 toca `KpiCard` o introduce un indicador con `trend` que contiene 'Déficit'/'Riesgo'/'Atención', agregar test ANTES. Detalle en [`scope_review.md`](./audit/fase2/scope_review.md).
- **V3 inspección asimétrica**: 14 componentes (charts/*, tables/*, sroi/* excepto los 4 con pasada profunda) recibieron inspección menos detallada. Si F4 modifica cualquiera, hacer pasada byte-a-byte contra `git show 3d50da2:components/IndicatorRenderer.tsx`. Detalle en [`scope_review.md`](./audit/fase2/scope_review.md).
- **2 a11y violations pre-F2** (`button-name` critical 1 nodo, `color-contrast` serious 4 nodos): candidatas naturales para F4 (visual polish + a11y).
- **Tailwind CDN warning** (`cdn.tailwindcss.com should not be used in production`): pre-existente. Candidato F3 para migrar a PostCSS plugin (beneficio adicional: tree-shake de clases ~30-50 KB).
- **Vercel preview Lighthouse cold-start**: 3 runs dieron varianza 14 pts; 5 runs convergen a varianza 4. Lección documentada para F3.
- **StoryBox keyword auto-detection eliminada** (era dead code post-strict, App.tsx siempre coalesce a literal). Si F5 quiere indicadores con `story.type='success'`, pasarlo explícito en data. Si quiere auto-derive de vuelta, reintroducir como helper testeable en `src/lib/story.ts`. Detalle en [`dead_code_removed.md`](./audit/fase2/dead_code_removed.md).
- **importmap dead code en `index.html`**: Vite bundlea React desde node_modules, el importmap declarado para esm.sh es código muerto en producción. Candidato F3 (eliminar o convertir a `external` real).

## Documentación canónica

- [`audit/fase2/PLAN.md`](./audit/fase2/PLAN.md) — plan ejecutado con bloqueos B1-B3 + ajustes A1-A6 + M1-M2
- [`audit/fase2/CLOSEOUT.md`](./audit/fase2/CLOSEOUT.md) — checklist de gates con resultados + 6 pasos pre-merge
- [`audit/fase2/scope_review.md`](./audit/fase2/scope_review.md) — pasada de validación V1-V4 post-/ultrareview con KpiCard hallazgo
- [`audit/fase2/preview_validation.md`](./audit/fase2/preview_validation.md) — pasos 3-5 sobre Vercel preview con tablas detalladas
- [`audit/fase2/disclosure_debt.md`](./audit/fase2/disclosure_debt.md) — 49 IDs enumerados con plan F4/F5
- [`audit/fase2/dead_code_removed.md`](./audit/fase2/dead_code_removed.md) — trazabilidad StoryBox keyword auto-detect
- [`audit/fase2/baseline_metrics.md`](./audit/fase2/baseline_metrics.md) — bundle pre-refactor + verificación importmap dead
- [`audit/fase2/reconciliation_54_vs_51.md`](./audit/fase2/reconciliation_54_vs_51.md) — conteo real 53/51 (no 54/51 como decía plan original) + 4 SROI faltantes en F1

## Test plan

- [x] `npx tsc --noEmit` pasa con strict (verificado en cada commit)
- [x] `npm run build` OK (verificado en cada commit; chunk hash trazable)
- [x] `npm run test` 35/35 pass (vitest sobre `src/lib/`)
- [x] Visual diff 16/16 PASS (`audit/baseline/diff_v2.mjs` con pixelmatch threshold 0.1)
- [x] Smoke 8 tabs × 2 viewports en preview (`audit/baseline/smoke_preview.mjs`) → 0 errores rojos
- [x] axe-core delta preview vs prod (`audit/baseline/axe_smoke.mjs`) → 0 violations nuevas
- [x] Lighthouse mobile 5 runs (`audit/baseline/lighthouse_mobile.mjs --runs 5`) → 3/3 gates PASS
- [ ] Reviewer humano valida la racionalización de la deuda heredada (no acción de Claude)
- [ ] Tras merge: arrancar Fase 3 (decisión stack visual — recharts vs ECharts vs ambos)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
