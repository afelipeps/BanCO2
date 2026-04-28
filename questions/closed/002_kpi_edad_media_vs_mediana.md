# 002 — KPI Edad Promedio: media vs mediana (P4)

**Estado:** **resuelta tentativa — Opción A con ajuste narrativo** (Andrés, 2026-04-18). **PENDIENTE**: validación contra `docs/tesis.docx` antes de ejecutar Fase 4 (ver sección "Pendiente antes de Fase 4" al final). · **Contexto:** auditoría Fase 1 piloto Población · **Afecta:** indicador P4 en `data.tsx:169-181` + narrativa protegida "Estancamiento Demográfico".

## Contexto

El indicador **P4 "Edad Promedio"** está implementado como `kpi_card` con valor único:

```ts
kpiValue: "57.8",
kpiUnit: "Años",
```

El `visual_rules` del `CLAUDE.md` exige, para continuas asimétricas como edad o ingreso:

> Continua asimétrica (ingresos, edad): boxplot + histograma. Nunca media en KPI card.

El `statistical_rules` agrega:

> Mediana por defecto si asimetría, outliers u ordinal. Media solo con desv. estándar.
> Toda tendencia central acompañada de IQR o desv. estándar.

La viz actual **viola dos reglas simultáneamente**: KPI card + media sin sd. Y el valor reportado (57,8) es media — la mediana contra microdatos es **60** (ancla del `CLAUDE.md`).

Esto afecta una **narrativa protegida** del `CLAUDE.md` bloque `<narratives>`:

> Estancamiento Demográfico — edad media 57,8; >75 años triplica a <30.

La narrativa nombra literalmente la *media*. Cambiar a mediana requiere coordinación narrativa.

## Pregunta

¿Qué opción adoptar para Fase 3?

## Opciones

### A — Reemplazar KPI por mediana + IQR (recomendada)

KPI muestra `60 años` con tooltip/subtítulo `IQR [Q1 Q3] · IC95 bootstrap [low, high]`. Narrativa se ajusta a "mediana 60 años, IQR Xk años" manteniendo el punto de "estancamiento demográfico".

**Pros:** cumple ambas reglas; estadístico correcto para distribución asimétrica; la narrativa sobrevive con mediana (quizá aún más potente: "la mitad de la población tiene ≥60 años").
**Contras:** el `<anchors>` cita explícitamente "media 57,81"; reescribir narrativa sin perder resonancia requiere trabajo. La tesis (docs/tesis.docx, no consultada aún) podría reportar la media como cifra central.

### B — Agregar boxplot complementario, conservar KPI de media

Duplicar: KPI card con media 57,8 (reportando sd) + boxplot adyacente con mediana/IQR/outliers.

**Pros:** preserva literalidad del ancla en KPI.
**Contras:** viola "Nunca media en KPI card" — la regla es negativa y explícita; el duplicado no sana, sólo compensa.

### C — Deprecar el KPI, mover a viz distribucional única

Eliminar el KPI card. Reemplazar con boxplot + histograma como componente principal de la narrativa etaria.

**Pros:** cumple regla al 100%.
**Contras:** pérdida de densidad informativa "de un vistazo"; el dashboard tiene formato KPI como patrón dominante.

## Recomendación tentativa

**Opción A.** La regla `<visual_rules>` es negativa y explícita ("nunca media en KPI card"); la media en el KPI no es literalmente incorrecta pero sí metodológicamente inferior para n=80 con skew etario. La narrativa protegida habla de "envejecimiento"; el punto narrativo se conserva o mejora con mediana 60. Conviene reescribir el párrafo de "Estancamiento Demográfico" para usar mediana como cifra principal y referir la media en el texto, no en el KPI.

## Decisión (Andrés, 2026-04-18)

**Opción A con ajuste narrativo explícito.** Implementación:

- **KPI principal**: mediana `60 años` · subtítulo `IQR [46, 67] · IC95 bootstrap [55, 63]`.
- **Texto narrativo del indicador P4**: mencionar la media 57,8 como **información complementaria que refleja la presencia de una cola joven** en la distribución. La diferencia entre media (57,8) y mediana (60) son 2,2 años — interpretable como "hay suficientes beneficiarios jóvenes como para tirar la media hacia abajo, aunque la masa está concentrada en 46-75". Esto preserva literalidad del número del ancla sin violar `visual_rules`.

## Pendiente antes de Fase 4

**Validar contra `docs/tesis.docx`** que la narrativa "Estancamiento Demográfico" no depende metodológicamente de que la cifra central sea media. Si la tesis justifica específicamente el uso de media (p. ej. citando literatura actuarial sobre "edad media del relevo generacional" como indicador estándar), **reabrir esta question** antes de ejecutar Fase 4. Si la tesis sólo cita la media descriptivamente, Opción A queda firme.

La verificación la hará el humano (o el auditor de la sección que audite la tesis, si se planifica uno).

## Ejecución del piloto

El script calculó **ambos** (mediana + IQR + IC95 bootstrap, y media + sd) y los reporta en dos filas separadas del `Resumen`. Esto preserva opcionalidad sin bloquear el piloto; la decisión se aplica en Fase 4 (migración visual), no en Fase 3 (decisión de stack).
