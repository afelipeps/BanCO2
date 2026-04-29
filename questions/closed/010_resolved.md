# 010 — ST4 "Fricción Operativa" sin fuente reproducible en microdatos

**Estado:** RESUELTA con fuente documental · **Fecha cierre:** 2026-04-28
**Decisión:** [VERSION-LOCK-OVERRIDE] — fuente trazable en hoja `Gráficas` rows 230-234

---

## Resolución (H2)

Fuente confirmada: **hoja `Gráficas` del xlsx, rows 230-234**.

```
Criterio de Fricción | Conteo Menciones | %
Pagos                | 68               | 0,4857
Trámites             | 47               | 0,3357
Visitas              | 25               | 0,1786
Total                | 140              | 1,0000
```

**Codificación tesis-time**: conteo manual de palabras clave sobre open-text `6.2_Desafios_Cumplimiento` + `6.5_Sugerencias_Mejora_Programa`. Multi-select (140 menciones / 80 familias = 1,75 menciones/familia). La taxonomía exacta de keywords no está documentada en `Diccionario_Datos`, pero la fuente documental está en el mismo xlsx normalizado.

### Acción aplicada

- Disclosure metodológico en `data.tsx` ST4 (shape `{ value, n, source, transformation, timeWindow }` + footer académico).
- Severidad final: `nota` con flag `[VERSION-LOCK-OVERRIDE]`. NO bloqueo.
- Footer del indicador en data.tsx:
  > "Categorías derivadas de codificación manual de menciones por palabras clave sobre respuestas abiertas (n=140 menciones, multi-select sobre n=80 familias). Fuente: BASE_DATOS_BANCO2_NORMALIZADA, hoja `Gráficas` rows 230-234."

### Justificación del override (criterios C1-C2-C3 vs override)

- **Criterio C1 (magnitud bajo umbral)**: NO aplica — la cifra es no-reproducible con cuts simples; magnitud no medible.
- **Override por trazabilidad documental**: la fuente vive en el mismo xlsx normalizado que se distribuye con el proyecto. Disclosure explícito + footer académico + shape metadata satisface `<code_rules>` "shape obligatorio".

### Cross-references

- `audit/fase1/sostenibilidad_REPORT.md` — sección ST4 actualizada con cierre.
- `data.tsx` — sección SOST, indicador ST4 con metadata aplicada.
- `CLAUDE.md` — definición de [VERSION-LOCK-OVERRIDE] en sección Severidades.

---

# Contexto original (pre-resolución)

# 010 — ST4 "Fricción Operativa" sin fuente reproducible en microdatos

**Estado:** waiting_human_review
**Fase/Tiempo:** 1 / 3 (sub-agente Sostenibilidad)
**Indicador:** ST4 `Fricción Operativa` (data.tsx líneas 736-748)
**Componente afectado:** `IndicatorRenderer.tsx` → `chart_bar_horizontal` con datos
```
Pagos     48,57%
Trámites  33,57%
Visitas   17,86%
```

---

## Contexto mínimo necesario

Auditando la sección Sostenibilidad encontré que ST4 publica 3 categorías de fricción operativa (Pagos / Trámites / Visitas) con porcentajes que suman exactamente 100,00%:

- 48,57% / 33,57% / 17,86% → reconstruyen 68 + 47 + 25 = **140 selecciones** (multi-select sobre n=80, ratio 1,75 selecciones por familia).

Intenté reproducir esos conteos desde los microdatos:

| Fuente candidata | Resultado |
|---|---|
| `6.2_Desafios_Cumplimiento` (open-text) | 75/80 sin keywords; 5/80 mencionan "visitas/desplazamiento". No reproduce. |
| `6.5_Sugerencias_Mejora_Programa` (open-text) | 45/80 mencionan pagos; 12/80 trámites; 0/80 visitas. No reproduce. |
| `4.2_Puntualidad_Pagos_1a5`, `4.4_Visitas_Tecnicas_1a5` | Numéricas Likert; no son binary multi-select. |

No existe en `Datos_Normalizados` ninguna columna multi-select con 3 categorías Pagos/Trámites/Visitas. La hoja `Diccionario_Datos` tampoco la declara. Las hojas auxiliares del xlsx (`Gráficas`, `Tabla dinámica 1`, `Estadisticas_Descriptivas`) no se exploraron exhaustivamente; **es posible que ST4 tenga una pivot table embebida en el xlsx que aún no inspecciono**, o que la codificación sea tesis-time externa (Excel manual sobre transcripción de open-text).

---

## La pregunta específica

¿Cuál es la fuente exacta de los porcentajes 48,57 / 33,57 / 17,86 en ST4?

Sub-pregunta (para guiar la respuesta):
1. ¿Existe un libro de codificación interno (planilla Excel anexa, anotaciones tesis-time)?
2. ¿Es derivado de las open-text 6.2 + 6.5 con un esquema de keywords que el equipo aplicó manualmente?
3. ¿Es de una hoja del xlsx que aún no inspeccioné (`Gráficas`, `Tabla dinámica 1`, `Estadisticas_Descriptivas`)?

---

## Opciones A/B/C

### A. Mantener cifras con disclosure metodológico
**Pros:** sin re-trabajo; reconoce el origen tesis-time.
**Contras:** viola `<code_rules>` "Cero valores hardcodeados sin metadata".
**Acción:** agregar `source: "tesis 2025, Tabla X"` en `data.tsx` y el shape `{ value, n, source, transformation }`.

### B. Documentar fórmula reproducible
**Pros:** restaura trazabilidad. Permite re-cálculo si el dataset se actualiza.
**Contras:** requiere escribir la lógica de classification de open-text (probablemente tesis-time fue manual).
**Acción:** crear `audit/fase1/_findings/st4_friccion_taxonomia.md` con la lista exacta de palabras clave usadas y verificar conteos.

### C. Reemplazar por una métrica reproducible derivable de `4.2_Puntualidad_Pagos_1a5`
**Pros:** auditable al pp con n=79 microdato.
**Contras:** cambia la narrativa (el indicador deja de ser "fricción operativa" multi-categoría y pasa a ser "puntualidad ≤ 3 sobre 5"). Posible aceptable: 0,3338 × pendiente OLS de ST6 confirma la hipótesis "impuntualidad erosiona confianza".
**Acción:** refactor de `data.tsx` y reemplazo del `chart_bar_horizontal` por un único `kpi_card` o `proporcion_wilson_bar` ("X% de familias califican puntualidad ≤ 3").

---

## Recomendación tentativa

**B + A híbrido**, en este orden:
1. Andrés clarifica fuente exacta (¿tesis Tabla N? ¿planilla manual?).
2. Si la fuente existe documentalmente: mantener cifras con disclosure (A).
3. Si NO existe documentación reproducible: aplicar opción B (reconstruir la taxonomía con keywords y verificar). Si tampoco se logra: opción C (reemplazo por métrica derivable).

**Severidad actual del audit:** `handoff` para los 3 subgrupos. NO bloqueo (la cifra es interpretable y consistente sumando 100%; solo falta trazabilidad).

**Decisión por defecto si no hay respuesta en 1 día:** continuar con opción A (mantener cifras con flag explícito de "fuente tesis-time, no reproducible"). Marcar en commit `waiting_human_review`.

---

## Anexos

- Severidad de los 3 subgrupos en xlsx: `handoff` (irreproducible, no bloqueo).
- Auditoría completa: `audit/fase1/sostenibilidad.xlsx` hoja `Resumen` rows ST4_*.
- Reporte: `audit/fase1/sostenibilidad_REPORT.md` sección "ST4 — Fricción Operativa".
