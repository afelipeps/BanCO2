# 008 — S1 Desacople del Incentivo: 3 bloqueos vs microdatos

**Estado:** abierta · **Contexto:** auditoría Fase 1 sección Social · **Afecta:** indicador S1 en `data.tsx` (líneas dentro del bloque Social 294-435).

## Contexto

El indicador **S1 "Desacople del Incentivo"** (viz `chart_line_multi`) publica 4 puntos temporales con dos series (`bienestar` y `compromiso`) agrupados por cohorte de fase de ingreso al programa (A pre-2019, B 2019-2020, C 2021-2022, D 2023+).

Al reconciliar contra los microdatos de `Datos_Normalizados`, **5 de las 8 filas tienen severidad alta** (3 `bloqueo` + 2 `handoff`), todas superando 1,65 pp de discrepancia:

| Serie × cohorte | Valor código | Valor real | Diff (pp) | Severidad |
|---|---|---|---|---|
| bienestar_A (pre-2019) | 71,4% | 60,0% (9/15) | 11,40 | **bloqueo** |
| bienestar_B (2019-2020) | 43,8% | 45,45% (10/22) | 1,65 | handoff |
| compromiso_B (2019-2020) | 100,0% | 95,45% (21/22) | 4,55 | handoff |
| bienestar_C (2021-2022) | 26,7% | 3,85% (1/26) | 22,85 | **bloqueo** |
| bienestar_D (2023+) | 14,8% | 23,53% (4/17) | 8,73 | **bloqueo** |

Los conteos del auditor asumen filtro `Año_Ingreso` sobre `1.9_Año_Ingreso` mapeado a cohortes A/B/C/D.

## La pregunta específica

¿Qué está pasando con S1? Tres hipótesis posibles, todas bloqueantes para Fase 3 sin investigación previa:

### Hipótesis 1 — Los valores publicados provienen de otra fuente/ventana

S1 podría estar calculándose sobre un subconjunto distinto (p. ej. sólo "Familia Campesina" de hoja `Pagos`, o sobre una ventana temporal 2022–2023 que no se refleja en `1.9_Año_Ingreso` de `Datos_Normalizados`). En ese caso, auditarlo contra `Datos_Normalizados` es inapropiado y hay que re-mapear la fuente.

### Hipótesis 2 — El cohortamiento del código es distinto al del auditor

El auditor interpretó cohortes como `A=≤2018, B=2019-2020, C=2021-2022, D=≥2023`. Si el código en `data.tsx` usa otra ventana (p. ej. `A=2017-2019, B=2020, C=2021, D=2022+`), los denominadores n cambian y las proporciones también. **Acción**: inspeccionar la derivación efectiva en el código y compararla con la del auditor.

### Hipótesis 3 — Los valores del código son obsoletos o sintéticos

El patrón descendente 71,4 → 43,8 → 26,7 → 14,8 es muy "limpio" para datos de una muestra tan chica (n por cohorte 15–26). Sugiere posible interpolación o ilustración narrativa, no cálculo sobre microdatos. Si es así, la viz engaña al lector igual que G2 (ver `questions/005`).

## Opciones

### A — Investigar origen del valor del código antes de decidir

No tomar decisión en Fase 1. Auditor de Económica o Andrés inspecciona `data.tsx`, posiblemente la tesis, y determina cuál hipótesis aplica. Fase 4 decide cómo refactorizar.

**Pros:** evita decidir sin datos.
**Contras:** deja la auditoría de Social con 3 bloqueos no resueltos hasta que se resuelva.

### B — Declarar S1 como "indicador no auditable contra microdatos" y refactor obligado

Marcar el indicador como obsoleto desde Fase 3 y reemplazarlo por una viz que sí reconcilie (p.ej. bienestar/compromiso marginal + IC Wilson por cohorte, sin series cruzadas).

**Pros:** resuelve el bloqueo metodológicamente.
**Contras:** pérdida de la narrativa "desacople del incentivo" si los valores originales tenían justificación.

### C — Mantener valores publicados con disclaimer

Dejar S1 como está con nota al lector "valores ilustrativos, no derivados de muestra n=80".

**Pros:** cero cambio.
**Contras:** viola principio "microdatos > tesis > código" del `<sources>` del CLAUDE.md.

## Recomendación tentativa

**Opción A.** La decisión Fase 3/4 sobre S1 no puede tomarse sin saber la fuente real. El auditor de Económica (que leerá `Pagos` en Tiempo 3) probablemente encuentre que S1 se calcula sobre `Pagos` cohortado por `FASE`, no sobre `Datos_Normalizados`. Antes de esa auditoría, marcar S1 como **bloqueante para cierre Fase 1** y documentar aquí.

## No ejecutar

Andrés decide después de revisar el reporte consolidado Fase 1.
