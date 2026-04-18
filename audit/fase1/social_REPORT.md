# Fase 1 — Auditoría sección Social

**Estado:** ejecutado con **3 bloqueos pendientes**, requiere input humano · **Rama:** `refactor/v2` · **Sección:** Social (id `SOC`, 9 indicadores S1–S9 + validación transversal, data.tsx líneas 294-435) · **Fecha run:** 2026-04-18

## Resumen ejecutivo

Social produjo el output más alarmante del Tiempo 2: **3 bloqueos concentrados en S1 "Desacople del Incentivo"** con discrepancias de 8,73 a 22,85 pp vs microdatos — magnitudes que sólo pueden explicarse por (a) fuente de datos distinta a `Datos_Normalizados` (p.ej. `Pagos` cohortado por FASE), (b) cohortamiento distinto al del auditor, o (c) valores sintéticos/ilustrativos. Flagged en [questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md). El ancla transversal **"Continuaría sin pago: 100% (n=80)"** reconcilia como 98,75% (79/80), 1,25 pp exactos de diff — handoff abierto en [questions/009](../../questions/009_ancla_continuaria_sin_pago.md). Fuera de S1 y el ancla, los otros 8 indicadores reconcilian dentro de tolerancia `ok` o `nota`. 4 de 10 violan visual_rules.

## Hallazgos por indicador

### S1 — Desacople del Incentivo · `chart_line_multi` — **3 bloqueos + 2 handoffs**

Publica 4 puntos temporales (fases A-D) con dos series bienestar/compromiso. Al cruzar contra `1.9_Año_Ingreso` en `Datos_Normalizados` con cohortes A=pre-2019, B=2019-2020, C=2021-2022, D=2023+:

| Serie × cohorte | Valor código | Valor real | Diff (pp) | Severidad |
|---|---|---|---|---|
| bienestar_A | 71,4% | 60,0% (9/15) | 11,40 | **bloqueo** |
| bienestar_B | 43,8% | 45,45% (10/22) | 1,65 | handoff |
| compromiso_B | 100,0% | 95,45% (21/22) | 4,55 | handoff |
| bienestar_C | 26,7% | 3,85% (1/26) | 22,85 | **bloqueo** |
| bienestar_D | 14,8% | 23,53% (4/17) | 8,73 | **bloqueo** |
| compromiso_A, C, D | — | ok / nota | <1 pp | ok/nota |

**Hipótesis preferida**: S1 podría estar calculándose sobre `Pagos` cohortado por `FASE` (la hoja Pagos tiene columna `FASE` con valores A/B/C/A+B/B+C). En ese caso, auditarlo contra `Datos_Normalizados` es inapropiado; el auditor de Económica (Tiempo 3) debería reauditarlo. Ver [questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md).

### S2 — Destino de la Inversión PSA · `chart_bar_horizontal`

- 3 ok + 1 nota. Reconcilia al pp.
- Viz marcada como `viz_viola_rules=True` — probablemente por usar bar sobre categorías que podrían ir como diverging / heatmap. Pendiente de decisión Fase 4.

### S3 — Capacidad de Ahorro · `chart_bar_vertical`

- 3 ok. Reconcilia perfectamente.

### S4 — Acceso a Educación · `kpi_card`

- 1 ok. Reconcilia.

### S5 — Salud (Estufas) · `kpi_card` — **viz viola rules, hallazgo de copy**

- `tiene_estufa_story = 18,75%` ok (0,05 pp diff).
- `kpi_100_sin_fuente = 100%` en el código — **el KPI publica "100%"** mientras el story interno de ese indicador habla de 18,75%. Diff 81,25 pp. Probablemente el KPI refiere a otra métrica (p.ej. "100% de las familias con estufa reducen leña") que no se audita contra `tiene_estufa`. Handoff por revisión de copy.

### S6 — Participación Comunitaria · `chart_pie` — **viz viola rules**

- 1 ok + 1 nota. Pie de 2 categorías viola `<visual_rules>`.
- Discrepancia menor (0,41 pp) viene de denominador con/sin NaN (80 vs 79). Reportar missing rate explícito (1,25%).

### S7 — Relaciones Vecinales · `chart_pie` — **viz viola rules**

- 2 ok. Pie de 2 categorías viola regla; fix es barra Wilson en Fase 4.

### S8 — El Valor del Tiempo · `chart_bar_horizontal`

- 3 ok + 1 handoff (`ahorro_horas_mediana`: código 3,7 h vs real 5,0 h; diff 1,3 h). Discrepancia menor; pendiente verificación de si el código redondea hacia abajo o usa una muestra distinta.

### S9 — Liderazgo Femenino · `chart_bar_stacked`

- 2 ok. Reconcilia al pp.

### S_ANCLA — Continuaría sin pago (validación transversal)

- 1 handoff. Ancla del `<anchors>`: 100%. Real: 79/80 = 98,75%. Diff exacto 1,25 pp.
- 1 caso disidente. Investigación pendiente de si es respuesta genuina o missing imputado. Ver [questions/009](../../questions/009_ancla_continuaria_sin_pago.md).

## Reconciliación contra anclas

| Ancla | Valor | Reconciliación | Estado |
|---|---|---|---|
| `poblacion.jefatura.global_prop` | 0,8750 | validación transversal → 0,8750 | ok |
| `continuaria.sin_pago` (declarada en CLAUDE.md) | 1,0000 | S_ANCLA → 0,9875 | **handoff (diff 1,25 pp)** |

El ancla "continuaría sin pago 100%" está **al borde del umbral handoff**. Resolución en questions/009.

## Questions abiertas

- [008](../../questions/008_s1_desacople_incentivo_bloqueos.md) — S1 3 bloqueos. Bloqueante para cierre Fase 1.
- [009](../../questions/009_ancla_continuaria_sin_pago.md) — Ancla "continuaría sin pago 100%" vs 98,75%.

## Decisiones metodológicas aplicadas

- **29 filas de Resumen sobre 10 indicadores** (incluye S_ANCLA como "indicador" transversal para reconciliar ancla).
- **Wilson CI** para todas las proporciones binomiales (S5–S7, S9).
- **Mediana + IQR** para S3 `Capacidad_Ahorro` y S8 `Ahorro_Horas`.
- **No se computó Spearman** en S2 (correlación destino × capacidad ahorro) porque el código no la publica; dejar como posible hallazgo para Fase 2.
- **S1 bloqueado para análisis**: el auditor emitió `IndicadorResultado` con severidad bloqueo y dejó nota "pendiente investigar fuente". No se forzó interpretación.

## Severidades (output `summarize_severities`)

```
S1: {'ok': 3, 'nota': 0, 'handoff': 2, 'bloqueo': 3}
S2: {'ok': 3, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
S3: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
S4: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
S5: {'ok': 1, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
S6: {'ok': 1, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
S7: {'ok': 2, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
S8: {'ok': 3, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
S9: {'ok': 2, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
S_ANCLA: {'ok': 0, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
```

Total: 19 ok / 2 nota / 5 handoff / **3 bloqueo**.

## Recomendación

**Piloto de sección con flags graves.** La metodología soportó el análisis sin modificaciones a `common.py`, pero S1 genera 3 bloqueos que no son auditables hasta investigar la fuente real. Recomendación operativa:

1. Resolver questions/008 (S1) antes de pasar a Fase 3. Probable ruta: auditor de Económica reaudit S1 sobre hoja `Pagos` cohortado por `FASE`.
2. Resolver questions/009 (ancla continuar sin pago) — trivial si el caso disidente es inspeccionable manualmente.
3. Fuera de esos dos, la sección Social pasa al siguiente escalón (Fase 2 correlaciones, Fase 3 stack).
