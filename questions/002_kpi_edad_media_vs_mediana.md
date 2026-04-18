# 002 — KPI Edad Promedio: media vs mediana (P4)

**Estado:** abierta · **Contexto:** auditoría Fase 1 piloto Población · **Afecta:** indicador P4 en `data.tsx:169-181` + narrativa protegida "Estancamiento Demográfico".

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

## Ejecución del piloto

El script calcula **ambos** (mediana + IQR + IC95 bootstrap, y media + sd) y los reporta en dos filas separadas del `Resumen`. Así no se bloquea el piloto; la decisión A/B/C se aplica en Fase 3.

Si `waiting_human_review` y no hay respuesta en 1 día → continuar con A como tentativa en el report.
