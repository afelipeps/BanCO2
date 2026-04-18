# Piloto Fase 1 — Auditoría estadística sección Población

**Estado:** piloto ejecutado, pendiente de validación humana · **Rama:** `refactor/v2` · **Sección:** Población (5 indicadores P1–P5)

## Resumen ejecutivo

Los 5 indicadores de Población reconcilian dentro de la tolerancia `ok` contra las 7 anclas relevantes del `CLAUDE.md` (|diff| ≤ 0,1 pp o ≤ 0,02 años). Ningún valor del código diverge numéricamente contra los microdatos de `Datos_Normalizados` (n=80). Los hallazgos críticos son **metodológicos y visuales**, no aritméticos: 3 de 5 indicadores violan reglas de `<visual_rules>` (P1 pie de 2 categorías, P3 barra vertical donde la regla exige pirámide simétrica, P4 media en KPI card sobre continua asimétrica). La metodología usada — DuckDB + scipy/statsmodels + schema `IndicadorResultado` long-format — se valida como plantilla y puede escalarse sin cambios a las 6 secciones restantes con sub-agentes paralelos.

## Hallazgos por indicador

### P1 — Composición por Género · `chart_pie`

| Subgrupo | Valor código | Valor real | IC95 Wilson | n | Severidad |
|---|---|---|---|---|---|
| Hombres | 58,80% | 58,75% (47/80) | [47,80; 68,89%] | 80 | ok |
| Mujeres | 41,20% | 41,25% (33/80) | [31,11; 52,20%] | 80 | ok |

Diferencia de 0,05 pp viene de que el código redondea a 1 decimal; las anclas están a 2 decimales. **Viz viola regla**: `<visual_rules>` prohíbe "pie de 2 categorías" — reemplazar por barra con Wilson CI en Fase 3.

### P2 — Jefatura de Hogar por Sexo · `chart_bar_stacked`

| Subgrupo | Valor código | Valor real | IC95 | n efectivo | Severidad |
|---|---|---|---|---|---|
| Mujeres jefas | 78,79% | 78,79% (26/33) | [62,25; 89,32%] Wilson | 33 | ok |
| Hombres jefes | 93,62% | 93,62% (44/47) | [82,58; 97,82%] Wilson | 47 | ok |
| Brecha H − M | 14,83 pp | 14,83 pp | [1,20; 28,46 pp] Wald 2-prop | 80 | ok |

Diferencia de proporciones con IC95 **no cubre 0** → brecha estadísticamente significativa al 95%, lo que soporta la narrativa "doble carga femenina". Viz actual es aceptable; recomendación: anotar diff + IC como subtítulo.

### P3 — Pirámide Poblacional · `chart_bar_vertical`

Marginal por bin (los 5 coinciden al pp con el código):

| Bin código | Valor código | Valor real | n | IC95 Wilson |
|---|---|---|---|---|
| <18-30 | 5,00% | 5,00% (4/80) | 80 | [1,96; 12,15%] |
| 31-45  | 17,50% | 17,50% (14/80) | 80 | [10,72; 27,24%] |
| 46-60  | 28,75% | 28,75% (23/80) | 80 | [20,01; 39,43%] |
| 61-75  | 35,00% | 35,00% (28/80) | 80 | [25,50; 45,88%] |
| >75    | 13,75% | 13,75% (11/80) | 80 | [7,87; 22,93%] |

**Hallazgo `notas_bins`:** los 5 bins del código reproducen exactamente los conteos de la columna derivada `Rango_Edad` del xlsx: `{18-30: 4, 31-45: 14, 46-60: 23, 61-75: 28, >75: 11}`. El label `<18-30` del código es sintácticamente ambiguo pero numéricamente correcto (incluye los 3 casos con edad 15-17 + todos los de 18-30). **Viz viola regla**: `<visual_rules>` exige "pirámide real con eje simétrico por sexo". Cruce por sexo calculado y exportado (10 filas extras en Resumen) listo para la migración a ECharts de Fase 3. Ver [questions/001](../../questions/001_piramide_ejes_simetricos.md) y [questions/003](../../questions/003_rangos_etarios_p3.md).

### P4 — Edad Promedio · `kpi_card`

| Estadístico | Valor código | Valor real | IC95 / dispersión | Severidad |
|---|---|---|---|---|
| Media (publicado) | 57,8 años | 57,8125 años | sd = 15,82 años | ok (diff 0,01 años) |
| Mediana (correcto) | — | **60 años** | IQR [46, 67]; IC95 bootstrap [55, 63] | **handoff** |

Reconciliación aritmética de la media es perfecta (diff 0,0125 años). El handoff elevado manualmente **no es una discrepancia numérica** sino una violación doble de `<visual_rules>`: (1) "nunca media en KPI card"; (2) "continua asimétrica → boxplot + histograma". La mediana 60 años (estadístico correcto por asimetría) es diferente de la media 57,8 y tiene mayor resonancia narrativa ("la mitad tiene 60 años o más"). Afecta la narrativa protegida "Estancamiento Demográfico"; decisión pendiente en [questions/002](../../questions/002_kpi_edad_media_vs_mediana.md).

### P5 — Jefatura del Hogar · `kpi_card`

| Subgrupo | Valor código | Valor real | IC95 Wilson | n | Severidad |
|---|---|---|---|---|---|
| Global | 87,50% | 87,50% (70/80) | [78,47; 93,07%] | 80 | ok |

Viz aceptable (KPI para proporción). Recomendación: añadir IC95 como subtítulo del KPI en Fase 3 para cumplir la expectativa general de reportar incertidumbre.

## Reconciliación contra `<anchors>`

| Ancla CLAUDE.md | Valor | Reconciliación | Estado |
|---|---|---|---|
| `poblacion.genero.hombres_prop` | 0,5875 | P1 Hombres → 0,5875 | ok (diff 0,0000) |
| `poblacion.genero.mujeres_prop` | 0,4125 | P1 Mujeres → 0,4125 | ok (diff 0,0000) |
| `poblacion.jefatura.mujeres_prop` | 0,7879 | P2 Mujeres jefas → 0,7879 | ok (diff 0,0000) |
| `poblacion.jefatura.hombres_prop` | 0,9362 | P2 Hombres jefes → 0,9362 | ok (diff 0,0000) |
| `poblacion.edad.media` | 57,81 | P4 media → 57,8125 | ok (diff 0,0025) |
| `poblacion.edad.mediana` | 60,0 | P4 mediana → 60,0 | ok (diff 0,0000) |
| `poblacion.jefatura.global_prop` | 0,8750 | P5 global → 0,8750 | ok (diff 0,0000) |

**7/7 anclas reconcilian. Cero divergencias.** No se abrió ninguna `questions/NNN_ancla_*.md`.

## Metodología aplicada (plantilla para replicar)

Flujo por indicador (idéntico al que replicarán las 6 secciones siguientes):

1. **Mapeo**: identificar variable(s) fuente en `Diccionario_Datos` (header fila 3).
2. **Query**: SQL sobre tabla DuckDB `datos` pre-cargada con `read_xlsx(all_varchar=true)`. `TRY_CAST` para tolerar celdas vacías.
3. **Estadístico**:
   - Proporción → `wilson_ci(k, n)` de `common.py` (scipy).
   - Diferencia de proporciones → `diff_props_ci(k1, n1, k2, n2)` (statsmodels).
   - Mediana en continua → `median_iqr(series)` + `median_bootstrap_ci(series, n_resamples=10_000, seed=42)`.
   - Correlación ordinal → `spearman(x, y)`.
4. **Missings**: reportar `missing_rate`. Nunca imputar.
5. **Viz check**: evaluar viz actual contra `<visual_rules>`. Si viola, marcar `viz_viola_rules=True` y setear `viz_recomendada`.
6. **Severidad**: `classify_severity(v_codigo, v_real, n)` aplica umbrales 0,1 / 1,25 / 5 pp → ok / nota / handoff / bloqueo. Con n<10 bump a nota. Narrativas protegidas pueden ser elevadas manualmente a handoff (ej. P4).
7. **Emisión**: construir `IndicadorResultado` y append a lista global. Al final, `write_excel()` genera Resumen/Críticos/Método.

### Contrato de escalado

Para las 6 secciones restantes, crear `audit/fase1/<seccion>_audit.py` con el mismo esqueleto que `population_audit.py`:

```python
from common import (
    ANCHORS, IndicadorResultado, MetodoRow, classify_severity,
    diff_props_ci, get_connection, median_bootstrap_ci, median_iqr,
    spearman, summarize_severities, wilson_ci, write_excel,
)
```

Sub-agentes pueden correr en paralelo — la conexión DuckDB cacheada es `@lru_cache` por proceso, sin contención.

### Decisiones metodológicas que estuvieron bien

- **Wilson CI > normal approximation** para proporciones con n=80: la aproximación normal sería irresponsable con k=3 (ej. bin `>75` hombres=9, mujeres=2).
- **Bootstrap con seed fijo** (42) para IC de mediana: reproducible cross-session; `method="percentile"` sin asumir simetría.
- **Long format en Resumen**: 23 filas sobre 5 indicadores permitió filtrar `Críticos` (19 filas) sin schema extra. Pivotable en Excel para lectura no-técnica.
- **Handoff preemptivo de las 3 questions antes de ejecutar**: P4 tocaba narrativa protegida; el script corrió con cálculos de mediana y media en paralelo, sin bloquear.

### Decisiones que conviene ajustar antes del escalado

- **Stdout cp1252 en Windows**: los prints con caracteres Unicode (`−`, `×`) fallaron con charset default; forzar `PYTHONIOENCODING=utf-8` al correr sub-agentes o sanitizar strings a ASCII. No afecta el xlsx (openpyxl maneja utf-8).
- **`Pagos` n=141 ≠ ancla 148**: no bloquea Población pero queda flag para el auditor de Económica/Sostenibilidad — investigar si son celdas vacías post-lectura o si la fuente cambió desde que se fijó el ancla.
- **Typo en exploración de Fase 1**: la columna derivada `Cohorte_1` (no `Cohorte`) — corregido en el texto del plan. Anotar para no replicar en sub-agentes.

## Dudas abiertas

- [questions/001_piramide_ejes_simetricos.md](../../questions/001_piramide_ejes_simetricos.md) — P3: reemplazo de `chart_bar_vertical` por pirámide ECharts con ejes simétricos. Recomendación A.
- [questions/002_kpi_edad_media_vs_mediana.md](../../questions/002_kpi_edad_media_vs_mediana.md) — P4: reemplazo de KPI media por mediana 60 + IQR + IC bootstrap. **Afecta narrativa protegida** "Estancamiento Demográfico". Recomendación A.
- [questions/003_rangos_etarios_p3.md](../../questions/003_rangos_etarios_p3.md) — P3: normalizar label ambiguo `<18-30` a `15-30` o `18-30`. Recomendación A.

## Decisión: ¿escalar a las 6 secciones restantes?

**Recomendación: sí, escalar con sub-agentes paralelos.** Criterios de éxito del piloto:

- [x] `common.py` es genérico: ninguna referencia hard-coded a "Población" fuera del ejemplo de uso. Las 6 secciones pueden reutilizar 100% de las utilidades.
- [x] Schema `IndicadorResultado` soportó los 4 tipos de estadístico (proporción, mediana, media, conteo) + un caso especial (diff_props) sin cambios.
- [x] Las 3 questions preemptivas quedaron escritas con opciones A/B/C y recomendación.
- [x] Reconciliación de anclas dentro del umbral ok (7/7).
- [x] xlsx producido correctamente (14 KB, 3 hojas, 23/19/5 filas).

Sugerencia para el lanzamiento paralelo: un sub-agente por sección con prompt que incluya
(1) lista de indicadores en `data.tsx`, (2) variables fuente en `Diccionario_Datos`, (3) anclas relevantes de `<anchors>`, (4) imports de `common.py`, (5) contrato de severidad y handoff. El piloto deja como referencia activa `population_audit.py` y este REPORT.

**El commit de cierre del piloto** (`chore(audit-p1): close pilot and mark ready to scale`) queda pendiente hasta que el humano valide este documento.
