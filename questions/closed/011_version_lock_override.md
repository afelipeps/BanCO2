# 011 — E2 "Vocación Productiva" no reconcilia con cuts simples sobre microdatos

**Estado:** RESUELTA con fuente documental · **Fecha cierre:** 2026-04-28
**Decisión:** [VERSION-LOCK-OVERRIDE] — fuente trazable en hoja `Gráficas` rows 159-162

---

## Resolución (H3)

Fuente confirmada: **hoja `Gráficas` del xlsx, rows 159-162**.

```
Categoría                   | Criterio    | Conteo | %
Enfoque en Subsistencia     | Venta ≤ 25% | 5      | 0,217
Enfoque Comercial Activo    | Venta > 25% | 18     | 0,783
Total Distribución Medible  |             | 23     | 1,000
```

**Cut declarado**: `Venta > 25%` sobre n=23 etiquetada "Distribución Medible". Aplicado a las 23 filas con `5.2.5_Porc_Venta` válido sobre microdatos actuales da **12/11 (52,2%/47,8%), no 18/5 (78,3%/21,7%)** — diferencia ~26 pp.

**Causa confirmada por usuario (coautor de la tesis)**: la tesis aplicó **filtros adicionales no documentados** sobre la "Distribución Medible". La lógica del filtro tesis-time no está en `Diccionario_Datos` ni reproducible automáticamente con cuts simples.

### Acción aplicada

- Disclosure metodológico en `data.tsx` E2 (shape + footer académico).
- Severidad final: `nota` con flag `[VERSION-LOCK-OVERRIDE]`. NO bloqueo.
- Footer del indicador en data.tsx:
  > "Cut declarado: Venta > 25% sobre n=23 'Distribución Medible' (filtro tesis-time aplicado sobre proyectos con dato medible de distribución venta/autoconsumo/pérdida). Lógica del filtro no documentada en `Diccionario_Datos`; valores publicados conforme tesis Velásquez, Palacio, Álvarez 2025."

### Justificación del override (criterios C1-C2-C3 vs override)

- **Criterio C1 (magnitud bajo umbral)**: FALLA — discrepancia ~26 pp >> 2 pp umbral. NO califica version-lock estándar.
- **Override por trazabilidad documental**: la fuente declara cut + n + categorías en hoja `Gráficas` del xlsx normalizado. La irreproducibilidad se debe a filtros tesis-time NO al desplazamiento del dataset. Disclosure explícito + shape metadata es la resolución correcta.

### Cross-references

- `audit/fase1/economica_REPORT.md` — sección E2 actualizada con cierre.
- `data.tsx` — sección ECO, indicador E2 con metadata aplicada.
- `CLAUDE.md` — definición de [VERSION-LOCK-OVERRIDE] en sección Severidades.

---

# Contexto original (pre-resolución)

# 011 — E2 "Vocación Productiva" no reconcilia con cuts simples sobre microdatos

**Estado:** waiting_human_review
**Fase/Tiempo:** 1 / 3 (sub-agente Económica)
**Indicador:** E2 `Vocación Productiva` (data.tsx líneas 455-468)
**Componente afectado:** `IndicatorRenderer.tsx` → `chart_bar_horizontal` con datos
```
Enfoque Comercial Activo  78,3%
Subsistencia (Pancoger)   21,7%
```

---

## Contexto mínimo necesario

E2 publica 78,3% / 21,7% sin variable derivada visible en `Diccionario_Datos`. La interpretación natural es una clasificación binaria de los proyectos productivos en "comercial" vs "subsistencia/pancoger".

Probé múltiples cuts sobre `5.2.5_Porc_Venta` y `5.2.5_Porc_Autoconsumo` con denominadores razonables (n=23 ambos válidos, n=30 venta válida, n=32 proyecto=Sí, n=24 productivo+ing>0):

| Denominador | Cut propuesto | k_comercial | % comercial | Diff vs 78,3% |
|---|---|---:|---:|---:|
| n=23 | porc_venta>=50 | 13 | 56,52% | -21,8 pp |
| n=23 | porc_venta>=20 | 23 | 100,00% | +21,7 pp |
| n=23 | auto<=20 | 12 | 52,17% | -26,1 pp |
| n=23 | auto<50 | 11 | 47,83% | -30,5 pp |
| n=30 | porc_venta>=50 | 17 | 56,67% | -21,6 pp |
| n=30 | porc_venta>=80 | 15 | 50,00% | -28,3 pp |
| n=24 (ing>0) | ing>100k | 14 | 58,33% | -20,0 pp |
| n=32 (proy=Sí) | porc_venta>=50 | 17 | 53,13% | -25,2 pp |

**Ningún cut natural produce 78,3% (k=18 sobre n=23 sería 78,26%; k=18 no aparece en ningún umbral simple).**

Los 9 valores únicos de `5.2.5_Porc_Venta` son: {20, 25, 30, 45, 70, 80, 90, 95, 99, 100}. Las 10 filas con venta=20 (auto=80) son el patrón "pancoger clásico" — agrupándolas como subsistencia da 13/23=56,5% comercial vs 10/23=43,5% pancoger; aún lejos de 78,3/21,7.

## La pregunta específica

¿Cuál es la fórmula exacta que produce 78,3% / 21,7% para E2?

Hipótesis ordenadas por probabilidad:
1. Recodificación cualitativa adicional sobre `5.2.2_Tipo_Proyecto` (texto libre con 17 variantes ortográficas: PECUARIO, AGRICOLA, ga0deria, Negocios verdes, etc.) clasificadas manualmente como "comercial" vs "pancoger".
2. Combinación de dos variables (porc_venta + tipo_proyecto + frecuencia de venta) no reconstruible automáticamente.
3. **Version-lock sobre dataset tesis** — la tesis publicada usó un dataset previo donde la distribución era diferente.
4. Bug de cifra en data.tsx (los porcentajes provienen de cálculo manual en una hoja Excel que ya no está sincronizada).

## Opciones A/B/C

**A. Mantener cifras del dashboard como version-lock**
- Pros: fidelidad con tesis publicada (Velásquez, Palacio, Álvarez 2025). Patrón ya usado en S1.
- Contras: criterio C1 de version-lock NO se cumple (discrepancia ~22 pp >> 2 pp umbral); no hay hipótesis específica documentable. Implicaría desplazamiento masivo del dataset, no consistente con un caso post-publicación.

**B. Reemplazar con cifras reproducibles (porc_venta>=50 sobre n=23)**
- Cifras: 56,5% Comercial / 43,5% Subsistencia.
- Pros: directamente reproducible desde microdatos; transparente.
- Contras: difiere significativamente de tesis; la narrativa "Enfoque Comercial Activo dominante" se debilita.

**C. Pausar publicación de E2 hasta resolver fórmula**
- Pros: evita publicar cifras no auditables.
- Contras: deja un hueco en la sección Económica.

**Recomendación tentativa: A con asterisco** — mantener cifras de tesis con nota explícita "version-lock al dataset publicado en tesis 2025; recodificación cualitativa de tipo de proyecto no automatizada en este dashboard". La narrativa "Enfoque Comercial" es central en la sección y eliminar la cifra debilita el storytelling. Pero documentar explícitamente la imposibilidad de reproducir desde microdatos actuales.

## Bloqueante para Fase 1?

No directamente — E2 no toca un ancla declarada en `<anchors>`. La narrativa de fondo ("Eficiencia Subsidiada" + "Estancamiento Demográfico" + "Dualidad Distributiva") no depende de E2.
