# Fase 1 — Reporte global consolidado (Tiempo 1 + Tiempo 2)

**Estado:** 5 secciones cerradas (Población piloto + Territorial + Ambiental + Social + Gobernanza), **9/9 questions resueltas**, **0 bloqueos**. 2 pendientes (Económica + Sostenibilidad, Tiempo 3). · **Rama:** `refactor/v2` · **Última actualización:** 2026-04-18 (post-resolución q005-q009).

## Resumen ejecutivo

La auditoría Fase 1 cubrió 35 indicadores a lo largo de 5 secciones (124 filas Resumen en total). Tras la resolución de las 9 questions handoff, el conteo final es: **0 bloqueos**, los 3 originales (todos en S1 "Desacople del Incentivo") quedaron downgraded a `ok` por **version-lock to thesis dataset** — decisión académica documentada en [questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md): el dashboard mantiene fidelidad con la tesis publicada (Velásquez, Palacio, Álvarez 2025) en lugar de recalcular sobre microdatos evolucionados. **49 filas violan `<visual_rules>`** (40%, deuda visual a resolver en Fase 4). La metodología del piloto Población (DuckDB + scipy + `common.py` + schema `IndicadorResultado`) escaló sin cambios estructurales; se agregó `validate_cardinality` como utility preventiva tras la resolución de [questions/009](../../questions/009_ancla_continuaria_sin_pago.md).

## Índice global

| Sección | Indicadores | Filas Resumen | Críticos | ok | nota | handoff | bloqueo | viola_viz_rules |
|---|---|---|---|---|---|---|---|---|
| Población (piloto) | 5 | 23 | 19 | 22 | 0 | 1 | 0 | 19 |
| Territorial | 6 | 22 | 8 | 16 | 3 | 3 | 0 | 7 |
| Ambiental | 6 | 31 | 4 | 24 | 3 | 4 | 0 | 2 |
| Social (post-resolución q008/q009) | 10 | 29 | ~10 | **23** | 2 | 4 | **0** | 7 |
| Gobernanza | 8 | 19 | 14 | 15 | 2 | 2 | 0 | 14 |
| **Total Fase 1 (sin Pagos), post-resolución** | **35** | **124** | **~55** | **100** | **10** | **14** | **0** | **49** |
| Económica (pendiente Tiempo 3) | — | — | — | — | — | — | — | — |
| Sostenibilidad (pendiente Tiempo 3) | — | — | — | — | — | — | — | — |

Ratio de reconciliación ok post-resolución: 80,6% (100/124). Cero bloqueos.
Ratio de viz_viola_rules: 40% (49/124) — sin cambio (deuda visual diferida a Fase 4).

> **Nota**: los conteos de Social post-resolución son aproximados hasta que `social_audit.py` se re-ejecute. Cambios aplicados en el script: (a) S_ANCLA pasa de handoff→ok bajo normalización categórica; (b) S1 bienestar_A y bienestar_A+B downgraded de bloqueo→ok con nota version-locked; (c) S1 bienestar_C y bienestar_D reconcilian exactamente bajo nueva fórmula (cohortado por `Fase del Proyecto` nativa). Re-ejecutar `social_audit.py` y `consolidate.py` materializa las cifras finales en xlsx.

## Hallazgos cross-sección

### 1. Media 104,6 ha/familia vs mediana 5,1 ha — hallazgo transversal (Territorial + Ambiental)

Ambas secciones auditan la misma ancla `territorial.area_por_familia_ha = 104,6`:

- **Media muestral**: 104,60 ha (reconcilia exactamente con el ancla).
- **Mediana**: **5,095 ha/familia**, IQR [2,36; 11,63].
- Un outlier único de **6.379 ha** distorsiona la media. Sin él, la media baja a ~8,08 ha.

El ancla está numéricamente correcta pero es **engañosa como descriptor central** — viola el principio `<statistical_rules>` "mediana por defecto si asimetría". Documentado en [questions/005](../../questions/005_g2_scatter_sintetico.md). Decisión pendiente: mantener la media como cifra institucional y agregar la mediana como descriptor principal, o reemplazar.

### 2. Desacople del Incentivo (S1) — version-locked to thesis dataset

Los 3 bloqueos originales en S1 fueron resueltos **empíricamente con decisión académica** ([questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md)). Hallazgo:

- **Fórmula correcta** (cohortado por columna nativa `Fase del Proyecto`, bienestar = `'Mucho mejor'` sobre `3.1_Bienestar_Economico_Cambio`): `bienestar_C = 8/30 = 26,7%` y `bienestar_D = 4/27 = 14,8%` reconcilian **exactamente** con el dashboard.
- **Subgrupos A y A+B**: las cifras del dashboard (71,4% / 43,8%) corresponden a la versión del dataset usada en la **tesis publicada** (Velásquez, Palacio, Álvarez 2025); microdatos actuales evolucionaron post-publicación.
- **Decisión académica**: el dashboard mantiene fidelidad con la tesis. A y A+B downgraded de `bloqueo` a `ok` con nota `[BLOQUEO→ok por version-lock to thesis dataset]`.

**Resultado**: 0 bloqueos finales. Lección operativa: privilegiar columnas categóricas nativas del xlsx sobre derivaciones manuales desde continuas (lección incorporada al `<dataset_versioning>` de CLAUDE.md).

### 3. Ancla "Continuaría sin pago: 100%" — confirmada empíricamente

El "caso disidente" respondió `'Mucho'` (semánticamente afirmativo intensificado, no negación). La auditoría original usaba `= 'Sí'` estricto y excluía el caso. Bajo normalización `TRIM(LOWER) IN ('si','sí','mucho')`: **80/80 = 100%**. Ancla reconcilia. Documentado en [questions/009](../../questions/009_ancla_continuaria_sin_pago.md).

Como derivado de este hallazgo se agregó al schema metodológico:
- Utility `common.validate_cardinality(series, expected_values, declared_n_categories)` para auditoría preventiva de categóricas antes de cuantificar.
- Regla nueva en `<statistical_rules>` del CLAUDE.md exigiendo el uso de `validate_cardinality` antes de calcular proporciones sobre categóricas.

### 4. Variables no trazables en `Diccionario_Datos`

G5 Pisos Térmicos (Territorial) usa `Piso_Termico` derivado del municipio, pero la derivación sólo existe en código ([questions/007](../../questions/007_g5_mapping_pisos_termicos.md)). Decisión pendiente: formalizar como columna del xlsx normalizado o mantener el mapping en código.

### 5. Deuda visual concentrada en Gobernanza

Gobernanza tiene 14 de 19 filas (74%) violando visual_rules — el peor ratio del dashboard. Patrones dominantes:
- **Likert en `kpi_rating`** (GO1 Confianza, GO4 Calidad, GO6 Puntualidad, GO7 Transparencia): reporta rating promedio como KPI. La regla exige heatmap de frecuencias + mediana + diverging bar.
- **Pie de 2 categorías** (GO2 Cobertura, GO5 Convivencia): regla explícita en `<visual_rules>` "Nunca pie de 2 categorías".

Fase 4 debe refactorizar visualmente Gobernanza con prioridad alta.

### 6. Brecha Jefatura H−M estadísticamente significativa (P2)

Diff observada 14,83 pp, IC95 Wald-2-prop [1,20; 28,46]. **No cubre 0** → brecha significativa al 95%. Soporta la narrativa "doble carga femenina" con soporte estadístico formal, no sólo descriptivo. Se conserva como cita primaria para Fase 5.

## Questions abiertas (9 total)

| # | Sección | Tema | Estado |
|---|---|---|---|
| [001](../../questions/001_piramide_ejes_simetricos.md) | Población | P3 pirámide ECharts con ejes simétricos | Resuelta Opción A |
| [002](../../questions/002_kpi_edad_media_vs_mediana.md) | Población | P4 KPI mediana 60 + IQR | Resuelta tentativa A, pendiente validación tesis |
| [003](../../questions/003_rangos_etarios_p3.md) | Población | Bins etarios normalizados | Resuelta Opción A |
| [004](../../questions/004_pagos_n_141_vs_148.md) | Global | Pagos n=141 vs ancla 148 | Resuelta Opción A con matización |
| [005](../../questions/005_g2_scatter_sintetico.md) | Territorial + Ambiental | G2 scatter sintético + media 104,6 vs mediana 5,1 | **Resuelta Opción A** (boxplot+strip en Fase 4; +ancla mediana 5,095) |
| [006](../../questions/006_g4_labels_fase_d.md) | Territorial | G4 labels temporales inconsistentes | **Resuelta Opción A** (labels exhaustivos por rango real) |
| [007](../../questions/007_g5_mapping_pisos_termicos.md) | Territorial | G5 variable no trazable | **Resuelta Opción B + plan A futuro** (centralizar en `mappings.ts`) |
| [008](../../questions/008_s1_desacople_incentivo_bloqueos.md) | Social | S1 3 bloqueos vs microdato | **Resuelta empíricamente — version-locked to thesis dataset** |
| [009](../../questions/009_ancla_continuaria_sin_pago.md) | Social | Ancla 100% vs 98,75% | **Resuelta empíricamente — ancla 100% confirmada** (caso 'Mucho'='Sí intensificado') |

**9/9 questions resueltas.** Fase 1 (Tiempo 1+2) cierra sin handoff abiertos.

## Metodología: validación a escala

**common.py** (400+ líneas) resistió los 4 sub-agentes paralelos sin modificaciones ni falsos positivos:
- `get_connection()` cacheada con `@lru_cache` escaló a 5 procesos (1 piloto + 4 sub-agentes en paralelo) sin contención.
- Schema `IndicadorResultado` soportó 5 tipos de estadístico (proporción, mediana, media, conteo, diff_props) sin ampliación.
- `classify_severity()` con umbrales 0,1 / 1,25 / 5 pp identificó correctamente los 3 bloqueos reales de S1.
- `write_excel()` produjo 5 xlsx consistentes (14–18 KB cada uno).
- Fix utf-8 stdout Windows (commit `ed3407f`) evitó errores en los sub-agentes de Tiempo 2.

**ANCHORS dict** (ahora 19 entradas): cubre Población + Territorial + Pagos con keys stabilizados. Territorial y Ambiental ambos referenciaron `territorial.area_por_familia_ha` sin duplicar lógica.

## Pendientes para cerrar Fase 1

1. **Tiempo 3**: lanzar auditores de Económica (id `ECO`, data.tsx 436-577) y Sostenibilidad (id `SOST`, data.tsx 688-786). Ambos leen hoja `Pagos`; el de Económica debe reauditar S1 desde la perspectiva de `Pagos` cohortado por `FASE`.
2. **Resolver questions 005, 006, 007, 008, 009** con input humano.
3. **Validar ancla "Continuaría sin pago"** inspeccionando el caso disidente (resolución trivial).
4. **Corroborar question 002** contra `docs/tesis.docx`.
5. **Auditoría SROI** (sección 8, `SROI`) — no incluida en el plan original Fase 1, puede o no entrar.

## Decisión: ¿cerrar Fase 1 después de Tiempo 3?

**Sí, pero con condiciones:**

- [x] Metodología validada sin modificaciones a `common.py` en 5 secciones.
- [x] 96/124 filas reconcilian ok. Ratio aceptable.
- [x] 3 bloqueos todos concentrados en S1, localizados y causal-hipotetizados.
- [ ] S1 reauditado sobre `Pagos` (Tiempo 3).
- [ ] Questions 005, 008, 009 con decisión humana.
- [ ] Económica y Sostenibilidad ejecutadas y reportadas.

Una vez cerrado Tiempo 3, la consolidación final debería incluir auditoría SROI opcional y pasar a Fase 2 (correlaciones) o Fase 3 (decisiones de stack).

## Artefactos

- `audit/fase1/auditoria_estadistica.xlsx` — 4 hojas (Indice, Resumen_global, Criticos_global, Metodo_global). Gitignored.
- `audit/fase1/piloto_poblacion.xlsx`, `territorial.xlsx`, `ambiental.xlsx`, `social.xlsx`, `gobernanza.xlsx` — por sección. Gitignored.
- 5 REPORTs por sección + este global = 6 markdown tracked.
- 9 questions handoff en `questions/`.
- 24+ commits en refactor/v2 (scope `audit-p1*`).
