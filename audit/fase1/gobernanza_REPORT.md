# Fase 1 — Auditoría sección Gobernanza

**Estado:** ejecutado, pendiente de validación humana · **Rama:** `refactor/v2` · **Sección:** Gobernanza (id `GOB`, 8 indicadores GO1–GO8, data.tsx líneas 578-687) · **Fecha run:** 2026-04-18

## Resumen ejecutivo

Los 8 indicadores de Gobernanza reconcilian en lo aritmético: 19 filas Resumen con 0 bloqueos. **2 handoffs** (GO4 Calidad Visita y GO7 Transparencia) son discrepancias de KPI rating con el microdato. Lo más importante: **6 de 8 indicadores violan `<visual_rules>`** (14 filas Críticos) — predominio de `kpi_rating` en Likert y `chart_pie` de 2 categorías. Gobernanza es la sección con mayor densidad de deuda visual del dashboard. Ninguna ancla numérica de Gobernanza está declarada en `<anchors>`, lo que hizo que la reconciliación ancla sea trivial (nada que comparar) pero también significa que los hallazgos son exclusivamente código-vs-microdato.

## Hallazgos por indicador

### GO1 — Índice de Confianza · `kpi_rating` — **viz viola rules**

- 1 ok + 1 nota.
- Likert 1-5 reportado como rating promedio en KPI. `<visual_rules>` exige heatmap de frecuencias + mediana + diverging bar para Likert; rating promedio es **media de Likert**, metodológicamente cuestionable (aunque ampliamente usado).
- Recomendación Fase 4: mantener el rating en KPI pero agregar mediana como cifra primaria o heatmap complementario.

### GO2 — Cobertura Técnica · `chart_pie` — **viz viola rules**

- 2 ok.
- Pie de 2 categorías viola regla; fix es barra con Wilson CI.

### GO3 — Frecuencia de Visitas · `chart_bar_vertical`

- 3 ok. Reconcilia perfectamente. Viz aceptable (frecuencia categorizada).

### GO4 — Calidad Visita · `kpi_rating` — **viz viola rules + handoff**

- 1 handoff. Rating publicado no reconcilia con la media/mediana del microdato dentro de tolerancia.
- Además viola visual_rules (Likert en KPI rating).
- Handoff se debe tanto a viz como a discrepancia numérica. Candidato a question específica en Fase 2 si la discrepancia no se explica por missings.

### GO5 — Convivencia Vecinal · `chart_pie` — **viz viola rules**

- 6 ok. 6 filas en Resumen probablemente por subgrupos (varios Likert + agregados).
- Pie viola regla; fix a diverging bar en Fase 4.

### GO6 — Puntualidad Pagos · `kpi_rating` — **viz viola rules**

- 1 ok + 1 nota.
- Likert en KPI — misma discusión que GO1.

### GO7 — Transparencia · `kpi_rating` — **viz viola rules + handoff**

- 1 handoff. Análogo a GO4.

### GO8 — Participación · `chart_bar_vertical`

- 2 ok. Viz aceptable.

## Reconciliación contra anclas

Gobernanza no tiene anclas numéricas declaradas en `<anchors>` del `CLAUDE.md`. Reconciliación contra anclas: **N/A**.

Si la sección se valida cross-section con anclas de otras secciones (p.ej. "87,5% jefes de hogar" podría cruzar con participación comunitaria), queda para Fase 2. No disparó handoff automático.

## Questions abiertas

Ninguna abierta por este auditor. Los 2 handoffs (GO4, GO7) son menores y documentados en este reporte; su resolución se empuja a Fase 3/4 sin dedicated question.

**Nota**: si al revisar manualmente el REPORT Andrés considera que GO4 o GO7 merecen question dedicada, el próximo NNN libre es 010.

## Decisiones metodológicas aplicadas

- **19 filas de Resumen sobre 8 indicadores**.
- **Wilson CI** para todas las proporciones binomiales (GO2, GO3, GO5, GO8).
- **Likert 1-5 en GO1, GO4, GO6, GO7**: distribución de frecuencias + mediana + IQR. Rating promedio reportado como secundario con nota metodológica.
- **No se computó Spearman** entre GO1 (Confianza) y GO4 (Calidad Visita) — sería natural para Fase 2 de correlaciones.
- **`viz_viola_rules=True`** en 6 de 8 indicadores. Gobernanza es la sección con peor adherencia a visual_rules del dashboard.

## Severidades (output `summarize_severities`)

```
GO1: {'ok': 1, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
GO2: {'ok': 2, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
GO3: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
GO4: {'ok': 0, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
GO5: {'ok': 6, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
GO6: {'ok': 1, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
GO7: {'ok': 0, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
GO8: {'ok': 2, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
```

Total: 15 ok / 2 nota / 2 handoff / 0 bloqueo.

Viz viola rules: 14 filas sobre 19 (74%). 6 de 8 indicadores.

## Recomendación

**Piloto de sección OK** con alta deuda visual. La metodología del piloto Población escaló sin cambios. Los hallazgos son principalmente de `<visual_rules>` (Likert en KPI rating, pies binarios) que Fase 4 debe atender migrando a heatmaps y barras con Wilson CI. Ninguna ancla numérica afectada; pasa al siguiente escalón sin bloqueos.
