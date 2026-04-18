# Fase 1 — Reporte global consolidado (Tiempo 1 + Tiempo 2)

**Estado:** 5 secciones cerradas (Población piloto + Territorial + Ambiental + Social + Gobernanza), 2 pendientes (Económica + Sostenibilidad, Tiempo 3). · **Rama:** `refactor/v2` · **Fecha:** 2026-04-18

## Resumen ejecutivo

La auditoría Fase 1 cubrió 35 indicadores a lo largo de 5 secciones (124 filas Resumen en total). **96 filas reconcilian ok** (77,4%), **10 en nota**, **15 en handoff**, **3 en bloqueo**. Las 3 filas bloqueadas son todas de S1 "Desacople del Incentivo" (sección Social), indicador con discrepancias 8-22 pp vs microdatos — bloqueante para cierre Fase 1, investigación abierta en [questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md). **49 filas violan `<visual_rules>`** (40%) — pies de 2 categorías, medias en KPI sobre continuas asimétricas, Likert en rating numérico. 9 questions handoff abiertas (001-009). La metodología del piloto Población (DuckDB + scipy + `common.py` + schema `IndicadorResultado`) escaló sin cambios a las 4 secciones siguientes; no se requirió modificar `common.py`.

## Índice global

| Sección | Indicadores | Filas Resumen | Críticos | ok | nota | handoff | bloqueo | viola_viz_rules |
|---|---|---|---|---|---|---|---|---|
| Población (piloto) | 5 | 23 | 19 | 22 | 0 | 1 | 0 | 19 |
| Territorial | 6 | 22 | 8 | 16 | 3 | 3 | 0 | 7 |
| Ambiental | 6 | 31 | 4 | 24 | 3 | 4 | 0 | 2 |
| Social | 10 | 29 | 14 | 19 | 2 | 5 | **3** | 7 |
| Gobernanza | 8 | 19 | 14 | 15 | 2 | 2 | 0 | 14 |
| **Total Fase 1 (sin Pagos)** | **35** | **124** | **59** | **96** | **10** | **15** | **3** | **49** |
| Económica (pendiente Tiempo 3) | — | — | — | — | — | — | — | — |
| Sostenibilidad (pendiente Tiempo 3) | — | — | — | — | — | — | — | — |

Ratio de reconciliación ok: 77,4% (96/124).
Ratio de viz_viola_rules: 40% (49/124).

## Hallazgos cross-sección

### 1. Media 104,6 ha/familia vs mediana 5,1 ha — hallazgo transversal (Territorial + Ambiental)

Ambas secciones auditan la misma ancla `territorial.area_por_familia_ha = 104,6`:

- **Media muestral**: 104,60 ha (reconcilia exactamente con el ancla).
- **Mediana**: **5,095 ha/familia**, IQR [2,36; 11,63].
- Un outlier único de **6.379 ha** distorsiona la media. Sin él, la media baja a ~8,08 ha.

El ancla está numéricamente correcta pero es **engañosa como descriptor central** — viola el principio `<statistical_rules>` "mediana por defecto si asimetría". Documentado en [questions/005](../../questions/005_g2_scatter_sintetico.md). Decisión pendiente: mantener la media como cifra institucional y agregar la mediana como descriptor principal, o reemplazar.

### 2. Desacople del Incentivo (S1) — 3 bloqueos concentrados

El único bloqueo de toda Fase 1 está en un solo indicador. Las discrepancias (8-22 pp) son demasiado grandes para explicar como rounding o filtro; señalan que **el indicador probablemente se calcula sobre hoja `Pagos` cohortado por `FASE`**, no sobre `Datos_Normalizados`. El auditor de Económica en Tiempo 3 deberá reauditar. Documentado en [questions/008](../../questions/008_s1_desacople_incentivo_bloqueos.md).

### 3. Ancla "Continuaría sin pago: 100%" vs real 98,75%

1 caso de 80 respondió distinto — diff exacto 1,25 pp (umbral nota→handoff). El ancla puede ser: (a) defectuosa y hay que corregir a 98,75% (79/80); (b) correcta con un caso missing imputado como "No"; (c) narrativa redondeada. Trivial de resolver si se inspecciona el caso. Documentado en [questions/009](../../questions/009_ancla_continuaria_sin_pago.md).

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
| [005](../../questions/005_g2_scatter_sintetico.md) | Territorial + Ambiental | G2 scatter sintético + media 104,6 vs mediana 5,1 | Abierta |
| [006](../../questions/006_g4_labels_fase_d.md) | Territorial | G4 labels temporales inconsistentes | Abierta |
| [007](../../questions/007_g5_mapping_pisos_termicos.md) | Territorial | G5 variable no trazable | Abierta |
| [008](../../questions/008_s1_desacople_incentivo_bloqueos.md) | Social | S1 3 bloqueos vs microdato | Abierta (bloqueante) |
| [009](../../questions/009_ancla_continuaria_sin_pago.md) | Social | Ancla 100% vs 98,75% | Abierta |

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
