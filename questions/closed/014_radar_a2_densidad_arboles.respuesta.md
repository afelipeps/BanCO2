# 014.respuesta — Radar A2 Servicios Ecosistémicos: 5to eje "Densidad de Árboles"

Fecha resolución: 2026-04-29
Decisor: Andrés Felipe Palacio Santamaría (coautor humano, tesista EAFIT)
Disparador: revisión pre-merge F3 + inscripción principio `<dashboard_role>` en CLAUDE.md

## Decisión

**Opción D — Tabla 7-filas Wilson IC con disclosure de scope.**

(NO eliminar Densidad de Árboles del dashboard; NO mantener radar 5-ejes; NO disclosure mínimo en radar 5-ejes; NO tabla 6-filas estricta.)

## Razonamiento

La pregunta original asumía que la presencia de "Densidad de Árboles" en dashboard pero no en Tabla 1 tesis era una **discrepancia a resolver**. Bajo el principio `<dashboard_role>` recién inscrito en CLAUDE.md, la lectura cambia: el dashboard es la presentación completa de los hallazgos cuya forma corta y citable es la tesis. La tesis tuvo límite editorial de palabras; Densidad de Árboles fue medido con la misma metodología binaria (Sí/No) que los 4 servicios publicados, con resultado idéntico (78/80 = 97,5%). No es discrepancia: es información que cupo en encuesta pero no en publicación.

Mostrarla en dashboard con disclosure metodológico explícito ("medido bajo misma metodología; no incluido en publicación por límite editorial") es la aplicación canónica del principio `<dashboard_role>`. Eliminarla por fidelidad estricta con tesis publicada (opción A) sería contradecir el rol del dashboard como herramienta de soporte, validación y defensa de la tesis.

## Acciones derivadas (ejecutadas en este commit)

1. `audit/fase4/HANDOFF.md` sección H1-VIZ: tabla pasa de 6 filas a 7 filas con columna "Publicado tesis".
2. `audit/fase3/scripts/wilson_h1viz.py` (nuevo): script reproducible que calcula Wilson IC para los 7 indicadores y verifica paridad con HANDOFF.
3. `audit/fase3/scripts/wilson_h1viz_run.log` (nuevo): log committeable con header de trazabilidad.
4. CLAUDE.md anchor ambiental: se mantiene en 6 indicadores (anchor refleja Tabla 1 tesis canónica). El 7mo indicador del dashboard NO es anchor; es expansión documentada.

## Trazabilidad

- Question original: `questions/closed/014_radar_a2_densidad_arboles.md` (opciones A/B/C/D inscritas, esta question tras `git mv` desde raíz)
- Principio rector: CLAUDE.md `<dashboard_role>`
- Implementación: HANDOFF F4 sección H1-VIZ
- Reproducibilidad: `audit/fase3/scripts/wilson_h1viz.py` + log
