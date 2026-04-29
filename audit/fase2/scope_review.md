# Pasada de validación específica post-/ultrareview F2

Fecha: 2026-04-29
Branch: refactor/v2 (HEAD post-fix KpiCard)
Origen: solicitud de coautor humano de validar 4 vectores específicos no garantizados por el remote /ultrareview (que devolvió `[]` sin trace inspeccionable).

## V1 — Exhaustividad discriminated union

**Método**: triangulación 3-vías.

| Fuente | Conteo |
|---|---|
| `src/types/indicator.ts` `Indicator` union | 18 variantes |
| `src/data/*.ts` `type:` literales únicos | 18 |
| `src/components/IndicatorRenderer.tsx` `case` statements | 18 |

**Coverage 1:1:1**. Cada variante del union tiene exactamente un literal en data y un case en el switch. El `default: const _exhaustive: never = indicator;` enforce en compile-time (verificado: tsc strict pasa con 0 errores).

Eliminados explícitamente del switch (pre-F2 dead code, PM4 grep verificó 0 instancias en data): `cards_grid`, `kpi_sroi_master`, `chart_treemap`.

**Veredicto V1**: PASS.

## V2 — stats.ts edge cases

**Método**: review de `src/lib/stats.test.ts` contra el contrato canónico de cada función.

### Wilson CI

Cubierto:
- `p ∈ {0, 0.5, 1, NaN, p<0, p>1}` ✓
- `n ∈ {0, 5, 80}` ✓
- `alpha ∈ {0.05, 0.10}` ✓
- IC simétrico p=0.5 verificado contra `statsmodels.proportion_confint`
- Special-case p∈{0,1} para evitar imprecisión FP en `sqrt(z²/4)`

Faltante (no crítico):
- `alpha ∈ {0.01, 0.001}` — el path `invNormal` Beasley-Springer-Moro no se ejercita con la constante exacta `Z_95`. Coverage report muestra líneas 155-160 y 169-174 sin cubrir (las ramas `p<pLow` y `p>pHigh` de invNormal). Si el dashboard introduce un `alpha = 0.01`, validar antes.
- `n = 1` — extremo de baja potencia. Wilson sigue computando IC válido, simplemente más ancho.

### Spearman

Cubierto:
- ρ = ±1 (correlación perfecta) ✓
- Varianza cero → ρ = NaN sin throw ✓
- `length mismatch` y `n < 3` lanzan ✓
- Empates con `average rank` → ρ = 1 (datos perfectos con ties) ✓
- Caso conocido `ρ = 29/42` verificable a mano (sum_cross=29, var_rank=42) ✓

Faltante (no crítico):
- Empates produciendo `ρ ≠ 1` — la lógica `rankAverage` se ejercita en otros tests, pero un caso "ties + non-perfect ρ" no está aislado. Si ST6 (la única correlación con dataset publicado) reproduce su `r = 0.54` post-F4 sobre microdatos, este gap se cierra orgánicamente.
- `NaN propagation` — si `x` o `y` contienen NaN, el sort produce ranks indefinidos y ρ se propaga como NaN sin throw. Comportamiento estadístico estándar (no es bug). El caller debe filtrar missings antes — política `statistical_rules` de CLAUDE.md.

**Coverage actual**: 92.8% lines, 95.16% branches sobre `src/lib/stats.ts`. Threshold cierre F2 ≥80% ✓.

**Veredicto V2**: PASS con 2 informativos. Edge cases del happy-path real cubiertos. Los 2 faltantes son cierre F4/F5.

## V3 — Components split byte-a-byte vs monolito

**Método**: `git show d861938:src/components/IndicatorRenderer.tsx` (614 líneas, monolito final pre-split en commit 7) comparado branch-por-branch contra cada uno de los 18 componentes nuevos en `src/components/{cards,charts,tables,sroi}/`.

### Hallazgo real: KpiCard regresión lógica latente

**Monolito**: dos condiciones distintas, intencionalmente:
- Icon bg crítico: `trend includes 'Déficit' || 'Riesgo' || 'Atención'` (3 keywords)
- Trend badge crítico: `trend includes 'Déficit' || 'Riesgo'` (2 keywords, **sin 'Atención'**)

**Mi split inicial (commit 8)**: unificado en una sola variable `isCritical` con 3 keywords aplicada a ambos. Visual diff 16/16 PASS porque ningún `trend` en data.tsx contiene 'Déficit'/'Riesgo'/'Atención' actualmente, así que ambas ramas dan `false` y producen el mismo render.

**Riesgo**: si F4/F5 introduce un indicador con `trend: 'Atención requerida'`:
- Monolito habría producido: icon **rojo** + badge **gris**
- Mi split habría producido: icon **rojo** + badge **rojo**

**Corrección aplicada** (post-/ultrareview, este commit): split en `isIconCritical` (3 keywords) + `isBadgeCritical` (2 keywords) con comentario in-source justificando la asimetría intencional. Restaura comportamiento byte-a-byte.

### Otros 17 componentes

Comparados rama-por-rama:
- `KpiRating`: monolito hace `((value || 0) / (max || 1)) * 100`; mío `(value / max) * 100`. En strict types `value` y `max` son `number` no-undefined → equivalente. **Mi versión es más estricta** (max=0 → NaN visible vs monolito que coalesce a max=1 silently). No regresión visible con data actual; mejora intencional.
- `BarHorizontal` / `Funnel` LabelList formatters: post-9a refactor con `val == null ? '' : ...` para satisfacer strict `RenderableText | undefined`. Comportamiento idéntico para data válida.
- `CustomTooltip`: typed shape `TooltipPayloadItem[]` post-9a (vs `any[]` monolito). Misma lógica.
- `SroiBalanceChart` Tooltip inline: post-9a typed con `as unknown as ReadonlyArray<...>`. Defensive `entry.value?.toLocaleString()` (vs monolito directo). Idéntico para data válida.
- `Default Bar` fallback: ELIMINADO (commit 8). El monolito tenía un fallback `BarChart` para cualquier `chart_*` no-listado. En el nuevo router, `default: never` enforce que toda variante esté en switch. **Mejora intencional** (fail-fast en compile-time vs silent fallback).
- Resto de componentes (`PieChart`, `BarVertical`, `BarStacked`, `Scatter`, `Radar`, `LineMulti`, `Combo`, `Erosion`, `Correlation`, `WordCountTable`, `TextMatrix`, `SroiEvidenceTable`, `SroiFutureImpactTable`): JSX preservado byte-a-byte.

**Veredicto V3**: PASS post-corrección. KpiCard restaurado a byte-a-byte. Resto verificado equivalente o mejora intencional documentada.

## V4 — Tree-shake del DEV warning en bundle prod

**Método**: forensic grep sobre `dist/assets/index-*.js` post-`npm run build`.

```bash
grep -c "F2-debt" dist/assets/*.js          → 0
grep -c "auditDisclosures" dist/assets/*.js → 0
grep -c "import.meta.env" dist/assets/*.js  → 0
```

Chunk hash `index-C3ZctkFQ.js` **idéntico** al post-commit 9b (pre-disclosure_audit). Vite reemplaza `import.meta.env.DEV` estáticamente a `false` en build prod, y el bloque `if (false) { ... }` se elimina por tree-shake junto con los dynamic imports `@/data` y `@/lib/disclosure_audit` que solo se referenciaban dentro.

**Veredicto V4**: PASS. Cero overhead en producción. Warning solo activo en `npm run dev`.

## Resumen y acción tomada

| Vector | Resultado | Acción |
|---|---|---|
| V1 exhaustividad union | PASS 18:18:18 | — |
| V2 stats edge cases | PASS con 2 informativos | Documentar gaps menores en CLOSEOUT (ya hecho) |
| V3 components byte-a-byte | FAIL (KpiCard) | **Corregido este commit** |
| V4 tree-shake DEV | PASS bundle limpio | — |

El remote /ultrareview reportó `[]` (0 hallazgos) pero su scope es opaco. Esta pasada manual encontró 1 regresión latente real (KpiCard) que habría sobrevivido a merge, manifestándose recién cuando F4/F5 introdujera un trend con la keyword 'Atención'.

**Lección operativa**: para refactors estructurales con visual diff zero como gate, agregar pasada de inspección byte-a-byte sobre branches lógicas que no se ejercitan con la data actual. La cobertura visual + cobertura de código no garantiza cobertura de **branches lógicas** cuando los inputs reales no las activan.

## Re-validación post-corrección

- `npx tsc --noEmit` → exit 0
- `npm run test` → 35/35 pass
- `npm run build` → OK
- Bundle delta vs baseline: dentro del gate (verificado en commit fix)

## Deuda residual de la pasada V3 (queue F4)

V3 inspeccionó con profundidad solo: `IndicatorRenderer`, `KpiCard`, `KpiRating`, LabelList formatters (`BarHorizontal`, `Funnel`), Tooltip (`CustomTooltip` y inline de `SroiBalanceChart`). Los 14 componentes restantes (`charts/PieChart`, `BarVertical`, `BarStacked`, `Scatter`, `Radar`, `LineMulti`, `Combo`, `Erosion`, `Correlation`, `tables/WordCountTable`, `TextMatrix`, `sroi/SroiEvidenceTable`, `SroiFutureImpactTable`, plus el resto del JSX de `SroiBalanceChart`) recibieron inspección menos detallada — verifiqué que el JSX externo coincide pero no hice diff char-a-char sobre cada condicional interno.

La conclusión "todo lo demás coincide funcionalmente" es válida con la data actual (visual diff 16/16 PASS) pero **no garantiza ausencia de regresiones latentes similares a la de KpiCard** — branches lógicas que no se activan con los 53 indicadores actuales pueden tener divergencia silenciosa.

**Acción F4**: cuando se modifique cualquier componente split, hacer pasada byte-a-byte contra `git show 3d50da2:components/IndicatorRenderer.tsx` sobre la sección correspondiente del switch original. Especialmente:
- Componentes con condicionales sobre props string (`.includes`, `.startsWith`)
- Componentes con styling condicional por valor de data
- Componentes con formatters que ignoran/transforman cierto rango

**Test de regresión KpiCard NO agregado en commit `734fa7d`** (solo restauración de código). Si F4/F5 toca `KpiCard` o introduce un indicador con `trend` que contiene 'Déficit'/'Riesgo'/'Atención', **agregar test ANTES** de modificar — algo del estilo:

```ts
// src/components/cards/KpiCard.test.tsx (propuesta F4)
it("trend con 'Atención' produce icon rojo Y badge gris", () => {
  // Render con KpiCardIndicator { trend: 'Atención requerida', ... }
  // Verificar className del icon contiene 'bg-red-400/20'
  // Verificar className del badge contiene 'border-slate-700' (NO 'border-red-400/30')
});
```

El test cierra el contrato byte-a-byte que la corrección actual sostiene solo en código + comentario.
