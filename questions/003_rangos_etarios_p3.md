# 003 — Rangos etarios P3: bins del código vs bins del xlsx

**Estado:** abierta · **Contexto:** auditoría Fase 1 piloto Población · **Afecta:** indicador P3 en `data.tsx:152-168` + columna derivada `Rango_Edad` en `Datos_Normalizados`.

## Contexto

El indicador **P3 "Pirámide Poblacional"** declara 5 bins etarios en el código:

```ts
'<18-30', '31-45', '46-60', '61-75', '>75'
```

La sintaxis `<18-30` es ambigua: ¿es "menor que 18-30"?, ¿"18 o menos, hasta 30"?, ¿"de <18 hasta 30"? Asumimos interpretación común "15 a 30" (rango mínimo conocido del microdato: 15–90).

La hoja `Datos_Normalizados` tiene una columna derivada **`Rango_Edad`** (verificada empíricamente con DuckDB `DESCRIBE`). Ejemplos de valores muestreados: `'46-60'`, `'18-30'`. Los bins del código y del xlsx **pueden no coincidir** (especialmente en el límite inferior: el xlsx parece usar `18-30` y el código `<18-30`).

La auditoría Fase 1 debe reportar la discrepancia sin forzar una reinterpretación.

## Pregunta

¿Qué bins usar como canónicos en Fase 3?

## Opciones

### A — Bins explícitos cerrados (recomendada)

Normalizar a sintaxis inequívoca: `[15-30] / [31-45] / [46-60] / [61-75] / [76+]` (o `>75` si se prefiere la cota abierta superior).

**Pros:** interpretable; evita ambigüedad `<18-30`; consistente con rango real (15–90).
**Contras:** requiere reverificar bins de `Rango_Edad` (¿el xlsx colapsa `<18` en `18-30` o los excluye?). Posible reclassificación de casos frontera.

### B — Adoptar literalmente los bins de `Rango_Edad`

Lo que diga el xlsx manda. Si el xlsx usa `18-30`, el código adopta `18-30`.

**Pros:** fuente única de verdad (microdatos > código).
**Contras:** si `Rango_Edad` tiene su propia ambigüedad (p.ej. no documenta incluye/excluye el borde), hereda el problema.

### C — Dos bins coexisten explícitamente

La Fase 3 renderiza la pirámide con los bins del código y el report indica a pie de página "fuente xlsx usa bins Y".

**Pros:** máxima transparencia.
**Contras:** confuso para usuario final.

## Recomendación tentativa

**Opción A** después de verificar con el auditor de P3 cuántos casos caen en el bin más bajo y si `Rango_Edad` usa `18-30` o `15-30`. Si el xlsx ya trae `18-30` y no hay ningún caso <18 (coherente con que el programa sea para titulares de predio, adultos), la reclassificación es trivial.

## Tarea para el piloto

`population_audit.py` debe reportar:
1. Tabla de frecuencias por bin del código (aplicados al continuo `1.7_Edad`).
2. Tabla de frecuencias por bin del xlsx (`Rango_Edad` tal como viene).
3. Diferencia fila a fila si los sets de bins no coinciden exactamente.

Esto sirve de evidencia para cerrar la decisión A/B/C en Fase 3.
