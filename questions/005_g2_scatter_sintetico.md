# Questions/005 — G2 ICE: scatter sintético y ancla 104,6 ha/familia

Estado: **waiting_human_review** · Autor: sub-agente Territorial (Fase 1) · 2026-04-18

## Contexto mínimo

El indicador **G2 "Índice de Conservación (ICE)"** (`data.tsx:34-52`) es un `chart_scatter` con 5 puntos fijos:

| name            | x (Area Total) | y (Área Conservada) | z (radio) |
|-----------------|----------------|---------------------|-----------|
| Minifundios     | 5              | 4                   | 10        |
| Pequeños        | 10             | 8                   | 20        |
| Medianos        | 50             | 40                  | 50        |
| Latifundios     | 150            | 120                 | 100       |
| Grandes Reservas| 300            | 250                 | 200       |

La story dice: *"tanto minifundistas como medianos y grandes propietarios mantienen una proporción elevada del predio bajo conservación (alrededor del 70–80%)"*.

### Hallazgos empíricos (microdatos, n=63 con ambas variables no nulas)

- **Los 5 puntos del scatter no corresponden a ninguna agregación del microdato.** Son etiquetas sintéticas con y=0.8x. La columna `Clasificacion_Predio` del diccionario tiene sólo 4 niveles (Microfundio <3 / Minifundio 3-10 / Pequeña 10-50 / Mediana/Grande >50), no 5.
- **El 70–80% del story es incorrecto.** `Porcentaje_Conservacion` real en la muestra tiene **mediana 95,15% (IQR [44,00; 100,00]; n=62)**. El 75% de los casos tiene ≥44% y el 50% tiene ≥95%. Hay fuerte bimodalidad entre predios 100% conservados y predios <50%.
- **Ancla `territorial.area_por_familia_ha = 104,6` se reconcilia** como la media muestral de `Area_Conservacion_Ha_NUM` con **n=66** (incluyendo un outlier de 6.379 ha). **Sin el outlier la media baja a ~8,08 ha/familia; la mediana es ~5,10 ha/familia** (IQR [2,36; 11,63]). La media es engañosa como "hectáreas conservadas por familia" típicas.

### Implicaciones

1. **Scatter sintético**: engaña al lector. El patrón "70–80%" sugerido no existe. Hay un cluster denso de minifundistas (mediana 4 ha conservada, 95% del predio) y un outlier único de 6.379 ha que distorsiona cualquier promedio.
2. **Ancla 104,6 ha/familia** está publicada como sólido en CLAUDE.md, pero **bajo la lupa de `<visual_rules>` ("Nunca media en KPI card" para continua asimétrica) es defectuosa**. La mediana 5 ha/familia cuenta una historia radicalmente distinta.

## Opciones

### A. Reemplazar scatter por boxplot + scatter real, y reescribir narrativa

- Migrar G2 a doble panel: (i) boxplot de `Area_Conservacion_Ha_NUM` por `Clasificacion_Predio` con strip plot de casos crudos; (ii) scatter real n=63 con log-log en ejes (por la asimetría).
- Historia nueva: "La mediana de área conservada por familia es 5 ha; el 75% conserva ≥95% de su predio. El 'promedio' de 104,6 ha está distorsionado por un único caso de 6.379 ha."
- Mantener ancla 104,6 en CLAUDE.md pero **marcarla como media muestral (no descriptor central), y añadir ancla `territorial.area_conservacion.mediana_ha = 5,095`** como descriptor principal.
- Pros: cumple `<visual_rules>`, narrativa honesta, preserva ancla como info complementaria.
- Contras: cambia mensaje institucional ("22.512 ha conservadas a razón de 104 ha/familia" queda matizado).

### B. Mantener scatter pero poblarlo con los 63 casos reales

- Reemplazar los 5 puntos sintéticos por los 63 puntos reales; conservar `chart_scatter` como tipo. Añadir línea de referencia y=x (100% conservación) y mediana %.
- Mantener narrativa "70–80%" → reescribir a "mediana 95% de conservación; el 50% central está entre 44% y 100%".
- Pros: mínimo cambio visual; narrativa corrige error sin cambiar tipo de viz.
- Contras: no ataca la asimetría fundamental (un outlier domina la escala; necesita ejes log).

### C. Deprecar G2 y fusionar con G3

- G2 y G3 miden casi lo mismo (distribución de tamaños de predio). El scatter sintético no aporta; G3 ya cuenta la historia correctamente con bins de área total.
- Añadir a G3 un segundo panel con %conservación por bin (boxplot).
- Pros: reduce indicadores, elimina mentira sintética.
- Contras: pierde el mensaje de "área conservada por familia"; el ancla 104,6 pierde hogar visual.

## Recomendación tentativa

**Opción A**. Es la única que: (i) honra `<visual_rules>`; (ii) reconcilia la narrativa con los microdatos sin eliminar la historia; (iii) deja trazabilidad de la discrepancia media vs mediana (paralelo exacto con P4 de Población, que ya se resolvió en questions/002 priorizando mediana).

## Screenshot / ruta

- Componente: `components/IndicatorRenderer.tsx` (rama `chart_scatter`) + `data.tsx:34-52`.
- Data real ya exportada en `audit/fase1/territorial.xlsx` hoja Resumen (`G2/area_conservacion_mediana_ha`).
