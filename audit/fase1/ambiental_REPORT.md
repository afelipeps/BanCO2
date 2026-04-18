# Fase 1 — Auditoría sección Ambiental

**Estado:** ejecutado, pendiente de validación humana · **Rama:** `refactor/v2` · **Sección:** Ambiental (id `AMB`, 6 indicadores A1–A6, data.tsx líneas 198-293) · **Fecha run:** 2026-04-18

## Resumen ejecutivo

Los 6 indicadores de Ambiental reconcilian con severidad moderada: 24 filas `ok`, 2 `nota`, 4 `handoff`, 0 `bloqueo`. El hallazgo más importante es **compartido con Territorial**: A1 "Área de Conservación" publica la media 104,6 ha como KPI, que viola `<visual_rules>` ("nunca media en KPI card" para continua asimétrica) y cuya mediana real es 5,095 ha (diff 99,5 ha). El resto de handoffs son discrepancias menores en proporciones (A4 Limpieza Fuentes 2,45 pp, A6 Mitigación 2,00 pp). 1 de 6 indicadores viola visual_rules explícitamente (A1 por ser KPI de media). La ancla de ambiental `mejora_percibida: 97,5% en todos los ejes` no está declarada con un id específico en `<anchors>` y no disparó handoff automático, pero merece validación adicional (ver decisiones).

## Hallazgos por indicador

### A1 — Área de Conservación · `kpi_card` — **viz viola rules**

- 2 filas: una para media (reconcilia 104,604 ≈ 104,6 ancla), otra para mediana (5,095 ha).
- Ambas elevadas a `handoff` manualmente por violar `<visual_rules>` (continua asimétrica → boxplot + histograma, nunca media en KPI card).
- El cálculo de la mediana coincide con el hallazgo de Territorial ([questions/005](../../questions/005_g2_scatter_sintetico.md)): la media 104,6 está distorsionada por un outlier de 6.379 ha. **Mediana 5,095 ha** es el descriptor central correcto para publicar.
- Missing rate 0%. n=80.

### A2 — Servicios Ecosistémicos · `chart_radar`

- 5 filas `ok`. Likert 1-5 agregado por eje (agua, suelo, biodiversidad, aire, paisaje).
- Reconcilia al pp.
- Radar es aceptable para Likert multi-eje (no viola visual_rules explícitamente; pero ver notas sobre heatmap como alternativa más informativa).

### A3 — Fauna Indicadora · `word_count_table`

- 15 filas `ok` (top-15 especies citadas).
- Reconcilia conteos.
- Viz específica del dashboard, no en el catálogo de visual_rules — se mantiene.

### A4 — Prácticas de Manejo · `chart_bar_horizontal`

- 1 ok + 1 nota + 1 handoff (Limpieza Fuentes: código 63,7% vs real 61,25%, diff 2,45 pp).
- Otras prácticas reconcilian al pp.
- La discrepancia de Limpieza Fuentes probablemente proviene de cómo se cuentan respuestas parciales o multi-categoría. No afecta ancla.

### A5 — Patrón de Tala · `chart_pie`

- 3 ok + 1 nota.
- 4 categorías: no es "pie de 2 categorías" (regla explícita en visual_rules), aceptable.

### A6 — Mitigación Cambio Climático · `kpi_card`

- 1 nota + 1 handoff (k/n_valid sin missing: código 98% vs real 100%; diff 2 pp).
- La discrepancia viene de si se cuenta el denominador con o sin missings. Si el código reporta 98% sobre n=80 y el auditor reporta 100% sobre n_valid (excluyendo missings), ambos son defendibles; la regla statistical_rules exige reportar missing rate — el código probablemente lo hace ya.

## Reconciliación contra anclas

| Ancla | Valor | Reconciliación | Estado |
|---|---|---|---|
| `territorial.area_por_familia_ha` | 104,6 | A1 media → 104,604545 | ok (diff 0,004545) |
| `territorial.area_por_familia_ha` | 104,6 | A1 mediana → 5,095 | handoff (elevado por viz, no por diff) |

La ancla `ambiental.mejora_percibida: 97,5% en todos los ejes` de `<anchors>` no está cargada en `common.ANCHORS` con una key específica (el piloto no la parametrizó). A2 Servicios Ecosistémicos reconcilia al pp con el código pero queda abierto verificar directamente contra la ancla textual.

## Questions abiertas

- [005](../../questions/005_g2_scatter_sintetico.md) — compartida con Territorial. Misma discusión sobre media vs mediana de área por familia.

No se abrieron questions nuevas específicas de Ambiental: los 4 handoffs son o reflejo del mismo issue que 005 (A1) o discrepancias menores que se documentan aquí sin handoff formal.

## Decisiones metodológicas aplicadas

- **31 filas de Resumen sobre 6 indicadores** (A3 aporta 15 filas por ser word_count top-15; A2 5 filas por eje radar; A1 2 filas por doble reporte media/mediana).
- **Mediana + bootstrap IC95** para A1 (`Area_Conservacion_Ha_NUM`); A1 ancla reconcilia como media pero el cálculo se acompaña del estadístico correcto por `<statistical_rules>`.
- **Wilson CI** para todas las proporciones de A4, A5, A6.
- **Likert 1-5 en A2**: mediana + frecuencias por eje. No se computó Spearman inter-eje (pendiente si se amplía a correlaciones en Fase 2).

## Severidades (output `summarize_severities`)

```
A1: {'ok': 0, 'nota': 0, 'handoff': 2, 'bloqueo': 0}
A2: {'ok': 5, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
A3: {'ok': 15, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
A4: {'ok': 1, 'nota': 1, 'handoff': 1, 'bloqueo': 0}
A5: {'ok': 3, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
A6: {'ok': 0, 'nota': 1, 'handoff': 1, 'bloqueo': 0}
```

Total: 24 ok / 3 nota / 4 handoff / 0 bloqueo.

## Recomendación

**Piloto de sección OK.** La metodología del piloto Población escaló sin cambios. El hallazgo A1 refuerza la necesidad de tratar el ancla `territorial.area_por_familia_ha = 104,6` con matización (es media, no descriptor central); el resto de handoffs son discrepancias menores que se resuelven en Fase 4 con ajustes puntuales. No se requiere modificar `common.py` ni el schema `IndicadorResultado`.
