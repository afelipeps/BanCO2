# Backlog Fase 4 — Refactor visual

**Origen:** decisiones diferidas de Fase 1 Tiempo 1+2+3 (auditoría estadística). · **Fecha:** 2026-04-28.

Estos issues NO se ejecutan en Fase 1 (cierre técnico). Se aplican durante Fase 4 (rediseño visual + sistema visual Masbosques).

---

## D1 — ECO E1 Tenencia Proyecto: pie → barra Wilson

**Origen:** auditoría Económica Tiempo 3, decisión D1 (validada 2026-04-28).
**Indicador:** E1 (data.tsx 442-454).
**Cambio:**
- De: `chart_pie` con 60% No Tiene / 40% Sí Tiene.
- A: `proporcion_wilson_bar` (binaria de 2 categorías) con IC Wilson 95% sobre n=80, n explícito en eje.
**Justificación:** `<visual_rules>` "Nunca pie de 2 categorías".

---

## D2 — ECO E4 Brecha Ingresos Género: bar vertical → boxplot lado a lado

**Origen:** auditoría Económica Tiempo 3, decisión D2.
**Indicador:** E4 (data.tsx 488-499).
**Cambio:**
- De: `chart_bar_vertical` con H $850.000 / M $100.000 (medianas como columnas).
- A: 2 boxplots lado a lado (H/M) + scatter con jitter de datos crudos (n=24: 18 H + 6 M). n=24 explícito en eje. Outlier $23.990.000 (ID_Encuesta=40, M, PECUARIO) **visible y etiquetado**, NO oculto.
**Justificación:** `<visual_rules>` "Continua asimétrica: boxplot + histograma. Nunca media en KPI card." y "Brecha género: boxplots lado a lado con strip plot de datos crudos".
**Migración:** ECharts (recharts no soporta boxplot bien).

---

## D3 — SOST ST1 Índice de Orgullo: cifras + viz

**Origen:** auditoría Sostenibilidad Tiempo 3, decisión D3.
**Indicador:** ST1 (data.tsx 706-719).
**Cambios:**
1. Cifras: dashboard 98%/2% → real 97,5%/2,5% (78/80 vs 2/80 bajo normalización 'Mucho'+'ningu0.').
2. Viz: `chart_pie` 2 categorías → `proporcion_wilson_bar` IC95 Wilson [91,4%, 99,3%].
3. Reagrupar formalmente en 2 categorías documentadas (Orgulloso vs Indiferente).
**Justificación:** `<visual_rules>` "Nunca pie de 2 categorías" + ajuste cosmético rounding.

---

## D4 — SOST ST6 Confianza vs Puntualidad: agregar Spearman

**Origen:** auditoría Sostenibilidad Tiempo 3, decisión D4.
**Indicador:** ST6 (data.tsx 766-783).
**Cambio:** agregar Spearman ρ=0,5617 (p<1e-7) como **estadístico primario**; mantener Pearson r=0,54 como secundario. Mantener regresión OLS (intercepto 3,46, pendiente 0,33, R²=0,29).
**Justificación:** `<statistical_rules>` "Correlaciones con Likert: Spearman. Reportar ρ y p-value."
**Adicional:** considerar reemplazar 6 puntos representativos por scatter completo con jitter (5×5 grid) para fidelidad visual con n=79.

---

## D5 — SOST ST5 Motivación Principal: explicitar denominador

**Origen:** auditoría Sostenibilidad Tiempo 3, decisión D5.
**Indicador:** ST5 (data.tsx 751-764).
**Cambio:**
- Mostrar denominador **n=77** explícitamente (excluye 3 NaN de `6.1_Lo_Mas_Valioso_Programa`).
- Reportar tasa missing **3,75%** (3/80) explícitamente.
- NO imputar a n=80 (la hoja `Motivación` ofrece coding alternativo n=80 que el dashboard NO usa por decisión metodológica del equipo tesis).
**Justificación:** `<statistical_rules>` "Reportar n efectivo de cada subgrupo. Missings: reportar tasa, nunca imputar silenciosamente."

---

## H1-VIZ — Mejora ambiental: 5 charts → 1 índice agregado

**Origen:** finding H1 ([audit/fase1/_findings/h1_bias_intra_respondiente_2_2.md](../audit/fase1/_findings/h1_bias_intra_respondiente_2_2.md)).
**Indicadores afectados:** los 5 charts independientes en sección Ambiental que reportan `2.2_Mejoro_*_SiNo` (densidad arbórea, fauna, cantidad agua, calidad agua, aire puro).
**Hallazgo:** los 5 ejes presentan correlación φ=1,000 perfecta inter-respondiente. Mismos 2 encuestados respondieron 'No' en los 5; 78 'Sí' en los 5. Cero respuestas mixtas. Es **una dimensión replicada 5 veces**.
**Cambio:** reemplazar los 5 charts por **un solo chart Wilson IC95** con:
- Título: "Mejora ambiental percibida (índice agregado)"
- Subtítulo: "78/80 = 97,5%, IC95 [91,4%, 99,3%]"
- Footer académico: "Los 5 ejes evaluados muestran correlación perfecta inter-respondiente (φ=1,00, n=80). Se reportan agregados como índice unidimensional. Lectura por eje individual no es interpretable."
**Justificación:** la lectura por eje individual induce la falsa apariencia de validación cruzada cuando es una sola dimensión. Posibles causas: acquiescence bias / pregunta administrada en batería con halo / constructo unidimensional real (no distinguibles con datos disponibles).
**Acción narrativa:** reescribir copy de la sección Ambiental para reflejar índice unidimensional, no 5 evidencias convergentes.

---

## D6-VIZ — ECO E3 Erosión Incentivo: actualizar cifras a AVG(134 FC)

**Origen:** decisión D6 aplicada al script de auditoría 2026-04-28 ([audit/fase1/economica_REPORT.md](../audit/fase1/economica_REPORT.md) sección "D6 swap").
**Indicador:** E3 (data.tsx 469-485).
**Cambio:**
- 2022: incentivo 246.522 → 241.154 (AVG sobre 134 FC, no 141 totales). Diff -5.369 COP.
- 2023: incentivo 261.659 → 256.093. Diff -5.566 COP.
- Recalcular `deficit` y `cobertura` con nuevos incentivos. Cobertura 2022 cambia de 24,7% → ~24,1%. Cobertura 2023 cambia de 22,6% → ~22,1%.
**Justificación:** la narrativa "Eficiencia Subsidiada" se refiere a familias campesinas; los 7 socios Institución/Otro NO son la población del PSA. Adendum 3 verificación: |diff| relativo 2,18% (2022) y 2,13% (2023), ambos bajo umbral 5%. Swap aprobado por Andrés.
**Nota:** el script `economica_audit.py` ya aplica el swap y reporta los nuevos valores en `economica.xlsx`/`_REPORT.md`. Solo falta sincronizar data.tsx.

---

## N1 — SROI SR2 Estado/Deforestación: corregir AT 63% → 65%

**Origen:** auditoría SROI Fase D ([audit/fase1/sroi_REPORT.md](../audit/fase1/sroi_REPORT.md) sección N1).
**Indicador:** SR2 fila Estado/Sociedad (data.tsx 848-858).
**Cambio:** alinear etiqueta con tesis Apéndice 1 Tabla 3: `attribution: '65% (Otros actores contribuyen)'` + agregar campo `deadweight: '10%'` para reflejar metodología SROI estándar (Social Value International).
**Cálculo NV reconcilia ya** (1.111.500.000): no afecta total. Es ajuste de **etiquetado**.

---

## N2 — SROI SR2 Mujeres Cuidadoras: capturar Drop-off Rate

**Origen:** auditoría SROI Fase D, sección N2.
**Indicador:** SR2 fila Mujeres Cuidadoras (data.tsx 859-868).
**Cambio:** agregar campo `decrecimiento: '5% (adaptación 2 años)'`. La tesis aplica DR=5% que actualmente está implícito en el NV (8.587.800 × 0,80 × 0,95 = 6.526.728) pero no es visible al lector.
**Cálculo NV reconcilia ya**: ajuste de **transparencia metodológica**.

---

## N3 — SROI SR2 Familias Emprendedoras: corregir etiqueta DW vs DESP

**Origen:** auditoría SROI Fase D, sección N3.
**Indicador:** SR2 fila Familias Emprendedoras (data.tsx 869-879).
**Cambio crítico:** swap de etiqueta. Actualmente data.tsx publica `displacement: '20% (Peso muerto)'` pero "Peso muerto" en SROI **es Deadweight (DW)**, no Displacement (DESP). Tesis declara correctamente DW=20%, DESP=0%.
- A: `deadweight: '20% (Peso muerto - parte del negocio existiría sin BancO2)'` + `displacement: '0%'`.
**Cálculo NV reconcilia ya** (88.358.400): es ajuste de **terminología SROI estándar**.

---

## Prioridades sugeridas Fase 4

1. **Alta** (afectan trazabilidad metodológica): D6, N1, N2, N3.
2. **Media** (mejoran lectura estadística): D3, D4, D5, H1-VIZ.
3. **Baja** (cumplimiento de visual_rules): D1, D2.

Total: **10 ítems**. Estimación gruesa: 2-3 días de trabajo distribuidos durante Fase 4.

---

## Verificación

Tras aplicar los cambios visuales:
1. Re-correr auditoría Fase 1 (`audit/fase1/scripts/*_audit.py` + `consolidate.py`) — los conteos NO deberían cambiar (el audit valida cifras, no viz).
2. Validar que `data.tsx` shape `{ value, n, source, transformation, timeWindow, missingRate? }` (`<code_rules>`) está respetado.
3. Visual QA en `npm run dev` con `localhost` preview pane.
4. Type-check: `npx tsc --noEmit` debe pasar (los nuevos campos `deadweight`, `decrecimiento` requieren extender el tipo SR2 — actualmente es `any` flexible).
