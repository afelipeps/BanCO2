# Questions/006 — G4 Madurez: labels de fase D y copy "2021-2024"

Estado: **resuelta — Opción A** (Andrés, 2026-04-18) · Autor: sub-agente Territorial (Fase 1)

## Decisión

**Opción A aprobada.** Acciones para Fase 4 (migración visual):

1. Renombrar labels en `data.tsx:69-83` con rangos exhaustivos por bin real:
   - `Fase A` → `Fase A (≤2017)`
   - `Fase A + B (2019)` → `Fase A+B (2018-2019)`
   - `Fase A + B + C (2021)` → `Fase A+B+C (2020-2021)`
   - `Fase A + B + C + D (2023-2024)` → `Fase A+B+C+D (2022-2025)`

2. Story actualizado: "se vinculó en 2020-2025" (en lugar de "2021-2024"). El 71,25% en C+D refleja ingresos del rango real.

3. El caso único de 2009 (1 fila) queda en Fase A bajo regla `≤2017`; se documenta como ingreso retroactivo en el copy del indicador.

## Contexto mínimo

El indicador **G4 "Madurez en el Proyecto"** (`data.tsx:69-83`) reparte los 80 casos en 4 fases:

| label código                            | valor código | conteo real | bin derivado año ingreso |
|-----------------------------------------|--------------|-------------|--------------------------|
| Fase A (2017)                           | 8,75%        | 7           | ≤2017                    |
| Fase A + B (2019)                       | 20,00%       | 16          | 2018-2019                |
| Fase A + B + C (2021)                   | 37,50%       | 30          | 2020-2021                |
| **Fase A + B + C + D (2023-2024)**      | **33,75%**   | **27**      | **2022-2025**            |

Valores aritméticamente **correctos** (`7+16+30+27 = 80`, reconcilian al pp). Pero la **etiqueta "2023-2024" es inconsistente con el bin real** (2022-2025, que incluye los 5 ingresos de 2025).

La story G4 dice: *"El **71,25% de las familias se vinculó en las fases más recientes (2021-2024)**"*. `C+D = 30+27 = 57; 57/80 = 71,25%`. Correcto en proporción, pero el rango del texto es **2020-2025** (no 2021-2024): C empieza en 2020 y D termina en 2025.

### Hallazgos empíricos (año ingreso en microdatos, n=80 sin missings)

| año   | n  |
|-------|----|
| 2009  | 1  |
| 2017  | 6  |
| 2018  | 8  |
| 2019  | 8  |
| 2020  | 14 |
| 2021  | 16 |
| 2022  | 10 |
| 2023  | 7  |
| 2024  | 5  |
| 2025  | 5  |

Notas:
1. Hay **1 caso de 2009** (pre-oficial; probablemente inscripción temprana o captura retroactiva). Queda en Fase A bajo la regla `≤2017`.
2. El año 2025 aparece 5 veces; probablemente son ingresos del año en curso cuando se cerró la base. No es error; la fecha de encuesta llega hasta 2025.

## La pregunta específica

¿Cómo renombrar los labels de G4 para que el texto visual sea consistente con los rangos de año reales, sin romper la narrativa de "Renovación Generacional"?

## Opciones

### A. Labels con rangos explícitos y exhaustivos

- Fase A (≤2017) · Fase B (2018-2019) · Fase C (2020-2021) · **Fase D (2022-2025)**.
- Story: "El 71,25% de las familias se vinculó **en 2020-2025** (fases C+D), el reto es transferir cultura de conservación de los 'Pioneros' (Fase A) a esta nueva ola."
- Pros: rangos exactos, sin truncar 2025. Alineado con `<statistical_rules>` (reportar n efectivo) y la claridad del piloto.
- Contras: rompe la etiqueta "2023-2024" que quizá fue escogida por cierre institucional de algún informe previo (verificar con Andrés).

### B. Labels cumulativos como sugieren las etiquetas actuales

- Fase A (acumulado al 2017) = 8,75% · Fase A+B (acum. al 2019) = 28,75% · Fase A+B+C (acum. al 2021) = 66,25% · Fase A+B+C+D (acum. al 2025) = 100%.
- Pros: respeta el intento original de las etiquetas "A+B", "A+B+C".
- Contras: cambia el chart a un "stepped area" cumulativo — no es lo que dibuja `chart_bar_horizontal` actual. Requiere migrar tipo de viz.

### C. Mantener etiquetas actuales; corregir sólo la story

- Dejar "Fase A + B + C + D (2023-2024)" (errado en rango) pero ajustar el copy a "el 71,25% se vinculó en **2020-2025**".
- Pros: mínima intervención.
- Contras: deja un label visualmente mentiroso. Futuros revisores tropezarán con él.

## Recomendación tentativa

**Opción A**. Es el cambio más pequeño que elimina la incongruencia sin tocar el tipo de viz. Además alinea con la lógica resuelta en questions/003 (P3 pirámide): renombrar labels de bins para que describan su contenido real, no un rango aspiracional.

Implementación mínima (Fase 4, migración visual): actualizar `data.tsx:74-77` y el copy de `data.tsx:80-81` simultáneamente.

## Screenshot / ruta

- Componente: `components/IndicatorRenderer.tsx` (rama `chart_bar_horizontal`) + `data.tsx:69-83`.
- Bin derivado en `audit/fase1/territorial.xlsx` hoja Resumen (filas G4/*).
