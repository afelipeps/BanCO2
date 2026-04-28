# 012 — E5 "Destino Producción" y E9 "Nivel Comercialización" no reconcilian

**Estado:** RESUELTA con fuente documental tesis-time · **Fecha cierre:** 2026-04-28
**Decisión:** [VERSION-LOCK-OVERRIDE] — recodificación tesis-time no documentada pero confirmada por coautor

---

## Resolución (H4)

Las tripletas de E5 (56/10/34) y E9 (100/44/30/26) **no aparecen explícitamente en hoja `Gráficas`**. La lógica es **consistente con E2** (q011): clasificación tesis-time sobre subset filtrado de proyectos con distribución medible de producción.

**Confirmado por usuario (coautor de la tesis)**: filtros tesis-time no documentados, mismo patrón que E2. Respetar.

### Acción aplicada

- Disclosure metodológico en `data.tsx` E5 y E9 (shape + footer académico común).
- Severidad final: `nota` con flag `[VERSION-LOCK-OVERRIDE]`. NO bloqueo.
- Footer común a E5 y E9 en data.tsx:
  > "Clasificación basada en recodificación tesis-time sobre subset de proyectos con distribución medible de producción. Fórmula específica no documentada en `Diccionario_Datos`; cifras publicadas conforme tesis Velásquez, Palacio, Álvarez 2025."

### Justificación del override (criterios C1-C2-C3 vs override)

- **Criterio C1 (magnitud bajo umbral)**: FALLA — discrepancias de 10-23 pp >> 2 pp umbral.
- **Override por trazabilidad documental**: la fuente es la tesis publicada (Velásquez, Palacio, Álvarez 2025); la irreproducibilidad se debe a filtros tesis-time mismos que en E2 (q011). Disclosure explícito + shape metadata + nota de no-reproducibilidad satisface las reglas.

### Acción Fase 4 (queue)

Considerar reemplazar E5 y E9 por **boxplot de `5.2.5_Porc_Venta` + ECDF** (n=30 reproducible). Documentado en `backlog/fase4_visuales.md`. NO ejecutar ahora.

### Cross-references

- `audit/fase1/economica_REPORT.md` — secciones E5 y E9 actualizadas con cierre.
- `data.tsx` — sección ECO, indicadores E5 y E9 con metadata aplicada.
- `CLAUDE.md` — definición de [VERSION-LOCK-OVERRIDE] en sección Severidades.
- `closed/011_version_lock_override.md` — patrón análogo (E2).

---

# Contexto original (pre-resolución)

# 012 — E5 "Destino Producción" y E9 "Nivel Comercialización" no reconcilian con cuts simples

**Estado:** waiting_human_review
**Fase/Tiempo:** 1 / 3 (sub-agente Económica)
**Indicadores:** E5 (data.tsx 502-515) y E9 (data.tsx 559-574)
**Componente afectado:** `IndicatorRenderer.tsx` → `chart_pie` (E5) y `chart_funnel` (E9)

---

## Contexto

E5 y E9 son la misma narrativa en dos visualizaciones distintas (destino productivo / progresión comercial). Ambas publican porcentajes que suman 100% y ambas no reconcilian con cuts simples sobre `5.2.5_Porc_Venta`:

### E5 — Destino Producción (chart_pie, n implícito)

```
Venta            56%
Autoconsumo      10%
Pérdida/Mixto    34%
```

Bajo `n=30` (porc_venta válido):

| Cut | Real | Diff vs código |
|---|---:|---:|
| Venta = porc_venta>=50 | 17/30 = 56,67% | +0,67 (RECONCILIA) |
| Autoconsumo = venta<50 sin pérdida | 10/30 = 33,33% | +23,3 pp |
| Pérdida = perd<0 (Recod_Perdida) | 7/30 = 23,33% | -10,7 pp |

**Sólo "Venta" (56%) reconcilia.** Las otras 2 categorías están sustancialmente desplazadas.

### E9 — Nivel Comercialización (chart_funnel, n implícito)

```
Producción total      100%
Autoconsumo            44%
Venta parcial          30%
Venta consolidada      26%
```

Bajo `n=30` con bins {<30%, 30-79%, >=80%}:

| Cut | Real | Diff vs código |
|---|---:|---:|
| Autoconsumo (venta<30) | 10/30 = 33,33% | -10,7 pp |
| Venta parcial (30-79) | 6/30 = 20,00% | -10,0 pp |
| Venta consolidada (>=80) | 14/30 = 46,67% | +20,7 pp |

Bajo bins alternativos {<50, 50-89, >=90}: 13 / 4 / 13 = 43,3% / 13,3% / 43,3%. Tampoco reconcilia.

## La pregunta

¿Cuál es la lógica de bins exacta para E5 (Venta/Autoconsumo/Pérdida) y E9 (Auto/Parcial/Consolidada)?

Notar que E5 y E9 publican totales distintos (56% Venta vs 26% Venta consolidada — porque "Venta" en E5 incluye lo que en E9 sería "parcial+consolidada"). Esto indica que las dos visualizaciones aplican criterios diferentes, pero ningún criterio simple sobre microdatos actuales replica las cifras.

## Hipótesis

1. Bins basados en variables que actualmente no exploré (e.g., respuestas open-text sobre destino del producto).
2. Recodificación cualitativa pre-tesis sobre `5.2.2_Tipo_Proyecto` con etiquetas intermedias.
3. Cálculo sobre denominador distinto (e.g., n=50 incluyendo familias con tipo_proyecto pero sin porc_venta cuantificado).
4. Version-lock al dataset tesis (mismo razonamiento que E2 — pero discrepancias >>5 pp también fallan criterio C1 de version-lock).

## Opciones

**A. Mantener cifras tesis con nota "no reproducible automáticamente desde microdatos actuales"**
- Pros: fidelidad tesis. La narrativa "Ruta de Madurez Comercial" funciona.
- Contras: 5 de 6 categorías (E5+E9 combinadas) tienen discrepancias >10 pp sin hipótesis específica.

**B. Reemplazar por categorías reproducibles**
- E5 propuesta: Venta dominante (porc_venta>=50)=56,7%, Autoconsumo dominante (venta<50)=43,3%. Pérdida pasa a ser flag separado (n=7, 23,3%).
- E9 propuesta: 3 bins limpios sobre porc_venta con cuts {<30, 30-79, >=80} → 33,3 / 20,0 / 46,7.
- Pros: transparente.
- Contras: re-narrativa requerida.

**C. Consolidar E5 y E9 en una sola viz (boxplot de porc_venta + ECDF)**
- Pros: muestra distribución completa, evita binning arbitrario.
- Contras: pierde simplicidad narrativa.

**Recomendación tentativa: A** para Fase 1 (mantener fidelidad tesis), **B o C para Fase 4** (rediseño visual). Documentar las cifras como "version-locked, recodificación tesis no reproducible".

## Bloqueante para Fase 1?

No — E5 y E9 no tocan ningún ancla del bloque `<anchors>`. La narrativa "Eficiencia Subsidiada" sostiene independiente de E5/E9.
