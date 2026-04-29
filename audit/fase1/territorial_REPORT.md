# Fase 1 — Auditoría sección Territorial (Geografía)

**Estado:** ejecutado, pendiente de validación humana · **Rama:** `refactor/v2` · **Sección:** Geografía / Territorial (id `GEO`, 6 indicadores G1–G6, data.tsx líneas 12-114) · **Fecha run:** 2026-04-18

## Resumen ejecutivo

Los 6 indicadores de Territorial reconcilian en lo aritmético contra los microdatos, pero la auditoría reveló **tres hallazgos estructurales graves** que no son discrepancias numéricas sino problemas de construcción del indicador: (1) G2 "Índice de Conservación" usa un scatter con 5 puntos sintéticos (pattern y=0,8x) que no corresponden a ninguna agregación real; el microdato muestra bimodalidad fuerte (mediana 95,15% conservación, IQR [44; 100]). (2) El ancla `territorial.area_por_familia_ha = 104,6` es una **media distorsionada por un outlier de 6.379 ha**; la mediana real es 5,1 ha/familia. (3) G5 Pisos Térmicos usa una variable **no trazable en `Diccionario_Datos`** — el mapping municipio→piso está sólo en el código. Reconcilia numéricamente pero violaría `<sources>` (microdatos > código). 3 de 6 indicadores violan `<visual_rules>`. Se abrieron 3 questions handoff (005, 006, 007).

## Hallazgos por indicador

### G1 — Distribución Regional · `chart_bar_horizontal`

- 4 filas `ok` + 2 `nota`.
- Reconcilia aritmética al pp con los conteos municipales del microdato.
- Viz aceptable (bar horizontal sobre categorías discretas).

### G2 — Índice de Conservación (ICE) · `chart_scatter` — **viz viola rules**

- 5 puntos sintéticos (`y = 0,8·x`): Minifundios 5→4, Pequeños 10→8, Medianos 50→40, Latifundios 150→120, Grandes Reservas 300→250.
- **No corresponden a ninguna agregación del microdato.** `Clasificacion_Predio` sólo tiene 4 niveles. La proporción "70–80% de área conservada" no es lo que dice la muestra.
- Cálculo real (`Porcentaje_Conservacion`, n=62): mediana 95,15%, IQR [44,00; 100,00], bimodal.
- Ancla `territorial.area_por_familia_ha = 104,6` reconcilia como media muestral **con outlier** (un caso de 6.379 ha); mediana 5,095 ha.
- Severidad: 1 ok + 1 nota + 1 handoff. Ver [questions/005](../../questions/005_g2_scatter_sintetico.md).

### G3 — Perfil de Tenencia · `chart_bar_horizontal`

- 3 filas `ok`. Reconcilia perfectamente.

### G4 — Madurez en el Proyecto · `chart_bar_horizontal`

- 4 filas `ok` + 1 handoff.
- Proporciones correctas (7/16/30/27 = 71,25% en C+D), pero la **etiqueta "Fase A+B+C+D (2023-2024)"** no coincide con el rango real del bin (2022-2025; incluye 5 ingresos de 2025 y 1 caso de 2009 en Fase A).
- La story del indicador dice "2021-2024" pero el rango empírico es 2020-2025. Ver [questions/006](../../questions/006_g4_labels_fase_d.md).

### G5 — Pisos Térmicos · `chart_pie` — **viz viola rules + variable no trazable**

- 3 filas `ok` + 1 handoff.
- Cálculo reconcilia al pp (36/29/15 = 45/36,25/18,75%), pero **no hay columna `Piso_Termico` en `Diccionario_Datos`**. El mapping municipio→piso está hard-coded en `territorial_audit.py`.
- Viz viola regla ("pie de 3 categorías" es permitida técnicamente; aceptable aquí pero se marca porque `Piso_Termico` es categoría, no proporción binaria).
- Ver [questions/007](../../questions/007_g5_mapping_pisos_termicos.md).

### G6 — Cobertura Veredal · `kpi_card`

- 1 fila `ok`. Reconcilia contra ancla `poblacion.muestra.veredas = 52`.

## Reconciliación contra anclas

| Ancla | Valor | Reconciliación | Estado |
|---|---|---|---|
| `territorial.area_por_familia_ha` | 104,6 | G2 media → 104,6 ✓ / mediana → 5,095 | ok (media) · **handoff (mediana)** |
| `poblacion.muestra.veredas` | 52 | G6 → 52 | ok (0,0) |

El handoff sobre mediana de G2 **no es discrepancia numérica del ancla** (el ancla es explícitamente media y el cálculo reconcilia). Es una observación metodológica: el ancla está bien calculada pero es engañosa como descriptor central en continua asimétrica. Ver discusión en questions/005.

## Questions abiertas

- [005](../../questions/005_g2_scatter_sintetico.md) — G2 scatter sintético + ancla 104,6 ha/familia como media distorsionada.
- [006](../../questions/006_g4_labels_fase_d.md) — G4 etiquetas temporales inconsistentes.
- [007](../../questions/007_g5_mapping_pisos_termicos.md) — G5 variable `Piso_Termico` no trazable en diccionario.

## Decisiones metodológicas aplicadas

- **22 filas de Resumen sobre 6 indicadores**. Long format sostuvo sin cambios a `common.py`.
- **Mediana + bootstrap IC95** para la continua `Area_Conservacion_Ha_NUM` (distribución asimétrica con outlier).
- **Wilson CI** para todas las proporciones binomiales.
- **Cruces municipio × piso térmico** documentados en hoja `Método` con mapping explícito.
- **Script evita ANCHORS dict hard-code** del diccionario — reutiliza `common.ANCHORS` íntegro.

## Severidades (output `summarize_severities`)

```
G1: {'ok': 4, 'nota': 2, 'handoff': 0, 'bloqueo': 0}
G2: {'ok': 1, 'nota': 1, 'handoff': 1, 'bloqueo': 0}
G3: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
G4: {'ok': 4, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
G5: {'ok': 3, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
G6: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
```

Total: 16 ok / 3 nota / 3 handoff / 0 bloqueo.

## Recomendación

**Piloto de sección OK**, con 3 handoffs que requieren decisión humana antes de Fase 3/4. La metodología del piloto de Población escaló sin cambios a Territorial. Las discrepancias encontradas son **estructurales** (viz sintéticas, labels inconsistentes, variables no trazables) y no aritméticas; refuerzan el valor de auditar indicador-por-indicador en vez de solo reconciliar anclas globales.
