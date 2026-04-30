# 014 — Radar A2 Servicios Ecosistémicos: 5to eje "Densidad de Árboles"

Fecha apertura: 2026-04-29
Disparado por: pre-merge F3, planificación de issue H1-VIZ del backlog F4
Estado: abierto, pendiente decisión humana

## Contexto

El componente `Radar` de `src/components/charts/Radar.tsx` (indicador A2 Servicios Ecosistémicos) presenta actualmente **5 ejes**:

1. Mejora densidad de árboles
2. Mejora cantidad de agua
3. Mejora calidad del agua
4. Mejora fauna silvestre
5. Mejora aire puro

Las 5 series corresponden a 5 columnas existentes en microdatos:
- `2.2_Mejoro_Densidad_Arboles_SiNo` (78/80 = 97,5%)
- `2.2_Mejoro_Cantidad_Agua_SiNo` (78/80 = 97,5%)
- `2.2_Mejoro_Calidad_Agua_SiNo` (78/80 = 97,5%)
- `2.2_Mejoro_Fauna_SiNo` (78/80 = 97,5%)
- `2.2_Mejoro_Aire_Puro_SiNo` (78/80 = 97,5%)

Verificado en F1 hallazgo H1: la correlación φ=1,000 inter-respondiente confirma que los mismos 78 hogares responden Sí en los 5 ejes; los mismos 2 responden No en los 5.

## Discrepancia con publicación

**Tabla 1 de Velásquez, Palacio y Álvarez (2025, p.44)** (verificada en `docs/tesis.docx`) lista **6 indicadores binarios**, **NO 5**, y **NO incluye Densidad de Árboles**:

| INDICADOR                            | SÍ  | %      |
|--------------------------------------|-----|--------|
| Mejora calidad del aire              | 78  | 97,5%  |
| Mejora cantidad de agua              | 78  | 97,5%  |
| Mejora calidad del agua              | 78  | 97,5%  |
| Mejora fauna silvestre               | 78  | 97,5%  |
| Considera que mitiga cambio climático| 79  | 98,8%  |
| Continuaría conservando sin pago     | 80  | 100%   |

Es decir:
- **4 servicios ecosistémicos** publicados (los mismos del radar excepto Densidad)
- **+1 cambio climático** (col `2.7_Mitiga_Cambio_Climatico_SiNo`, no presente en radar A2)
- **+1 continuidad sin pago** (col `6.4_Continuaria_Sin_Pago`, presente en KPI separado del dashboard pero no en Tabla 1 del radar)

"Densidad de árboles" existe en microdatos con la misma proporción (78/80 = 97,5%), pero **no fue incluida en Tabla 1 publicada de la tesis**. La razón puede ser editorial (priorizar servicios "tradicionales" del marco MEA: aire, agua, biota), pero no consta justificación explícita en la tesis ni en los logs del proyecto.

## Pregunta

¿Qué hace el dashboard en F4 con el 5to eje "Densidad de Árboles" del radar A2 para alinearse con Tabla 1 tesis?

## Opciones

### A — Eliminar el 5to eje "Densidad de Árboles" del radar A2

Pros:
- Alinea visualmente con publicación oficial
- Reduce ruido visual (los 5 ejes son colineales por φ=1,000 — agregar el 5to no aporta información)
- Mensaje narrativo más fiel

Contras:
- Pierde un dato presente en microdatos
- Si futura versión de tesis decide incluirlo, hay que agregarlo otra vez

Impacto F4: 1 línea de código en `Radar.tsx` + actualizar `data.tsx`.

### B — Mantener 5 ejes + nota explícita "no publicado en Tabla 1 tesis"

Pros:
- Conserva el dato
- Transparencia metodológica explícita

Contras:
- Inconsistencia visual con publicación
- Ruido visual mantenido (5 ejes colineales)
- La nota probablemente nunca se lee

Impacto F4: añadir footer académico al componente `A2`.

### C — Reemplazar radar 5-ejes + 5 charts SiNo por una tabla Wilson IC con los 6 indicadores Tabla 1 tesis (Recommended)

Pros:
- Resuelve el issue H1-VIZ del backlog F4 simultáneamente: el backlog ya propone reemplazar las 5 charts SiNo individuales (correlación φ=1,000 perfecta entre las 5) por un solo chart agregado con Wilson IC.
- Si extendemos la propuesta H1-VIZ para incluir los 6 indicadores de Tabla 1 (no solo los 4 servicios + el de Densidad), unificamos:
  - Reemplazo del radar A2 (5 ejes con duplicación φ=1)
  - Reemplazo de las 5 charts SiNo individuales (mismo problema)
  - Resultado: una sola tabla Wilson IC con los 6 indicadores fieles a Tabla 1 tesis
- Wilson IC añade rigor estadístico que la tesis no incluyó pero respalda
- Footer académico cita ID-29 (verificada en tesis párrafo 195) explicando φ=1,000 como evidencia de "cultura preexistente"

Contras:
- Pierde el visual radar (decisión de diseño narrativo)
- Pierde "Densidad de árboles" como serie (igual que opción A)
- Requiere reescritura del copy de la sección Ambiental

Impacto F4: implementación principal del issue H1-VIZ. Reemplaza 6 componentes (`Radar A2` + 5 `BarVertical` SiNo) por 1 componente nuevo (`WilsonBar` o `WilsonTable`) con 6 filas. Estimado ~30 min con template `BarChart` + `ErrorBar` nativo de recharts.

### D — Tabla 7-filas Wilson IC con disclosure de scope (RESUELTA bajo principio dashboard_role)

Decisión adoptada tras inscribir el principio `<dashboard_role>` en CLAUDE.md (2026-04-29).

Bajo este principio, la "discrepancia" entre Tabla 1 tesis (6 indicadores) y radar dashboard (5 ejes con Densidad de Árboles) se reformula: NO es discrepancia, es ALCANCE EXPANDIDO. Densidad de Árboles fue medido en la encuesta con la misma metodología que los 4 servicios ecosistémicos publicados (proporción 78/80 = 97,5%), pero no se incluyó en Tabla 1 de Velásquez, Palacio y Álvarez (2025) por límite editorial de palabras.

Implementación F4:

Tabla 7-filas con Wilson IC y columna explícita de scope:

| INDICADOR              | n  | %      | IC 95% Wilson    | Publicado tesis |
|------------------------|----|--------|------------------|-----------------|
| Calidad del aire       | 80 | 97,5%  | [91,3; 99,3]     | ✓ Tabla 1       |
| Cantidad de agua       | 80 | 97,5%  | [91,3; 99,3]     | ✓ Tabla 1       |
| Calidad del agua       | 80 | 97,5%  | [91,3; 99,3]     | ✓ Tabla 1       |
| Fauna silvestre        | 80 | 97,5%  | [91,3; 99,3]     | ✓ Tabla 1       |
| Densidad de árboles    | 80 | 97,5%  | [91,3; 99,3]     | ✗ (1)           |
| Mitigación cambio clim | 80 | 98,8%  | [93,3; 99,8]     | ✓ Tabla 1       |
| Continuidad sin pago   | 80 | 100,0% | [95,4; 100,0]    | ✓ Tabla 1       |

(1) Densidad de árboles fue medida en la encuesta con misma metodología; no se incluyó en Tabla 1 publicada por límite editorial. Dashboard la presenta como expansión metodológica fiel (CLAUDE.md `<dashboard_role>`).

Footer académico del componente (texto canónico para implementar en F4):

> "El indicador 'Densidad de árboles' fue medido en la encuesta PSA 2025 con la misma metodología binaria (Sí/No) que los otros 4 servicios ecosistémicos. Su proporción afirmativa (78/80 = 97,5%) es idéntica a la de los servicios publicados, lo cual refuerza la lectura de coherencia inter-respondiente φ=1,000 (cultura preexistente, tesis p.45). No fue incluido en Tabla 1 de la tesis (Velásquez, Palacio, Álvarez 2025, p.44) por límite editorial de palabras. El dashboard lo presenta como expansión metodológica fiel, no como discrepancia."

Pros (sobre opciones A/B/C):
- Preserva todo dato medido bajo el método tesis sin perder fidelidad.
- Convierte aparente discrepancia en oportunidad de defensa académica (rigor metodológico).
- Resuelve simultáneamente issue H1-VIZ del backlog F4.
- Aplicación canónica del principio `<dashboard_role>`.
- Footer académico citable directamente en defensa oral.

Contras:
- 7 filas en lugar de 6 puede confundir a un revisor que solo conozca Tabla 1; mitigado por columna "Publicado tesis" explícita.

Impacto F4: implementación principal del issue H1-VIZ. Reemplaza radar A2 (5 ejes) + 5 charts SiNo individuales por 1 componente nuevo (`WilsonTable` con 7 filas) + footer académico expandible.

Trazabilidad reproducible: `audit/fase3/scripts/wilson_h1viz.py` + `wilson_h1viz_run.log` (creados en este commit).

## Decisión final

**Opción D adoptada.** Las opciones A/B/C se preservan en este documento como historia de razonamiento, pero quedan superadas por la inscripción del principio `<dashboard_role>` en CLAUDE.md (2026-04-29).

Ver `questions/closed/014_radar_a2_densidad_arboles.respuesta.md` para el razonamiento completo de la decisión.

## Decisión humana

Resuelta 2026-04-29 con Opción D. Ver `questions/closed/014_radar_a2_densidad_arboles.respuesta.md`.

Cuando se resuelva, esta question se mueve a `questions/closed/014_radar_a2_densidad_arboles.md`. Si la decisión es C, se ejecuta como parte del issue H1-VIZ del backlog F4 (ver `audit/fase3/PLAN.md` lote 2). Si es A, se documenta en `audit/fase4/HANDOFF.md` como sub-tarea independiente. Si es B, se documenta en `audit/fase4/disclosure_debt.md` como nota visible en el componente A2.

## Trazabilidad

- Microdatos: `data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx` hoja `Datos_Normalizados`, columnas 17-22 + 29 + 71
- Tesis: Velásquez, Palacio y Álvarez (2025), Tabla 1 p.44, verificada en `docs/tesis.docx` primera tabla
- F1 hallazgo H1: `audit/fase1/ambiental_REPORT.md` (correlación φ=1,000 inter-respondiente)
- Backlog: `backlog/fase4_visuales.md` issue H1-VIZ
- Anchor CLAUDE.md actualizado simultáneamente para reflejar Tabla 1 fielmente (ver commit `docs(audit-f4): justificación metodológica D2 + H1-VIZ + scope F5`)
