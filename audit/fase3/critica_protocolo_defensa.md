# Crítica + plan revisado — Protocolo defensa académica D2 + H1-VIZ

Fecha: 2026-04-29
Branch: `refactor/v3`
Insumo: propuesta humana de "PROTOCOLO DEFENSA TESIS pre-merge F3"
Estado: **NO commiteado, NO push.** Esperando confirmación humana para inscribir.

## Verificación empírica previa al criticismo

Antes de evaluar conceptualmente, reproduje empíricamente cada cifra del plan original sobre `data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx` (script ad-hoc, seed=42):

| Métrica | Plan declara | Reproducido | OK |
|---|---|---|---|
| n_H / n_M | 18 / 6 | 18 / 6 | ✓ |
| Mediana H | $850.000 | $850.000 | ✓ |
| Mediana M | $100.000 | $100.000 | ✓ |
| Ratio mediana | 8.5:1 | 8.50:1 | ✓ |
| Mann-Whitney U / p | 93.5 / 0.008 | 93.5 / 0.00786 | ✓ |
| Bootstrap IC95 ratio (n=10000) | [1.50; 16.67] | [1.50; 16.67] | ✓ |
| Hodges-Lehmann | $700.000 | $700.000 | ✓ |
| Mediana H sin outliers IQR | $300.000 (n=15) | $300.000 (n=15) | ✓ |
| Ratio sin outliers | 3.0:1 | 3.00:1 | ✓ |
| Outlier máximo | $23.990.000 | $23.990.000 | ✓ |
| Ratio media (caveat) | 26.9:1 | 26.91:1 | ✓ |
| Cita ID-29 textual | "Siempre he tenido…" | Verificada en tesis párrafo 195 | ✓ |
| Tabla 1 tesis filas | 6 indicadores | 6 confirmados (4 servicios + clima + continuidad) | ✓ |

**Veredicto verificación: 13/13 PASS.** Las cifras del plan original son sólidas. Mi escepticismo inicial sobre trazabilidad fue equivocado en cuanto a la corrección — pero queda válido el punto de **trazabilidad reproducible** (ver sección 2).

## 1. Aciertos del plan original (conservar)

| # | Acierto | Comentario |
|---|---|---|
| A1 | Identifica D2 (8.5:1) y H1-VIZ como riesgos narrativos | Correcto: son los 2 indicadores con mayor tensión narrativa que F4 va a tocar directamente |
| A2 | 4 capas de defensa para 8.5:1 (mediana robusta + Mann-Whitney + Bootstrap + sensitivity) | Correcto y pedagógicamente bien estructurado |
| A3 | Argumento de dualidad distributiva (PSA inverso M>H, n=134) | Es el argumento más fuerte: convierte E4 de "hallazgo aislado" en "argumento de política pública". Refuerza tesis p.50-51 |
| A4 | Reinterpretación de φ=1.000 como evidencia (no artefacto) | Coincide con tesis p.45 ("validó cultura preexistente"). Sólido |
| A5 | Cita textual ID-29 disponible en footer | Verificada en docs/tesis.docx párrafo 195 |
| A6 | Reconoce que microdatos > tesis para cálculos pero tesis > código para narrativa publicada | Coherente con CLAUDE.md `<sources>` jerarquía |
| A7 | "NO modificar tesis ni microdatos. Escalar vía questions/NNN" | Coherente con `<handoff_protocol>` |
| A8 | Bloqueante para F4 (no implementar D2 / H1-VIZ sin protocolo) | Disciplina de scope correcta |

## 2. Críticas concretas

### 2.1 Trazabilidad reproducible: cifras inscritas sin script

El plan inscribe Mann-Whitney U=93.5, p=0.008, Bootstrap IC [1.50; 16.67], Hodges-Lehmann $700.000, sensitivity n=15 ratio 3:1 — sin apuntar a un script reproducible en el repo.

**En defensa académica oral**, si un evaluador pregunta *"¿cómo calculó el IC bootstrap?"* y la única referencia es "está en HANDOFF F4", se pierde rigor. Lo que hace falta:

`audit/fase3/scripts/defense_d2.py` committeado, con:
- Lectura del xlsx
- Filtros idénticos a fixture (`ingreso > 0`, sex no nulo)
- Las 7 estadísticas del plan
- `seed=42` fijo
- stdout reproducible

El plan corregido AÑADE este script como artefacto. Sin él, la "defensa" es un recital sin pista de auditoría.

**Acción**: crear `audit/fase3/scripts/defense_d2.py` (~80 LOC) y `audit/fase3/scripts/defense_d2.run.log` con la salida.

### 2.2 Error descriptivo en H1-VIZ: "4 indicadores ambientales"

El plan dice: *"Tesis Tabla 1 lista 4 indicadores ambientales (sin Densidad de Árboles)"*.

**Tabla 1 verificada en docs/tesis.docx**: lista **6 indicadores** (no 4):
1. Mejora calidad del aire (97.5%)
2. Mejora cantidad de agua (97.5%)
3. Mejora calidad del agua (97.5%)
4. Mejora fauna silvestre (97.5%)
5. Mitigación cambio climático (98.8%)
6. Continuidad sin pago (100%)

**El error es de descripción**, no de tabla — la tabla propuesta en el plan ya tiene 6 filas correctas. Pero el texto narrativo es engañoso: hay que decir "4 servicios ecosistémicos percibidos" + "1 mitigación climática" + "1 continuidad", no "4 indicadores ambientales".

Densidad de árboles NO aparece en Tabla 1 tesis (verificado). El argumento de eliminar el 5to eje del radar A2 ES correcto — solo el framing descriptivo necesita corrección.

### 2.3 Eliminar 5to eje radar A2: requiere `questions/NNN_radar_a2.md` antes de bloquear F4

CLAUDE.md `<handoff_protocol>` exige escribir `questions/NNN.md` cuando hay *"Propuesta de deprecar indicador destacado en tesis"*. Eliminar "Densidad de árboles" del radar A2 cae en esta categoría — aunque la decisión final probablemente sea la misma (alinear con publicación oficial), el respeto del protocolo importa.

**Propuesta**: crear `questions/014_radar_a2_densidad_arboles.md` con:
- Contexto: dashboard 5 ejes vs Tabla 1 tesis 6 indicadores (4 servicios + clima + continuidad)
- Datos: `2.2_Mejoro_Densidad_Arboles_SiNo` existe en microdatos (78/80 = 97.5%)
- Opciones:
  - **A**: Eliminar 5to eje (alinear visualmente con publicación)
  - **B**: Mantener 5 ejes + nota "no publicado en Tabla 1"
  - **C**: Reemplazar radar por tabla 6-filas (formato exacto tesis Tabla 1) — esta es de hecho la propuesta H1-VIZ del backlog, en cuyo caso se resuelve por unificación
- Recomendación: **C** (tabla Wilson IC con 6 indicadores, idéntica a Tabla 1 + IC añadido). Reemplaza tanto el radar 5-eje como las 5 charts SiNo individuales (issue H1-VIZ del backlog).

**Acción**: crear `questions/014_radar_a2_densidad_arboles.md` con esta estructura. Resolución pendiente decisión humana (Andrés). HANDOFF F4 lo referencia, no lo predetermina.

### 2.4 Naming "PROTOCOLO DEFENSA": tono defensivo

"Defensa" tiene connotación de "estamos a la defensiva". Mejor framing académico:

- "Argumentación estadística reforzada"
- "Justificación metodológica para indicadores con interpretación crítica"

**Propuesta**: renombrar la sección a *"Justificación metodológica para D2 (E4 brecha género) y H1-VIZ (Tabla 1 ambiental)"*. La función es la misma; el tono es proactivo en lugar de defensivo.

### 2.5 Scope limitado: ¿solo D2 y H1-VIZ?

El plan acota a 2 indicadores. Otros candidatos con riesgo narrativo similar:

| Indicador | Riesgo | F4 toca? |
|---|---|---|
| SROI 2.22:1 (anchored) | Si revisor pregunta cálculo proxies, hay que poder defender cada fila Apéndice 1 | Sí — N1, N2, N3 son issues SROI |
| "Continuaría sin pago 100%" (n=80) | 100% perfecto es estadísticamente sospechoso. Wilson IC [95.4%, 100%] muestra intervalo, no certeza absoluta | No directamente F4 |
| Brecha jefatura hogar mujeres 78.79% (n=33) | n pequeño, IC ancho | No F4 |
| PSA mediana M > H ($277k vs $216k) | Argumento clave de dualidad — debe defenderse junto con D2 | Indirectamente sí (refuerza E4) |

**Propuesta**: ampliar el scope a 3 indicadores: D2 + H1-VIZ + N1-N3 SROI (porque F4 los toca explícitamente). El argumento defense del SROI es distinto (es valuación, no comparación de medianas) — requiere su propia capa.

Si Andrés prefiere mantener scope acotado a D2+H1-VIZ por presupuesto de tiempo, declarar explícitamente: *"Otros indicadores (SROI, jefatura, continuidad) requieren justificación similar; quedan para F5 a menos que F4 los toque."*

### 2.6 Sub-propuesta "boxplot paralelo PSA" en F4

El plan original marca como "OPCIONAL: boxplot paralelo del PSA mensualizado H/M (n=134) mostrando inversión de dirección".

**Crítica**: esto excede el backlog F4 actual. F4 cierra con 10 issues; agregar este chart es 11°. Mejor framing:

- Documentar como **propuesta F5** (no F4 OPCIONAL)
- En F4, el footer académico de D2 puede mencionar el dato sin gráfico ("La mediana mensualizada PSA muestra dirección inversa: M $277k > H $216k, n=134, ver sección Sostenibilidad")

**Acción**: mover "boxplot paralelo PSA" a un futuro `audit/fase5/HANDOFF.md` (o backlog F5).

### 2.7 CLAUDE.md anchor edit: "97.5% en todos los ejes"

El plan propone clarificar a *"97.5% en cada uno de los 4 indicadores ambientales (Tabla 1 tesis), φ=1.000 correlación inter-indicador"*.

**Imprecisión**: los 4 servicios ecosistémicos comparten 97.5%, pero los 6 de Tabla 1 NO todos están a 97.5%:
- 4 servicios: 97.5% (78/80)
- Cambio climático: 98.8% (79/80)
- Continuidad sin pago: 100% (80/80)

**Corrección propuesta** (más fiel a Tabla 1):
> Mejora ambiental percibida 97.5% en cada uno de los 4 servicios ecosistémicos (aire, agua cantidad, agua calidad, fauna; Tabla 1 tesis filas 1-4); 98.8% mitigación cambio climático; 100% continuidad sin pago. φ=1.000 correlación inter-indicador entre los 4 servicios (los mismos 78 hogares respondieron afirmativo en los 4).

### 2.8 Cita ID-29: incluir página + atribución correcta

El plan dice "(Encuesta PSA 2025, ID-29, tesis p.45)". La cita real en tesis (párrafo 195) dice: *"(Encuesta PSA 2025, ID-29)"* — sin página declarada. Si Andrés conoce la página, agregarla; si no, omitir el "p.45" para no inventar.

**Corrección**: usar la atribución exacta tal como aparece en tesis: *"(Encuesta PSA 2025, ID-29)"*.

## 3. Plan revisado — listo para inscribir tras confirmación

A continuación, el contenido propuesto para inscribir en `audit/fase4/HANDOFF.md` (sección a agregar antes de "Co-autoría"). Refleja todas las correcciones de la sección 2.

---

### >>> CONTENIDO PROPUESTO PARA `audit/fase4/HANDOFF.md` <<<

```markdown
## Justificación metodológica — D2 (E4 brecha género) y H1-VIZ (Tabla 1 ambiental)

Bloqueante para F4: antes de tocar D2 (boxplot E4) o H1-VIZ (Ambiental
Tabla 1), revisar este protocolo + ejecutar `audit/fase3/scripts/defense_d2.py`
para reproducir cifras estadísticas. Si en F4 microdatos contradicen
tesis: NO modificar ninguno; escalar vía `questions/NNN_tesis_microdatos.md`.

### D2 — Brecha de género 8.5:1

CIFRA PRINCIPAL (sostenida por tesis p.50, ancla CLAUDE.md):
- Ratio mediana H/M = 8.5:1, n=24 hogares con ingreso productivo
- Mediana hombres: $850.000 COP/mes (n=18)
- Mediana mujeres: $100.000 COP/mes (n=6)
- Outlier máximo masculino: $23.990.000 (mencionado tesis p.50, ID 40)
- Outlier máximo femenino: $300.000

ARGUMENTACIÓN ESTADÍSTICA (4 capas, reproducibles vía
`audit/fase3/scripts/defense_d2.py` con seed=42):

1. **Mediana es estimador robusto a outliers por construcción.** Con
   n=18 hombres, la mediana es el promedio de las posiciones 9-10
   ordenadas; los 3 outliers (posiciones 16-18) NO afectan ese
   cálculo. La media SÍ se infla con outliers (Ratio media H/M =
   26.9:1). `<statistical_rules>` CLAUDE.md exige mediana sobre
   media en distribuciones asimétricas — la elección 8.5:1 está
   alineada con el protocolo del proyecto.

2. **Tres pruebas no paramétricas validan brecha real (independiente
   de outliers):**
   - Mann-Whitney U = 93.5; p = 0.008 (significativa α=0.01)
   - Bootstrap n=10.000 réplicas, IC 95% del ratio mediana = [1.50; 16.67].
     IC NO incluye 1 ⇒ brecha estadísticamente real
   - Hodges-Lehmann (mediana de las 108 diferencias H_i - M_j) = $700.000

3. **Sensitivity sin outliers IQR-fence H** (n=15, removidos
   $11.67M / $13.73M / $23.99M): mediana H cae a $300.000, ratio
   3.0:1. La PERMANENCIA de la brecha bajo distintas
   especificaciones confirma robustez del hallazgo. La magnitud
   cambia (esperable con n menor); la dirección persiste.

4. **Dualidad distributiva** (refuerzo argumento tesis p.50-51): en
   el circuito institucional PSA (n=134 Familia Campesina), la
   dirección se INVIERTE — mediana M $277.312 > mediana H $215.688
   (anchor CLAUDE.md). Esto demuestra que la desigualdad NO está en
   el esquema PSA (que es progresivo con mujeres), sino en el
   mercado de ingresos productivos. Convierte E4 de "hallazgo de
   brecha" a argumento de política pública: el PSA hace su parte;
   la brecha residual proviene del mercado, no del instrumento.
   Justifica el plan de acción R2 (Economía del Cuidado y Cierre
   de Brechas) declarado en tesis.

VISUALIZACIÓN F4:
- Boxplot doble H/M con scatter overlay de datos crudos (template
  `benchmarks/viz/src/pages/recharts/Boxplot.tsx`)
- Outliers IQR-fence etiquetados con valor exacto (LabelList por
  punto fuera de fences) — caveat documentado en F3 sobre que
  recharts no etiqueta outliers automáticamente
- KPI principal: "Brecha 8.5:1" con n=24 visible
- Footer académico expandible con los 4 argumentos en lenguaje
  accesible + nota a `audit/fase3/scripts/defense_d2.run.log`
- Mención breve a dualidad PSA (sin gráfico adicional en F4 — el
  boxplot paralelo PSA queda para F5)

ANTI-PATRÓN: presentar 8.5:1 sin los 4 argumentos. Sin contexto
estadístico, un revisor académico puede leer el ratio como "inflado
por outliers" — los 4 argumentos blindan contra esa crítica.

ID Encuesta del outlier $23.99M: ID=40 (M, PECUARIO). NO eliminar.

### H1-VIZ — Ambiental Tabla 1

CIFRA PRINCIPAL (Tabla 1 tesis p.44, 6 indicadores binarios):

| INDICADOR                            | SÍ  | %      |
|--------------------------------------|-----|--------|
| Mejora percibida en calidad del aire | 78  | 97.5%  |
| Mejora percibida en cantidad de agua | 78  | 97.5%  |
| Mejora percibida en calidad del agua | 78  | 97.5%  |
| Mejora percibida en fauna silvestre  | 78  | 97.5%  |
| Considera que mitiga cambio climático| 79  | 98.8%  |
| Continuaría conservando sin pago     | 80  | 100%   |

DISCREPANCIA dashboard vs tesis (PENDIENTE en `questions/014`):
- Dashboard radar A2 actual: 5 ejes (los 4 servicios + Densidad de Árboles)
- Tesis Tabla 1: 6 indicadores (los 4 servicios + cambio climático + continuidad)
- Densidad de árboles existe en microdatos (`2.2_Mejoro_Densidad_Arboles_SiNo`,
  78/80 = 97.5%) pero NO fue publicada en Tabla 1

ESTRATEGIA F4 (sujeta a resolución de `questions/014`):
La propuesta del backlog H1-VIZ (issue del backlog F4) RESUELVE la
discrepancia naturalmente: reemplazar radar 5-ejes + 5 charts SiNo
por una sola tabla Wilson IC alineada con Tabla 1 (6 filas):

| INDICADOR              | n  | %      | IC 95% Wilson    |
|------------------------|----|--------|------------------|
| Calidad del aire       | 80 | 97.5%  | [91.4; 99.3]     |
| Cantidad de agua       | 80 | 97.5%  | [91.4; 99.3]     |
| Calidad del agua       | 80 | 97.5%  | [91.4; 99.3]     |
| Fauna silvestre        | 80 | 97.5%  | [91.4; 99.3]     |
| Mitigación cambio clim | 80 | 98.8%  | [93.2; 99.8]     |
| Continuidad sin pago   | 80 | 100.0% | [95.4; 100.0]    |

Wilson IC 95% agrega rigor estadístico (no incluido en tesis pero
respaldado).

INTERPRETACIÓN ACADÉMICA (refuerzo argumento tesis p.45):
La correlación φ=1.000 perfecta entre los 4 servicios ecosistémicos
(F1 hallazgo H1) NO contradice la tesis — la VALIDA. Los mismos 78
hogares respondieron "Sí" en los 4 servicios; los mismos 2
respondieron "No" en los 4. Esto es la evidencia matemática del
argumento tesis: "el esquema validó una cultura preexistente". Los
hogares con cultura ambiental preexistente responden afirmativamente
en todos los servicios percibidos. Es coherencia inter-indicador,
no artefacto metodológico.

CITA TESIS DISPONIBLE PARA FOOTER (verificada en docs/tesis.docx
párrafo 195):

> "Siempre he tenido buenas prácticas de cuidado y conservación,
> pero estando en el programa soy más comprometida. [Incluso si no
> pagaran], sigo cuidando el bosque" — Encuesta PSA 2025, ID-29

Implementación recharts: BarChart horizontal con ErrorBar (nativo).
Estimado ~30 min. Reescribir copy de sección Ambiental para reflejar
índice unidimensional (4 servicios con coherencia perfecta inter-respondiente).

### Otros indicadores con justificación pendiente (queueados a F5)

- **SROI 2.22:1**: F4 toca N1-N3 (cambios narrativos a etiquetas
  attribution/deadweight/displacement). La justificación
  metodológica de los proxies del Apéndice 1 tesis se pospone a F5
  si tiempo lo permite, o quedará en defensa oral.
- **Continuidad 100% (n=80)**: 100% perfecto requiere disclosure de
  Wilson IC [95.4%, 100%] para no presentar certeza absoluta como
  hecho — H1-VIZ tabla ya lo cubre.
- **Brecha jefatura hogar mujeres 78.79% (n=33)**: n pequeño
  requiere IC explícito en próximo touch.

### Scripts de reproducibilidad

`audit/fase3/scripts/defense_d2.py` — script único que reproduce los
4 argumentos de D2 (mediana, Mann-Whitney, Bootstrap IC, Hodges-Lehmann,
sensitivity). Salida en `audit/fase3/scripts/defense_d2.run.log`. Re-ejecutar
en F4 para confirmar que las cifras se mantienen sobre microdatos
actuales.
```

### >>> FIN CONTENIDO PROPUESTO <<<

---

## 4. Cambios a CLAUDE.md (versión corregida del paso 2 del plan original)

Reemplazar la línea actual del anchor:

> Mejora ambiental percibida: 97,5% en todos los ejes

Por (más fiel a Tabla 1 tesis):

> Mejora ambiental percibida: 97,5% en cada uno de los 4 servicios ecosistémicos (aire, agua cantidad, agua calidad, fauna; Tabla 1 tesis filas 1-4); 98,8% mitigación cambio climático; 100% continuidad sin pago. φ=1,000 correlación inter-indicador entre los 4 servicios.

Las otras anclas mencionadas por el plan original (8.5:1 brecha, $23.990.000 outlier) ya son fieles — sin edición.

## 5. Acciones bloqueantes propuestas

Para inscribir el plan revisado, ejecutar en orden:

1. **Crear `audit/fase3/scripts/defense_d2.py`** + correr + guardar `defense_d2.run.log`. Esto cierra la crítica 2.1.
2. **Crear `questions/014_radar_a2_densidad_arboles.md`** con las 3 opciones (A, B, C) y recomendación C. Esto respeta `<handoff_protocol>`.
3. **Editar `audit/fase4/HANDOFF.md`**: insertar sección "Justificación metodológica" antes de "Co-autoría", con el contenido de la sección 3 de este documento.
4. **Editar `CLAUDE.md` anchor ambiental** según sección 4.
5. **Commit + push**, mensaje:

```
docs(audit-f4): justificación metodológica D2 + H1-VIZ + script reproducible

Defensa académica reforzada para 2 cifras tesis con riesgo de
tensión narrativa en F4:

D2 brecha 8.5:1:
- 4 capas de argumentación estadística (mediana robusta, Mann-Whitney,
  Bootstrap IC, sensitivity, Hodges-Lehmann)
- Script reproducible audit/fase3/scripts/defense_d2.py
- Dualidad distributiva (PSA inverso M>H, n=134) como refuerzo

H1-VIZ Ambiental:
- Alinear dashboard con Tabla 1 tesis (6 indicadores, no 5 ejes)
- φ=1.000 reinterpretado como evidencia (no artefacto)
- Cita ID-29 verificada en docs/tesis.docx párrafo 195

Discrepancia radar A2 (5 ejes vs 6 indicadores Tabla 1) escalada
vía questions/014_radar_a2_densidad_arboles.md.

CLAUDE.md anchor ambiental refinado a Tabla 1 fiel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

6. **NO mergear PR #2 ni taggear v0.3.0** hasta que Andrés valide HANDOFF F4 + CLAUDE.md edits + script defense_d2 + questions/014.

## 6. Resumen ejecutivo (10 líneas)

1. Las cifras estadísticas del plan original (Mann-Whitney, Bootstrap, Hodges-Lehmann, sensitivity) son TODAS correctas — verificadas empíricamente sobre microdatos.
2. La cita ID-29 textual está confirmada en tesis (párrafo 195).
3. Tabla 1 tesis lista 6 indicadores (no 4 como dice descripción del plan original — error menor).
4. Crítica principal: el plan inscribe los números sin script reproducible. **Solución**: agregar `audit/fase3/scripts/defense_d2.py`.
5. Crítica secundaria: "eliminar 5to eje radar A2" no debe inscribirse como decisión bloqueante directa — protocolo CLAUDE.md exige `questions/NNN.md` previo. **Solución**: crear `questions/014_radar_a2_densidad_arboles.md`.
6. Naming "PROTOCOLO DEFENSA" → "Justificación metodológica" (menos defensivo, más académico).
7. CLAUDE.md anchor ambiental: corregir "97.5% en todos los ejes" para reflejar fielmente los 6 indicadores de Tabla 1 (no presentar 100% continuidad y 98.8% clima como si fueran 97.5%).
8. Scope acotado a D2 + H1-VIZ está OK, pero declarar explícitamente que SROI/jefatura/continuidad quedan pendientes para F5.
9. Boxplot paralelo PSA: mover de "OPCIONAL F4" a backlog F5 (excede los 10 issues).
10. **NO commiteado, NO push.** Esperando confirmación humana del plan revisado antes de inscribir.
