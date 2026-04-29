# Questions/007 — G5 Pisos Térmicos: variable fuente no trazable en diccionario

Estado: **resuelta — Opción B con plan A futuro** (Andrés, 2026-04-18) · Autor: sub-agente Territorial (Fase 1)

## Decisión

**Opción B aprobada para Fase 4** (centralizar el mapping en código, NO promover a columna del xlsx aún) · **Plan A en Fase 3 arquitectural** (evaluar promover a columna del xlsx).

Acciones:

1. **Fase 4**: extraer `PISO_TERMICO_MAP` desde `territorial_audit.py` y centralizarlo en `src/data/mappings.ts` con metadata de fuente:
   ```ts
   // src/data/mappings.ts
   export const PISO_TERMICO_MAP = {
     /** Fuente: derivación geográfica del Oriente Antioqueño + reconciliación
      *  con cifras del dashboard (36/29/15). Verificada en audit/fase1/scripts/territorial_audit.py
      *  el 2026-04-18. No formalizada en Diccionario_Datos del xlsx (questions/007). */
     "Puerto Triunfo": "Cálido (Magdalena)",
     "San Rafael":     "Templado (Bosques)",
     "San Carlos":     "Templado (Bosques)",
     "Cocorná":        "Templado (Bosques)",
     "San Luis":       "Templado (Bosques)",
     "San Francisco":  "Templado (Bosques)",
     "La Ceja":        "Frío (Altiplano)",
     "Granada":        "Frío (Altiplano)",
     "El Peñol":       "Frío (Altiplano)",
     "Guarne":         "Frío (Altiplano)",
     "Guatapé":        "Frío (Altiplano)",
   } as const;
   ```

2. **Fase 3 arquitectural**: evaluar si conviene **promover** este mapping a columna `Piso_Termico` derivada en `Datos_Normalizados`. Pros: trazabilidad en `Diccionario_Datos`, consistencia con otras derivadas (`Rango_Edad`, `Cohorte_1`). Contras: cambia el xlsx fuente, requiere coordinación con Masbosques. Decisión queda pendiente para cuando se aborde el versionado del dataset.

## Contexto mínimo

El indicador **G5 "Pisos Térmicos"** (`data.tsx:85-98`) publica 3 proporciones:

| piso              | valor código | conteo deducido |
|-------------------|--------------|-----------------|
| Templado (Bosques)| 45,00%       | 36/80           |
| Frío (Altiplano)  | 36,25%       | 29/80           |
| Cálido (Magdalena)| 18,75%       | 15/80           |

Reconcilia al pp con los valores del código. Pero **no hay columna `Piso_Térmico` (ni equivalente) en `Diccionario_Datos`**. La categorización no es trazable en el microdato.

## Hallazgos empíricos

Reconstruí el mapping deductivo municipio → piso térmico a partir de (i) distribución municipal observada (11 municipios, total 80), (ii) los valores publicados, y (iii) conocimiento geográfico del Oriente Antioqueño:

| piso              | municipios                                                         | casos  |
|-------------------|--------------------------------------------------------------------|--------|
| Cálido (Magdalena)| Puerto Triunfo                                                     | 15     |
| Templado (Bosques)| San Rafael, San Carlos, Cocorná, San Luis, San Francisco           | 36     |
| Frío (Altiplano)  | La Ceja, Granada, El Peñol, Guarne, Guatapé                        | 29     |
| **Total**         |                                                                    | **80** |

Este mapping reproduce exactamente 36/29/15 del código. Es la **única partición defensible** de los 11 municipios en 3 clases con esas cardinalidades, salvo permutaciones que violarían la geografía real (p.ej. La Ceja no es cálido; Puerto Triunfo no es frío).

Casos incómodos:
- **Cocorná** y **San Luis** tienen zonas cálidas en la parte baja y zonas templadas hacia arriba. Los clasifiqué como "Templado" porque sin esa asignación la cuenta no cierra en 36/29/15. Andrés: ¿es lo que usaste originalmente, o hay un criterio distinto (ej. altitud de la cabecera)?
- El mapping está actualmente **hard-coded en el script** (`PISO_TERMICO_MAP` de `territorial_audit.py`). Queda fuera de los microdatos.

## La pregunta específica

¿Queremos formalizar la derivación municipio→piso térmico como columna del xlsx normalizado (y del diccionario), o la dejamos como mapping estático en código?

## Opciones

### A. Añadir columna derivada `Piso_Termico` al xlsx normalizado

- Modificar el pipeline de normalización del microdato (fuera de alcance de Fase 1 aquí) para incluir la columna derivada.
- Documentar el mapping en `Diccionario_Datos` con nota "NUEVO - Derivado" (como `Rango_Edad` o `Cohorte`).
- Pros: trazabilidad total; cualquier auditor futuro ve la categorización en el microdato. Alineado con `<sources>` (jerarquía microdatos > tesis > código).
- Contras: requiere tocar `data_source/` (sagrado por reglas; requiere autorización explícita) o al menos producir un paso intermedio de enriquecimiento.

### B. Mantener mapping en código pero centralizarlo en `src/data/mappings.ts` con trazabilidad

- Crear un módulo TS con la tabla municipio→piso y exportar para uso del dashboard.
- Documentarlo en `audit/fase1/territorial_REPORT.md` como la fuente canónica.
- Pros: cero modificación de microdatos; cumple "valores hardcodeados sin metadata" evitándolos (el mapping es metadata de derivación, con fuente declarada).
- Contras: el mapping sigue fuera del diccionario; cualquier recategorización obliga a tocar código.

### C. Deprecar G5

- Si la clasificación climática no es un output prioritario y existe sólo por convención, reemplazar G5 por un indicador más fuerte (p.ej. "Veredas por municipio" o "Concentración territorial (HHI)").
- Pros: elimina el único indicador territorial sin variable fuente directa.
- Contras: la narrativa "diversidad ecosistémica" es parte del relato CORNARE/Masbosques; no se puede cortar sin consulta curatorial.

## Recomendación tentativa

**Opción B** a corto plazo (Fase 1 no debería tocar microdatos), **con plan para migrar a Opción A en Fase 3** (cuando toque re-armar `src/data/`). Justificación:

- B es inocua a la jerarquía de fuentes (no modifica el xlsx) y conserva el indicador con trazabilidad clara.
- A es la solución correcta a mediano plazo pero no es responsabilidad del auditor estadístico Fase 1.
- C es desproporcionado: el indicador sí reconcilia y tiene rol narrativo; sólo le falta trazabilidad.

Adicionalmente: migrar la viz de **`chart_pie` → `chart_bar_horizontal` con Wilson CI** en Fase 4, consistente con la regla `<visual_rules>` ("proporción binomial: barra + IC Wilson").

## Screenshot / ruta

- Componente: `components/IndicatorRenderer.tsx` (rama `chart_pie`) + `data.tsx:85-98`.
- Mapping operativo en `audit/fase1/scripts/territorial_audit.py`, constante `PISO_TERMICO_MAP`.
