# Handoff F5 — Placeholder (preliminar)

Este archivo es **preliminar**. F5 arranca en sesión fresca tras cierre F4. Los items aquí listados son inputs identificados durante F3 y la inspección visual del coautor humano (2026-04-29). Revisión completa al arrancar F5.

## Items diferidos formalmente desde F3 (NO INCLUIR EN F4)

Cuatro items con potencial valor académico que exceden scope F4:

### F5-01: Boxplot paralelo PSA mensualizado H/M (n=134)

Refuerzo del argumento "dualidad distributiva" (Velásquez, Palacio y Álvarez 2025, p.50-51). Visualizaría que en el circuito institucional PSA la dirección de la brecha se invierte respecto al mercado: mediana M $277.312 > H $215.688 (anchor CLAUDE.md, fórmula PSA mensualizado canónica cerrada en F1).

Originalmente propuesto en el plan de defensa F3 como "OPCIONAL F4"; movido formalmente a F5 porque excede los 10 issues del backlog F4. En F4, el footer académico de D2 menciona el dato sin gráfico — F5 lo materializa.

Requiere desarrollo de componente visual nuevo + integración con sección Económica o Sostenibilidad. Estimado ~2 h.

### F5-02: Visual jefatura femenina × tiempo de cuidado liberado

Refuerzo del Plan de Acción R2 (Economía del Cuidado) declarado en tesis. Cruza variables P5 (jefatura) con S8 (tiempo liberado por estufas eficientes). Componente nuevo.

Justificación: la brecha 8,5:1 documentada en E4 (mercado) co-existe con el rol de cuidado no remunerado que liberan las estufas eficientes. Visualizar esta interacción refuerza el argumento de política pública "el PSA hace su parte; el mercado y la economía del cuidado son los espacios de intervención".

Estimado ~2-3 h.

### F5-03: Reformulación visual de "8,5:1" como argumento de política

Convertir la cifra de "hallazgo descriptivo" a "argumento de policy" mostrando explícitamente la dualidad mercado-vs-PSA en panel pareado:

- Panel izquierdo: boxplot E4 mercado (8,5:1 desfavorable a M)
- Panel derecho: boxplot PSA mensualizado (1:1,28 favorable a M)
- Caption unificada: "el PSA es progresivo; el mercado es el espacio de la brecha"

Requiere rediseño narrativo del indicador E4 + componente pareado nuevo. Depende de F5-01.

Estimado ~2 h adicionales sobre F5-01.

### F5-04: Visualizaciones SROI con metodología actualizada

Si el SROI se actualiza con datos 2024-2025 (extensión temporal post-tesis), las visualizaciones asociadas (SR1, SR2, SR3, SR5) requieren rework. Fuera de scope F4 (que solo toca etiquetas N1/N2/N3 de SR2).

Requiere coordinación con coautores tesis sobre alcance de la actualización. Decisión humana al arrancar F5.

## Inputs documentales para F5

- [`audit/fase4/HANDOFF.md`](../fase4/HANDOFF.md) sección "Justificación metodológica de cifras tesis"
- [`questions/014_radar_a2_densidad_arboles.md`](../../questions/014_radar_a2_densidad_arboles.md) (resolución determina implementación final H1-VIZ en F4)
- [`audit/fase3/scripts/defense_d2.py`](../fase3/scripts/defense_d2.py) + [`run.log`](../fase3/scripts/defense_d2_run.log)
- Eventual cierre F4 (`audit/fase4/CLOSEOUT.md`, `audit/fase4/MERGE_REPORT.md`)

## Indicadores con justificación pendiente que requieren atención F5

Heredados del scope acotado F4 (HANDOFF F4 sección "Otros indicadores con justificación pendiente"):

- **SROI 2,22:1** (anchored): defensa metodológica completa de proxies Apéndice 1 tesis
- **Continuidad 100% (n=80)**: validar que el dashboard muestra Wilson IC [95,4%; 100%] y no cifra absoluta
- **Brecha jefatura hogar mujeres 78,79% (n=33)**: agregar IC explícito en próximo touch del componente
- **Distribución PSA por cohorte y por género**: complementario a F5-01

## Decisión humana al arrancar F5

Revisar este placeholder, ajustar items según prioridad, escribir HANDOFF F5 final. Este archivo placeholder se **ELIMINA** al crearse el HANDOFF F5 definitivo (queda en git history).

## Anti-objetivos

- NO arrancar F5 hasta que F4 cierre con tag `v0.4.0`
- NO modificar este placeholder durante F4 (excepto si una decisión F4 invalida un ítem aquí — en cuyo caso, comentar en lugar de eliminar)
