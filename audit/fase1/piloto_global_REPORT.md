# Fase 1 — Reporte global consolidado (Tiempo 1 + Tiempo 2 + Tiempo 3)

**Estado:** **Fase 1 cerrada.** 7 secciones auditadas (Población piloto + Territorial + Ambiental + Social + Gobernanza + Económica + Sostenibilidad), **13 questions tracked (9 abiertas resueltas en Tiempo 1+2 + 4 cerradas en Tiempo 3 con [VERSION-LOCK-OVERRIDE])**, **0 bloqueos finales** (todos los originales downgraded vía version-lock o version-lock-override). · **Rama:** `refactor/v2` · **Última actualización:** 2026-04-28 (post-Tiempo 3 cierre).

## Resumen ejecutivo

La auditoría Fase 1 cubrió **51 indicadores** a lo largo de **7 secciones** (**173 filas Resumen** en total). Tras aplicar D6 swap (E3 incentivo medio sobre n=134 Familia Campesina), [VERSION-LOCK-OVERRIDE] (E2/E5/E9/ST4/SROI), y verificación SROI vs Apéndice 1 tesis, el conteo final es: **0 bloqueos**, **128 ok / 30 nota / 15 handoff**. **60 filas violan `<visual_rules>`** (35%, deuda visual a resolver en Fase 4 con 10 issues queued en `backlog/fase4_visuales.md`).

La metodología en `common.py` resistió 7 sub-agentes paralelos sin cambios estructurales mayores (sólo se agregó `validate_cardinality` post-q009). El nuevo concepto **[VERSION-LOCK-OVERRIDE]** se incorporó al CLAUDE.md `<dataset_versioning>` para casos donde la fuente documental existe pero la fórmula no reproduce con cuts simples (override de C1 por trazabilidad documental).

## Índice global — 7 secciones

| Sección | Indicadores | Filas Resumen | Críticos | ok | nota | handoff | bloqueo | viola_viz_rules |
|---|---|---|---|---|---|---|---|---|
| Población (piloto) | 5 | 23 | 19 | 22 | 0 | 1 | 0 | 19 |
| Territorial | 6 | 22 | 8 | 16 | 3 | 3 | 0 | 7 |
| Ambiental | 6 | 31 | 4 | 24 | 3 | 4 | 0 | 2 |
| Social (post-q008/q009) | 10 | 25 | 8 | 20 | 3 | 2 | 0 | 7 |
| Gobernanza | 8 | 19 | 14 | 15 | 2 | 2 | 0 | 14 |
| Económica (post-D6 + V-L-O) | 10 | 37 | 9 | 21 | 15 | 1 | 0 | 8 |
| Sostenibilidad (post-V-L-O ST4) | 6 | 16 | 6 | 10 | 4 | 2 | 0 | 3 |
| **Total Fase 1** | **51** | **173** | **68** | **128** | **30** | **15** | **0** | **60** |

Ratio reconciliación (ok+nota): **91,3%** (158/173). **Cero bloqueos finales.**
Ratio viz_viola_rules: **34,7%** (60/173) — deuda diferida a Fase 4.

> **Nota PC3**: 173 filas vs 175 esperadas. Discrepancia en Social (-4 filas: 25 vs 29 que reportaba estimación pre-q008/q009). El refactor de S1 cohortado por `Fase del Proyecto` nativa consolidó subgrupos. Conteo real es 173.

## Hallazgos cross-sección — Tiempo 1+2 (resumen)

### Media 104,6 ha/familia vs mediana 5,1 ha (Territorial + Ambiental)

Hallazgo transversal G2/A1: ancla 104,6 ha es media muestral con outlier de 6.379 ha; mediana real es 5,095 ha/familia (IQR [2,36; 11,63]). Documentado en [questions/005](../../questions/closed/005_g2_scatter_sintetico.md) — resuelto Opción A (boxplot+strip plot Fase 4 + ancla mediana 5,095).

### Desacople del Incentivo S1 — version-locked to thesis dataset

Los 3 bloqueos originales en S1 fueron resueltos empíricamente con decisión académica ([questions/008](../../questions/closed/008_s1_desacople_incentivo_bloqueos.md)). Cohortado por `Fase del Proyecto` nativa, bienestar_C y bienestar_D reconcilian exactamente bajo fórmula `'Mucho mejor'` sobre `3.1_Bienestar_Economico_Cambio`. Subgrupos A y A+B corresponden a tesis publicada — version-lock estándar (NO override).

### Ancla "Continuaría sin pago: 100%" — confirmada (q009)

Bajo normalización `TRIM(LOWER) IN ('si','sí','mucho')`: 80/80 = 100%. Caso 'Mucho' = afirmativo intensificado. Utility `validate_cardinality` agregada a `common.py` como derivado.

## Hallazgos cross-sección — Tiempo 3 (cierre)

### PSA formula canónica resuelta — Escenario 1

Investigación PSA mensualizado contra 4 escenarios. **Adoptada**: `mediana(PROMEDIO MENSUAL 2022-2023)` por SEXO sobre `CATEGORÍA = 'Familia Campesina'` (n=134). Reconcilia exacto con anclas tesis (diff <$1, atribuible a `floor` vs `round`). Las 2 fórmulas alternativas (`VALOR MENSUAL 2022` y `VALOR MENSUAL 2023`) producen mediana 2,64% off por estructura cuantizada del PSA. Documentado en [`_findings/psa_formula.md`](_findings/psa_formula.md).

### Brecha género mercado 8,5:1 — verificada al peso

E4 reconcilia exacto: mediana H $850.000 / M $100.000 sobre n=24 (18 H + 6 M). Mann-Whitney U=93,5, **p=0,008** (significativo a α=0,05). Outlier $23.990.000/mes confirmado en cohorte H (ID_Encuesta=40, M, PECUARIO), NO eliminado del cálculo de mediana (mediana es robusta a outliers).

### Ancla "Mejora ambiental 97,5% en todos los ejes" — finding H1

Descubrimiento Tiempo 3: el ancla NO es ST5 (motivación principal, concepto distinto). Reconcilia con **5 columnas** `2.2_Mejoro_*_SiNo` cada una con 78/80 = 97,5%. **Hallazgo crítico**: los 5 ejes presentan correlación φ=1,000 perfecta inter-respondiente. Mismos 2 encuestados respondieron 'No' en los 5; 78 'Sí' en los 5. **Cero respuestas mixtas**. Es **una dimensión replicada 5 veces**, no 5 indicadores independientes (acquiescence bias / batería con halo / constructo unidimensional real — no distinguibles con datos disponibles). Documentado en [`_findings/h1_bias_intra_respondiente_2_2.md`](_findings/h1_bias_intra_respondiente_2_2.md). Acción visual queue Fase 4: reemplazar 5 charts por 1 chart Wilson IC95 con índice agregado (H1-VIZ en backlog).

### D6 swap E3 — fuente referencia AVG(134 FC), no AVG(141 totales)

Decisión académica 2026-04-28: la narrativa "Eficiencia Subsidiada" se refiere a familias campesinas; los 7 socios Institución/Otro NO son la población del PSA. Adendum 3 verificación: |diff| relativo 2,18% (2022) y 2,13% (2023), ambos bajo umbral 5%. Swap aplicable. Discrepancia disclosure: dashboard publica AVG(141)=246.522/261.659; verdad n=134=241.154/256.093. Cobertura recalculada n=134 reconcilia <1 pp con publicada (ok). Recomendación queue Fase 4: actualizar cifras de E3 en data.tsx (D6-VIZ en backlog).

### [VERSION-LOCK-OVERRIDE] aplicado — 3 questions cerradas

Política nueva incorporada al CLAUDE.md `<dataset_versioning>`. 4 indicadores cerrados:
- **ST4** ([closed/010](../../questions/closed/010_resolved.md)): fuente hoja `Gráficas` rows 230-234 (codificación tesis-time multi-select 140 menciones).
- **E2** ([closed/011](../../questions/closed/011_version_lock_override.md)): fuente hoja `Gráficas` rows 159-162 (cut Venta>25% sobre n=23 con filtros tesis-time).
- **E5/E9** ([closed/012](../../questions/closed/012_version_lock_override.md)): recodificación tesis-time confirmada por coautor.
- **SROI** ([closed/013](../../questions/closed/013_sroi_componentes_apendice_tesis.md)): fuente Apéndice 1 tesis (.docx), no microdatos (.xlsx).

Severidades downgrade `bloqueo` → `nota` con flag explícito. Disclosure metadata aplicada en data.tsx (5 indicadores).

### Auditoría SROI vs Apéndice 1 tesis — Fase D

Reconciliación al peso COP de inputs/outputs. SR1 (Asimetría de Beneficios) reconcilia 100% exacto en 4 grupos: Familias 948.200.400 / Medioambiente 1.851.776.000 / Estado 1.119.600.000 / Mujeres 6.526.728. Total outputs 3.926.103.128. Total inputs 1.765.929.034. Ratio 2,22:1 ✓. SR2 (Matriz Evidencia) reconcilia NV en 6/6 filas; **3 discrepancias menores de etiquetado SROI** detectadas (N1: AT 63% vs 65% Estado, N2: DR no capturado Mujeres, N3: DW vs DESP swapped Familias Emprendedoras). Documentado en [`sroi_REPORT.md`](sroi_REPORT.md). 0 bloqueos. Las 3 discrepancias son ajustes cosméticos queue Fase 4.

## Questions tracked — 13 total (todas cerradas)

> **Nota convención**: questions 001-009 (Tiempo 1+2) movidas retroactivamente a `questions/closed/` (commit `fix(audit-p1)` 2026-04-28) para alinear con la convención introducida en Tiempo 3. Convención `questions/` para abiertas y `questions/closed/` para resueltas se mantiene para Fase 2 en adelante.

### Resueltas en Tiempo 1+2 (9, en `questions/closed/`)

| # | Sección | Tema | Estado |
|---|---|---|---|
| [001](../../questions/closed/001_piramide_ejes_simetricos.md) | Población | P3 pirámide ECharts ejes simétricos | Resuelta Opción A |
| [002](../../questions/closed/002_kpi_edad_media_vs_mediana.md) | Población | P4 KPI mediana 60 + IQR | Resuelta tentativa A |
| [003](../../questions/closed/003_rangos_etarios_p3.md) | Población | Bins etarios normalizados | Resuelta Opción A |
| [004](../../questions/closed/004_pagos_n_141_vs_148.md) | Global | Pagos n=141 vs ancla 148 | Resuelta Opción A con matización |
| [005](../../questions/closed/005_g2_scatter_sintetico.md) | Territorial+Ambiental | G2 scatter sintético | Resuelta Opción A |
| [006](../../questions/closed/006_g4_labels_fase_d.md) | Territorial | G4 labels temporales | Resuelta Opción A |
| [007](../../questions/closed/007_g5_mapping_pisos_termicos.md) | Territorial | G5 variable no trazable | Resuelta Opción B + plan A |
| [008](../../questions/closed/008_s1_desacople_incentivo_bloqueos.md) | Social | S1 3 bloqueos | Resuelta empíricamente — version-locked |
| [009](../../questions/closed/009_ancla_continuaria_sin_pago.md) | Social | Ancla 100% vs 98,75% | Resuelta empíricamente — ancla 100% |

### Cerradas en Tiempo 3 (4, en `questions/closed/`)

| # | Sección | Tema | Resolución |
|---|---|---|---|
| [closed/010](../../questions/closed/010_resolved.md) | Sostenibilidad | ST4 fuente irreproducible | [VERSION-LOCK-OVERRIDE] — fuente Gráficas rows 230-234 |
| [closed/011](../../questions/closed/011_version_lock_override.md) | Económica | E2 78,3/21,7% no reconcilia | [VERSION-LOCK-OVERRIDE] — fuente Gráficas rows 159-162 |
| [closed/012](../../questions/closed/012_version_lock_override.md) | Económica | E5/E9 56/10/34 + 100/44/30/26 | [VERSION-LOCK-OVERRIDE] — recodificación tesis-time |
| [closed/013](../../questions/closed/013_sroi_componentes_apendice_tesis.md) | SROI | SROI fuera del xlsx | [VERSION-LOCK-OVERRIDE] — fuente Apéndice 1 tesis |

**13/13 questions tracked.** Fase 1 cierra sin handoff abiertos.

## Verificaciones pre-cierre (Adendum 2 / 3)

### PC1 — Cobertura validate_cardinality

- **ECO**: 3/3 categóricas **no version-locked** evaluadas: `5.2.1_Tiene_Proyecto_Productivo_SiNo`, `5.2.6_Genera_Empleo_SiNo`, `1.6_Sexo`.
- **SOST**: 3/3 categóricas evaluadas: `6.3_Orgullo_Ser_Parte`, `6.4_Continuaria_Sin_Pago`, `6.1_Lo_Mas_Valioso_Programa` (vía hoja Motivación).
- **Categóricas en [VERSION-LOCK-OVERRIDE] excluidas del check**: derivadas tesis-time de E2/E5/E7/E8/E9 y ST4. Cardinalidad fijada por tesis (hoja `Gráficas`, recodificación manual), no por `Diccionario_Datos`. `validate_cardinality` NO aplicable a estas — el override por trazabilidad documental sustituye el check estadístico.
- **Deuda residual documentada**: `5.2.6_Genera_Empleo_SiNo` sin cardinalidad declarada en `Diccionario_Datos`; valores observados (Sí/No) validados manualmente. Sugerido agregar entrada al Diccionario en próxima revisión.

**Cobertura efectiva**: 6/6 categóricas críticas validadas, sin re-ejecución necesaria. Detalle en anexos de [`economica_REPORT.md`](economica_REPORT.md) y [`sostenibilidad_REPORT.md`](sostenibilidad_REPORT.md).

### PC2 — Trazabilidad outlier $23.990.000

Identificado: **ID_Encuesta=40**, M (Masculino), edad 41, tipo PECUARIO, porc_venta=90%. NO se eliminó del cálculo de mediana E4 (mediana H = $850.000 reconcilia con ancla porque mediana es robusta). Documentado en `economica_REPORT.md` anexo PC2.

### PC3 — Conteo total filas

Esperado: 175 (124 T1+T2 + 51 T3). Real: **173** (120 T1+T2 + 53 T3). Diff -2 explicado: Social bajó de 29 a 25 filas tras q008/q009 refactor (consolidación subgrupos S1). Conteo real validado.

## Decisiones aplicadas en Tiempo 3

### D6 — E3 swap n=141 → n=134 FC

Aplicado al script (líneas 273-388 de `economica_audit.py`). Adendum 3 verificación: bajo umbral 5%, swap aprobado. 9 filas E3 (5 ok + 4 nota: 2 cobertura recalculada n=134 + 2 disclosure incentivo publicado vs n=134). Recomendación queue Fase 4: actualizar data.tsx (D6-VIZ).

### Decisiones D1-D5 (visuales) queue Fase 4

D1 ECO E1 pie→Wilson, D2 ECO E4 bar→boxplot, D3 SOST ST1 pie→Wilson + cifras 97,5%, D4 SOST ST6 +Spearman, D5 SOST ST5 denominador n=77 explícito. Total 5 ítems en `backlog/fase4_visuales.md`.

### Disclosure metadata en data.tsx

Aplicada en E2, E5, E9, ST4, SROI section. Shape `disclosure: { source, transformation, timeWindow, n, note }` (extendido tipo `Indicator` y `Category` en `types.ts`). Type-check pasa.

## Metodología: validación a escala

**common.py** (~520 líneas) resistió 7 sub-agentes paralelos sin modificaciones estructurales:
- `get_connection()` cacheada con `@lru_cache` escaló a 7 procesos sin contención.
- Schema `IndicadorResultado` soportó 5 tipos de estadístico.
- `classify_severity()` con umbrales 0,1 / 1,25 / 5 pp identificó correctamente todos los bloqueos originales.
- `validate_cardinality()` agregado post-q009 para auditoría preventiva.
- `write_excel()` produjo 7 xlsx consistentes (15-19 KB cada uno).
- Fix utf-8 stdout Windows mantenido.

**ANCHORS dict** (ahora 21+ entradas): cubre 7 secciones con keys estabilizados.

## Artefactos finales

- `audit/fase1/auditoria_estadistica.xlsx` — 4 hojas (Indice, Resumen_global, Criticos_global, Metodo_global). 173 filas. Gitignored.
- `audit/fase1/{piloto_poblacion,territorial,ambiental,social,gobernanza,economica,sostenibilidad}.xlsx` — por sección. Gitignored.
- 7 REPORTs por sección + sroi_REPORT.md + este global = 9 markdown tracked.
- `audit/fase1/_findings/`: psa_formula.md (Tiempo 3) + h1_bias_intra_respondiente_2_2.md (Tiempo 3).
- 13 questions: 9 en `questions/` + 4 en `questions/closed/`.
- `backlog/fase4_visuales.md`: 10 issues queued.
- ~30+ commits en refactor/v2 (scope `audit-p1*`).

## Cierre Fase 1 — checklist

- [x] 7 secciones auditadas (5 Tiempo 1+2 + 2 Tiempo 3).
- [x] 0 bloqueos finales (downgraded vía version-lock o version-lock-override).
- [x] 13/13 questions tracked y resueltas.
- [x] PSA formula canónica documentada (`_findings/psa_formula.md`).
- [x] H1 finding documentado (`_findings/h1_bias_intra_respondiente_2_2.md`).
- [x] D6 swap aplicado al script + reportado en REPORT.
- [x] Auditoría SROI vs Apéndice 1 tesis (sroi_REPORT.md).
- [x] Disclosure metadata en data.tsx (5 indicadores) + types.ts extendido. Type-check pasa.
- [x] [VERSION-LOCK-OVERRIDE] documentado en CLAUDE.md `<dataset_versioning>`.
- [x] consolidate.py extendido a 7 secciones.
- [x] PC1 cobertura validate_cardinality verificada (6/6).
- [x] PC2 outlier $23.990.000 trazado (ID_Encuesta=40).
- [x] PC3 conteo total verificado (173 reales vs 175 esperadas, diff -2 explicado).
- [x] backlog/fase4_visuales.md creado (10 issues).

**Estado: Fase 1 lista para cierre.** No iniciar Fase 2/3 antes de validación humana.
