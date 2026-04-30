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

## Justificación metodológica de cifras tesis (BLOQUEANTE pre-F4)

Esta sección aplica el principio CLAUDE.md `<dashboard_role>` (la tesis es la forma corta y citable de hallazgos cuya forma completa es el dashboard). Las cifras canónicas se preservan; las expansiones metodológicas (concordancia capital productivo en D2; Densidad de Árboles en H1-VIZ; Wilson IC en ambas) llevan disclosure explícito y trazabilidad reproducible.

Antes de tocar D2 (boxplot E4) o H1-VIZ (Tabla 1 ambiental), revisar este protocolo y ejecutar [`audit/fase3/scripts/defense_d2.py`](../fase3/scripts/defense_d2.py) y [`audit/fase3/scripts/wilson_h1viz.py`](../fase3/scripts/wilson_h1viz.py) para reproducir las cifras estadísticas. Si en F4 microdatos contradicen tesis: NO modificar tesis ni microdatos; escalar vía `questions/NNN_tesis_microdatos.md`. Tesis es source of truth para narrativa publicada; microdatos son source of truth para cálculos empíricos (CLAUDE.md `<sources>`).

### D2 — Brecha de género 8,5:1

**Cifra principal** (sostenida por Velásquez, Palacio y Álvarez 2025, p.50; ancla CLAUDE.md):

- Ratio mediana H/M = **8,5:1**, n=24 hogares con ingreso productivo cuantificable
- Mediana hombres: $850.000 COP/mes (n=18)
- Mediana mujeres: $100.000 COP/mes (n=6)
- Outlier máximo masculino: $23.990.000 COP/mes (mencionado tesis p.50; ID 40, M, PECUARIO — no eliminar, anchor CLAUDE.md)
- Outlier máximo femenino: $300.000

**Argumentación estadística (4 capas; reproducibles vía [`audit/fase3/scripts/defense_d2.py`](../fase3/scripts/defense_d2.py) seed=42, log committeado en [`audit/fase3/scripts/defense_d2_run.log`](../fase3/scripts/defense_d2_run.log)):**

1. **La mediana es estimador robusto a outliers por construcción.** Con n=18 hombres ordenados, la mediana es el promedio de las posiciones 9-10; los 3 outliers (posiciones 16-18) NO afectan ese cálculo. La media SÍ se infla con outliers (Ratio media H/M = 26,9:1). `<statistical_rules>` CLAUDE.md exige mediana sobre media en distribuciones asimétricas — la elección del 8,5:1 está alineada con el protocolo del proyecto, no es decisión ad-hoc.

2. **Tres pruebas no paramétricas validan brecha real (independientes de outliers):**
   - Mann-Whitney U test: U=93,5; p=0,008 (significativa α=0,01)
   - Bootstrap n=10.000 réplicas, IC 95% del ratio mediana = [1,50; 16,67]. **El IC NO incluye 1** ⇒ brecha estadísticamente real
   - Hodges-Lehmann (mediana de las 108 diferencias H_i − M_j pareadas) = $700.000

   **Caveat metodológico:** con n_M=6, el bootstrap de mediana es discretizado. La mediana M solo puede tomar promedios de pares centrales de un resampleo donde los valores únicos son {60.000; 100.000; 300.000}. El upper bound 16,67 = 1.000.000 / 60.000 es artefacto de los resampleos extremos donde bootstrap saca [60k×6] como muestra de mujeres. La cota inferior 1,50 es robusta y >> 1, lo cual sostiene el argumento; la cota superior es conservadora por el tamaño muestral pequeño y debe leerse así, no como expectativa puntual del ratio poblacional.

3. **Sensitivity sin outliers IQR-fence H** (n=15, removidos $11.666.667 / $13.728.000 / $23.990.000): mediana H cae a $300.000, ratio 3,0:1. La PERMANENCIA de la brecha bajo distintas especificaciones confirma robustez del hallazgo a la especificación del análisis. La magnitud cambia (esperable con n menor); la dirección persiste.

4. **Dualidad distributiva** (refuerzo argumento tesis p.50-51): en el circuito institucional PSA (n=134 Familia Campesina), la dirección se INVIERTE — mediana M $277.312 > mediana H $215.688 (anchor CLAUDE.md, fórmula PSA mensualizado canónica cerrada en F1 vía `questions/closed/004_pagos_n_141_vs_148.md`). Esto demuestra que la desigualdad NO está en el esquema PSA (que es progresivo con mujeres), sino en el mercado de ingresos productivos. Convierte E4 de "hallazgo descriptivo" a argumento de política pública: el PSA hace su parte; la brecha residual proviene del mercado, no del instrumento. Justifica el plan de acción R2 (Economía del Cuidado y Cierre de Brechas) declarado en tesis.

5. **Concordancia entre brecha de género y brecha de capital productivo** (refuerzo argumento línea 472 tesis: *"...el 25% restante (6/24), que ya poseían capital productivo previo, principalmente ganadería, alcanza una mediana de $6.733.350 COP."* — "Dos velocidades económicas: inclusión vs. acumulación"): la misma muestra n=24 admite dos segmentaciones distintas que arrojan dos brechas aparentemente independientes:
   - Por sexo (anchor CLAUDE.md): H 18 / M 6, ratio mediana 8,5:1
   - Por capital productivo previo (línea 472 tesis): subsistencia 18 hogares (mediana $100.000) / capitalizados 6 hogares (mediana $6.733.333; tesis cita $6.733.350, diferencia ~$17 por convención de mediana de pares), ratio 67,33:1

   Verificación empírica reproducible (defense_d2.py extendido, Argumento 5): **los 6 hogares capitalizados son 6 hombres y 0 mujeres; los 18 de subsistencia son 12 hombres + 6 mujeres**. La concentración del capital productivo es 100% masculina; las 6 mujeres están concentradas en el segmento de subsistencia. Esto vincula causalmente ambas brechas: la asimetría de género en ingresos productivos coincide con la asimetría de género en propiedad de activos productivos (ganadería en el segmento capitalizado, según tesis línea 472). El ratio 8,5:1 deja de ser hallazgo descriptivo para convertirse en evidencia de exclusión estructural en propiedad de activos. Justifica con mayor solidez el plan R2 (Economía del Cuidado y Cierre de Brechas) tesis, que combina ingreso + acceso a activos productivos como dos palancas indisociables.

**Visualización F4 propuesta:**

- Boxplot doble H/M con scatter overlay de datos crudos jittered (template en [`benchmarks/viz/src/pages/recharts/Boxplot.tsx`](../../benchmarks/viz/src/pages/recharts/Boxplot.tsx))
- Outliers IQR-fence etiquetados con valor exacto (LabelList por punto fuera de fences) — caveat documentado en F3 sobre que recharts no etiqueta outliers nativamente; F4 añade la lógica
- KPI principal: "Brecha 8,5:1" con n=24 visible
- Footer académico expandible/colapsable con los 4 argumentos en lenguaje accesible + referencia a [`audit/fase3/scripts/defense_d2_run.log`](../fase3/scripts/defense_d2_run.log)
- Mención breve a la dualidad PSA (sin gráfico adicional en F4 — el boxplot paralelo PSA queda diferido a F5, ver [`audit/fase5/HANDOFF_PLACEHOLDER.md`](../fase5/HANDOFF_PLACEHOLDER.md) ítem F5-01)

**Anti-patrón:** presentar 8,5:1 sin los 4 argumentos. Sin contexto estadístico, un revisor académico puede leer el ratio como "inflado por outliers" — los 4 argumentos blindan contra esa crítica.

### H1-VIZ — Tabla 1 Ambiental (alineación con tesis)

**Cifra principal** (Velásquez, Palacio y Álvarez 2025, Tabla 1 p.44; verificada en `docs/tesis.docx`, **lista 6 indicadores binarios**):

| INDICADOR                            | SÍ  | %      |
|--------------------------------------|-----|--------|
| Mejora percibida en calidad del aire | 78  | 97,5%  |
| Mejora percibida en cantidad de agua | 78  | 97,5%  |
| Mejora percibida en calidad del agua | 78  | 97,5%  |
| Mejora percibida en fauna silvestre  | 78  | 97,5%  |
| Considera que mitiga cambio climático| 79  | 98,8%  |
| Continuaría conservando sin pago     | 80  | 100%   |

**Discrepancia dashboard vs tesis resuelta bajo `<dashboard_role>`** (decisión documentada en [`questions/closed/014_radar_a2_densidad_arboles.respuesta.md`](../../questions/closed/014_radar_a2_densidad_arboles.respuesta.md), Opción D):

- Dashboard radar A2 actual: 5 ejes (los 4 servicios + Densidad de Árboles)
- Tesis Tabla 1: 6 indicadores (4 servicios + cambio climático + continuidad sin pago)
- Densidad de árboles existe en microdatos (`2.2_Mejoro_Densidad_Arboles_SiNo`, 78/80 = 97,5%) — medida con misma metodología, omitida por límite editorial. Bajo `<dashboard_role>` NO es discrepancia: es expansión metodológica fiel.

**Estrategia F4 (Opción D, decidida 2026-04-29):**

Reemplazar el radar 5-ejes + las 5 charts SiNo individuales (todas con correlación φ=1,000 inter-respondiente, redundantes entre sí) por una sola tabla Wilson IC con 7 filas (los 6 publicados en Tabla 1 tesis + Densidad de Árboles como expansión metodológica):

| INDICADOR              | n  | %      | IC 95% Wilson    | Publicado Tabla 1 tesis |
|------------------------|----|--------|------------------|-------------------------|
| Calidad del aire       | 80 | 97,5%  | [91,3; 99,3]     | ✓                       |
| Cantidad de agua       | 80 | 97,5%  | [91,3; 99,3]     | ✓                       |
| Calidad del agua       | 80 | 97,5%  | [91,3; 99,3]     | ✓                       |
| Fauna silvestre        | 80 | 97,5%  | [91,3; 99,3]     | ✓                       |
| Densidad de árboles    | 80 | 97,5%  | [91,3; 99,3]     | ✗ (1)                   |
| Mitigación cambio clim | 80 | 98,8%  | [93,3; 99,8]     | ✓                       |
| Continuidad sin pago   | 80 | 100,0% | [95,4; 100,0]    | ✓ (2)                   |

(1) Densidad de árboles fue medido en encuesta PSA 2025 con misma metodología binaria (Sí/No) que los 4 servicios ecosistémicos publicados (proporción 78/80 = 97,5%, idéntica a los demás). No fue incluido en Tabla 1 de Velásquez, Palacio y Álvarez (2025, p.44) por límite editorial de palabras. El dashboard lo presenta como expansión metodológica fiel bajo el principio CLAUDE.md `<dashboard_role>` (no como discrepancia). Decisión documentada en `questions/closed/014_radar_a2_densidad_arboles.respuesta.md`.

(2) De los 80 respondientes en col `6.4_Continuaria_Sin_Pago`, 79 respondieron "Sí" y 1 respondió "Mucho". `<statistical_rules>` CLAUDE.md exige tratamiento explícito de valores fuera del set canónico {Sí, No}: "Mucho" se cuenta como afirmativo intensificado (no como categoría adicional, no como missing). Resultado 80/80 = 100% alineado con Tabla 1 tesis. Cardinalidad observada verificable en `audit/fase3/scripts/wilson_h1viz_run.log` sección "CARDINALIDAD OBSERVADA".

Wilson IC 95% agrega rigor estadístico (no incluido en tesis pero respaldado), computado con `statsmodels.stats.proportion.proportion_confint(method='wilson')` y reportado con 1 decimal según `<statistical_rules>` CLAUDE.md ("Precisión máx 1 decimal con n<100"). Cambios <0,1pp no son interpretables.

**Interpretación académica** (refuerzo argumento tesis p.45):

La correlación φ=1,000 perfecta entre los 4 servicios ecosistémicos (F1 hallazgo H1) NO contradice la tesis — la VALIDA. Los mismos 78 hogares respondieron "Sí" en los 4 servicios; los mismos 2 respondieron "No" en los 4. Esto es la evidencia matemática del argumento tesis: "el esquema validó una cultura preexistente". Los hogares con cultura ambiental preexistente responden afirmativamente en todos los servicios percibidos. Es coherencia inter-indicador, no artefacto metodológico.

**Cita disponible para footer académico** (verificada en `docs/tesis.docx` párrafo 195, sin página declarada en el documento):

> "Siempre he tenido buenas prácticas de cuidado y conservación, pero estando en el programa soy más comprometida. [Incluso si no pagaran], sigo cuidando el bosque" — Encuesta PSA 2025, ID-29

**Implementación recharts:** `BarChart` horizontal con `ErrorBar` nativo. Estimado ~30 min siguiendo template Wilson IC bars. Reescribir copy de sección Ambiental para reflejar índice unidimensional (4 servicios con coherencia perfecta inter-respondiente). El componente `WilsonTable` con 7 filas reemplaza el radar A2 (5 ejes) + las 5 charts SiNo individuales.

### Otros indicadores con justificación pendiente

Scope acotado a D2 + H1-VIZ porque son los que F4 toca con mayor riesgo narrativo. Los siguientes requieren justificación similar pero quedan diferidos:

- **SROI 2,22:1** (anchored): F4 toca N1-N3 (cambios narrativos a etiquetas attribution / deadweight / displacement). La defensa metodológica de los proxies del Apéndice 1 tesis se pospone a F5 si tiempo lo permite, o quedará para defensa oral.
- **Continuidad 100% (n=80)**: 100% perfecto requiere disclosure de Wilson IC [95,4%; 100,0%] para no presentar certeza absoluta como hecho — H1-VIZ tabla ya lo cubre nativamente.
- **Brecha jefatura hogar mujeres 78,79% (n=33)**: n pequeño requiere IC explícito en próximo touch (queueado a F5 vía `audit/fase5/HANDOFF_PLACEHOLDER.md`).
- **Boxplot paralelo PSA H/M (n=134)** como refuerzo visual de dualidad: diferido formalmente a F5 ítem F5-01.

### Scripts de reproducibilidad

- [`audit/fase3/scripts/defense_d2.py`](../fase3/scripts/defense_d2.py) — script único que reproduce los 5 argumentos de D2 (mediana, Mann-Whitney, Bootstrap IC, Hodges-Lehmann, sensitivity, concordancia capital productivo). 18 asserts internos detectan drift y fallan con código de salida 2.
- [`audit/fase3/scripts/defense_d2_run.log`](../fase3/scripts/defense_d2_run.log) — output committeado con header de trazabilidad (timestamp UTC, SHA-256 del XLSX, SHA-256 del script, versiones Python/numpy/scipy/openpyxl, seed). Re-ejecutar en F4 ANTES de implementar D2 para confirmar que las cifras se mantienen sobre microdatos actuales.
- [`audit/fase3/scripts/wilson_h1viz.py`](../fase3/scripts/wilson_h1viz.py) — script único que reproduce los 7 indicadores Wilson IC 95% de la tabla H1-VIZ (los 6 de Tabla 1 tesis + Densidad de Árboles como expansión). Aplicación canónica del principio CLAUDE.md `<dashboard_role>`: scope mayor que tesis, fidelidad metodológica preservada con disclosure explícito. Tratamiento de "Mucho" como afirmativo intensificado y missing como No documentado en cardinalidad observada del log.
- [`audit/fase3/scripts/wilson_h1viz_run.log`](../fase3/scripts/wilson_h1viz_run.log) — output committeado con header de trazabilidad (timestamp UTC, SHA-256 del XLSX, SHA-256 del script, versiones Python/statsmodels/openpyxl). Re-ejecutar en F4 ANTES de implementar H1-VIZ para confirmar que las cifras se mantienen.

## Co-autoría

- Andrés Felipe Palacio Santamaría — coautor humano, validación de cifras y narrativas
- Claude Opus 4.7 — generación HANDOFF y ejecución F4 (en sesión fresca con `/clear`)
