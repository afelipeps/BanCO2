# Fase 1 — Auditoría sección Sostenibilidad

**Estado:** ejecutado, **q010 cerrada con [VERSION-LOCK-OVERRIDE]** (fuente Gráficas rows 230-234), **0 bloqueos finales**, **descubrimiento ancla 97,5% formalizado en finding H1** · **Rama:** `refactor/v2` · **Sección:** Sostenibilidad (id `SOST`, 6 indicadores ST1–ST6, data.tsx líneas 688-786) · **Última actualización:** 2026-04-28 (post-cierre q010 + finding H1).

## Resumen ejecutivo

Sostenibilidad es la sección con mejor reconciliación cuantitativa de Tiempo 3:

- **ST5 (Motivación Principal)** y **ST6 (Confianza vs Puntualidad)** reconcilian al pp con los microdatos. ST5 mapea exactamente a la hoja `Motivación` del xlsx (50/20/7 sobre n=77 = 64,9/26,0/9,1%). ST6 reconcilia las 4 estadísticas publicadas (r, R², intercepto, pendiente) con tolerancia <0,005 en todas.
- **ST2 (Continuidad Sin Pago)** confirma el ancla 100% bajo normalización TRIM(LOWER) IN ('si','sí','mucho') heredada de q009.
- **ST1 (Índice de Orgullo)** muestra discrepancia menor (98% código vs 96,25% strict / 97,5% normalizado): el dashboard probablemente redondea cosméticamente. Decidible con interpretación de 1 caso open-text contaminado.
- **ST3 (Matriz Estratégica)** marcado como cualitativo, no cuantificable.
- **ST4 (Fricción Operativa)** es el ÚNICO indicador con fuente irreproducible desde microdatos. Abre **questions/010**.

**Hallazgo transversal mayor**: el ancla "97,5% mejora ambiental en todos los ejes" reconcilia con **5 columnas** `2.2_Mejoro_*_SiNo`, **cada una con exactamente 78/80 = 97,5%**. NO es ST5 (motivación). Vive en sección Ambiental ya auditada.

## Inventario de indicadores (sección SOST)

| ID | Title | Tipo | Fuente | Severidades |
|---|---|---|---|---|
| ST1 | Índice de Orgullo | chart_pie 98/2 | `6.3_Orgullo_Ser_Parte` | 1 nota + 2 handoff |
| ST2 | Continuidad Sin Pago | kpi_card 100% | `6.4_Continuaria_Sin_Pago` (q009) | 1 ok |
| ST3 | Matriz Estratégica | text_matrix | externa (tesis FODA) | 1 ok |
| ST4 | Fricción Operativa | bar_h 48,57/33,57/17,86 | hoja Gráficas rows 230-234 (q010 cerrada V-L-O) | 3 nota [VERSION-LOCK-OVERRIDE] |
| ST5 | Motivación Principal | chart_pie 64,9/26,0/9,1 | hoja `Motivación` (n=77) | 3 ok |
| ST6 | Confianza vs Puntualidad | scatter r=0,54 | `4.2 × 3.5` (n=79) | 5 ok |

**Total**: 16 filas en Resumen sobre 6 indicadores. **10 ok / 4 nota / 2 handoff / 0 bloqueo** (post-fix V-L-O ST4 aplicado 2026-04-28).

## Hallazgos por indicador

### ST1 — Índice de Orgullo · `chart_pie` — **2 handoffs + 1 nota, viz viola rules**

`6.3_Orgullo_Ser_Parte` declara 3 categorías en Diccionario; observadas 3:
- `'Mucho'` (n=77)
- `'POR EL MOMENTO NINGUN DESAFIO.'` (n=2)
- `'ningu0.'` (n=1)

Las 2 últimas son texto largo que parece **contaminación cross-column** desde `6.2_Desafios_Cumplimiento` (respondents que respondieron la pregunta equivocada). Análisis de proporciones:

| Reagrupación | Orgulloso | Indiferente | Diff vs código (98/2) |
|---|---|---|---|
| Strict (Mucho=77) | 96,25% | 3,75% | 1,75 pp (handoff) |
| Normalizado (Mucho + 'ningu0.' = 78) | **97,50%** | 2,50% | 0,50 pp (nota) |
| Maximal (Mucho + todos los outliers = 80) | 100,00% | 0,00% | 2,00 pp (handoff) |

**Hipótesis preferida**: el dashboard usó la versión normalizada 78/80 = 97,5% y la redondeó a 98%. La normalización sigue el mismo patrón documentado en q009 para ST2 ('Mucho' como afirmativo intensificado) — coherente con la lección operativa de privilegiar normalización categórica antes de cuantificar.

**Acción sugerida**: reagrupar formalmente en 2 categorías (Orgulloso / Indiferente), reportar 78/80 = 97,5% con IC Wilson [91,4–99,3], y reemplazar `chart_pie` por `proporcion_wilson_bar` (visual_rules: "Nunca pie de 2 categorías"). Severidad bajará a `nota`.

### ST2 — Continuidad (Sin Pago) · `kpi_card 100%` — **1 ok, ancla confirmada**

`6.4_Continuaria_Sin_Pago` con 80/80 = 100% bajo normalización TRIM(LOWER) IN ('si','sí','mucho') (q009 resuelta). Diccionario declara cardinalidad=2 ('Sí'/'No'); microdatos contienen 1 caso `'Mucho'` que `validate_cardinality` detecta como atípico. Decisión académica 2026-04-18: contar como afirmativo intensificado.

**Reconciliación con ancla** `continuaria.sin_pago = 1.0`: ✓ ok.

### ST3 — Matriz Estratégica · `text_matrix` — **1 ok, cualitativo**

Síntesis FODA derivada de la tesis (Convicción cultural / Proyectos productivos / Fricción operativa / Relevo generacional fallido). Sin cifra que auditar; texto narrativo. Severidad ok con `valor_real=NaN`, `tipo_stat="conteo"`.

### ST4 — Fricción Operativa · `chart_bar_horizontal` — **3 handoff [VERSION-LOCK-OVERRIDE] q010 cerrada**

Publica 3 categorías sumando exactamente 100%:
- Pagos 48,57% (≈ 68/140)
- Trámites 33,57% (≈ 47/140)
- Visitas 17,86% (≈ 25/140)

**Cierre q010** (2026-04-28): fuente confirmada en **hoja `Gráficas` rows 230-234** del xlsx normalizado:

```
Criterio de Fricción | Conteo Menciones | %
Pagos                | 68               | 0,4857
Trámites             | 47               | 0,3357
Visitas              | 25               | 0,1786
Total                | 140              | 1,0000
```

Codificación tesis-time: conteo manual de palabras clave sobre open-text `6.2_Desafios_Cumplimiento` + `6.5_Sugerencias_Mejora_Programa`. Multi-select (140 menciones / 80 familias = 1,75 menciones/familia).

**Severidad mantenida en handoff** con flag explícito `[VERSION-LOCK-OVERRIDE]`. Disclosure metadata aplicada en data.tsx. Cerrada: [closed/010_resolved.md](../../questions/closed/010_resolved.md).

### ST5 — Motivación Principal · `chart_pie` — **3 ok, reconciliación exacta**

Reconcilia con la **hoja `Motivación` del xlsx** que codifica `6.1_Lo_Mas_Valioso_Programa` (open-text) en 3 buckets:

| Categoría | k | n=77 | % | Código |
|---|---|---|---|---|
| Convicción Ambiental | 50 | 77 | 64,94% | 64,9% ✓ |
| Necesidad Económica | 20 | 77 | 25,97% | 26,0% ✓ |
| Otros | 7 | 77 | 9,09% | 9,1% ✓ |

Denominador n=77 excluye 3 NaN de 6.1. La hoja `Motivación` ofrece **coding alternativo** n=80 (50/20/10 = 62,0/25,3/12,7%) que el dashboard NO usa. Decisión metodológica del equipo tesis: usar n=77 (excluyendo los NaN como missing legítimo). Documentar.

**Pie de 3 categorías**: subóptimo por visual_rules (recomendado `proporcion_wilson_bar` o diverging) pero NO viola la regla "Nunca pie de 2 categorías".

### ST6 — Confianza vs Puntualidad · `chart_correlation` — **5 ok, reconciliación exacta**

Fuente: `4.2_Puntualidad_Pagos_1a5` × `3.5_Calif_Relacion_Masbosques_Cornare`. Verificación cruzada con hoja `Regresión` del xlsx (78 pares — 1 menos que microdatos por filtrado tesis-time).

| Estadístico | Código | Real (n=79) | Diff |
|---|---|---|---|
| Pearson r | 0,54 | 0,5424 | 0,0024 |
| R² | 0,29 | 0,2942 | 0,0042 |
| Intercepto OLS | 3,46 | 3,4622 | 0,0022 |
| Pendiente OLS | 0,33 | 0,3338 | 0,0038 |
| **Spearman ρ** (no publicada) | — | **0,5617**, p=7,2e-08 | — |

Toda la cuádruple reconcilia con tolerancia <0,005 (ampliamente bajo el umbral ±0,05). **Spearman ρ es ligeramente mayor que Pearson r** — coherente con datos Likert (rangos preservan información que valores literales pierden).

**Hallazgo de viz**: el `data` array del scatter publica solo 6 puntos `{x, y, z}` agregados representativos (suma z=62, no n=79). El comentario en código declara: "Datos agregados representativos de la distribución". Recomendado: reemplazar por scatter completo con jitter (5×5 grid recharts) para fidelidad visual.

**Variables descartadas para correlación**: `4.3_Transparencia_Proceso_1a5` y `4.4_Visitas_Tecnicas_1a5` son **constantes (todas =5)** — explican por qué no se eligieron como "Confianza".

## Reconciliación contra anclas

| Ancla / Cifra | Esperado | Obtenido | Estado |
|---|---|---|---|
| `continuaria.sin_pago` (CLAUDE.md, q009) | 100% | ST2 → 100,00% | ✓ ok (normalización) |
| ST5 motivación 64,9/26,0/9,1 | exacto | 64,94/25,97/9,09 | ✓ ok |
| ST6 Pearson r | 0,54 | 0,5424 | ✓ ok |
| ST6 R² | 0,29 | 0,2942 | ✓ ok |
| ST6 intercepto | 3,46 | 3,4622 | ✓ ok |
| ST6 pendiente | 0,33 | 0,3338 | ✓ ok |
| **Mejora ambiental "97,5% en todos los ejes"** (Tabla 1 tesis) | **NO es ST5** | hallazgo transversal: ✓ ver más abajo | **descubrimiento** |

### Descubrimiento: el ancla 97,5% mejora ambiental NO es ST5 — finding H1

Verificación cruzada en sección SOST encontró que **5 columnas** del microdato reportan exactamente **78/80 = 97,5%** afirmativo:

| Variable | k('Sí') | n | % |
|---|---|---|---|
| `2.2_Mejoro_Densidad_Arboles_SiNo` | 78 | 80 | 97,5% |
| `2.2_Mejoro_Fauna_SiNo` | 78 | 80 | 97,5% |
| `2.2_Mejoro_Cantidad_Agua_SiNo` | 78 | 80 | 97,5% |
| `2.2_Mejoro_Calidad_Agua_SiNo` | 78 | 80 | 97,5% |
| `2.2_Mejoro_Aire_Puro_SiNo` | 78 | 80 | 97,5% |

**H1 finding formalizado** (2026-04-28): los 5 ejes presentan **correlación φ=1,000 perfecta inter-respondiente**. Los **mismos 2 encuestados** respondieron 'No' en los 5; los 78 restantes 'Sí' en los 5. **Cero respuestas mixtas.** Es **una dimensión replicada 5 veces**, no 5 indicadores independientes (acquiescence bias / pregunta administrada en batería con halo / constructo unidimensional real — los 3 hipótesis no son distinguibles con datos disponibles).

Wilson IC95 sobre 78/80: **[91,34%, 99,31%]**, ancho 7,98%.

Documentado en [`_findings/h1_bias_intra_respondiente_2_2.md`](_findings/h1_bias_intra_respondiente_2_2.md) con matriz φ y distribución de patrones. Implicación operativa: el ancla `<anchors>` "Mejora ambiental 97,5% en todos los ejes" es válida numéricamente pero requiere **reinterpretación narrativa** (índice unidimensional, no 5 evidencias convergentes). Acción visual queue Fase 4: reemplazar 5 charts por 1 chart Wilson IC95 con título "Mejora ambiental percibida (índice agregado)".

## Questions resueltas (cierre 2026-04-28)

- **[closed/010](../../questions/closed/010_resolved.md)** — ST4 Fricción Operativa cerrada con [VERSION-LOCK-OVERRIDE]. Fuente: hoja `Gráficas` rows 230-234 (codificación tesis-time manual sobre open-text 6.2 + 6.5).

## Decisiones metodológicas aplicadas

### Lección B aplicada: validate_cardinality preventivo

- **6.3_Orgullo_Ser_Parte**: Diccionario declara 3 categorías → aplicado `validate_cardinality(expected_values={'Mucho','Poco','Nada'}, declared_n_categories=3)`. Observadas 3, pero las 2 outliers son texto largo que sugiere contaminación cross-column. Reportado, no imputado silenciosamente.
- **6.4_Continuaria_Sin_Pago**: Diccionario declara 2 categorías → aplicado `validate_cardinality(expected_values={'Sí','No'}, declared_n_categories=2)`. 'Mucho' detectado como outlier; resuelto por normalización (q009).
- ST4: Diccionario NO declara la fuente (no hay variable identificada) → marcado "fuente irreproducible", no se imputa cardinalidad declarada.

### Lección C aplicada: version-lock NO es default

- **ST1**: discrepancia 98% vs 97,5% (0,5pp normalizado). NO se aplica version-lock — la diff cabe en redondeo cosmético, no requiere "dataset evolved" hipothesis. Severidad nota mantiene.
- **ST4**: discrepancia no medible (no hay valor_real reproducible). NO califica para version-lock por: (a) magnitud indeterminable; (b) hipótesis no es "dataset evolved" sino "fuente externa irreproducible". Abierta question/010.
- **ST5**: reconcilia exactamente con la hoja Motivación. NO necesita version-lock. Documentar coding alternativo n=80 ofrecido en la misma hoja como advertencia metodológica.
- **ST6**: reconcilia al pp en las 4 estadísticas. NO necesita version-lock.

### Normalización categórica (heredada de q009)

- ST2: TRIM(LOWER) IN ('si','sí','mucho') sobre `6.4_Continuaria_Sin_Pago`.
- ST1: subgrupo "Orgulloso normalizado" agrega 'mucho' + 'ningu0.' (mismo patrón) → 78/80 = 97,5% reconcilia con redondeo del dashboard.

### Tratamiento cualitativo (ST3)

- `tipo_stat="conteo"` sin `valor_real` (NaN), severidad ok, viz_viola_rules=False. Componente `text_matrix` aceptable para FODA narrativo.

## Severidades (output `summarize_severities`, post-V-L-O ST4)

```
ST1: {'ok': 0, 'nota': 1, 'handoff': 2, 'bloqueo': 0}   # rounding 98% / contaminación cross-column (queue Fase 4 D3)
ST2: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # ancla 100% confirmada (q009 normalización)
ST3: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # cualitativo
ST4: {'ok': 0, 'nota': 3, 'handoff': 0, 'bloqueo': 0}   # [VERSION-LOCK-OVERRIDE] q010 fuente Gráficas rows 230-234
ST5: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # reconciliación exacta hoja Motivación
ST6: {'ok': 5, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # reconciliación exacta r/R²/intercept/slope
```

**Total**: 10 ok / 4 nota / **2 handoff** / 0 bloqueo. Los 2 handoff residuales son ST1_*_strict (cosmético 1,75 pp por contaminación cross-column) — queue Fase 4 D3 (reagrupar formalmente en 2 categorías + reemplazar `chart_pie` por `proporcion_wilson_bar`).

## Recomendación

**Sección saludable con 1 question abierta y 1 debate de copy**:

1. Resolver **questions/010** (ST4 fuente). No bloquea Fase 2 — la cifra es interpretable; solo falta trazabilidad. Consultar a Andrés si existe planilla Excel anexa con la codificación.
2. Aplicar **fix cosmético ST1**: cambiar 98%/2% → 97,5%/2,5% en data.tsx, reagrupar formalmente en 2 categorías documentadas, reemplazar `chart_pie` por `proporcion_wilson_bar`. Reduce handoffs a notas.
3. Considerar **enriquecimiento ST6**: agregar Spearman ρ al story (statistical_rules: ordinal Likert → Spearman es default). El scatter actual con 6 puntos representativos puede mejorar a jitter completo n=79.
4. Documentar el **descubrimiento del ancla 97,5%** ambiental (5 columnas idénticas) en el reporte de Ambiental como verificación cruzada. Ya está documentado en este reporte para trazabilidad.

**Estado final post-auditoría (2026-04-28)**: 0 bloqueos. q010 cerrada con [VERSION-LOCK-OVERRIDE]. La sección está lista para Fase 2 (correlaciones) y Fase 4 (refactor visual H1 + ST1 + ST6).

---

## Anexo: Cobertura `validate_cardinality` (PC1, Adendum 2)

Verificación de cobertura sobre categóricas críticas usadas en cálculo de proporciones:

| Variable | Cardinalidad declarada en Diccionario_Datos | Valores observados | Atípicos | Cobertura |
|---|---|---|---|---|
| `6.3_Orgullo_Ser_Parte` (ST1) | Sí, 3 categorías | {'Mucho','POR EL MOMENTO NINGUN DESAFIO.','ningu0.'} | 2 (texto largo) | ✓ con Diccionario; 2 atípicos = contaminación cross-column desde 6.2 |
| `6.4_Continuaria_Sin_Pago` (ST2) | Sí, 'Sí/No' (2 categorías) | {'Sí','Mucho'} | 1 ('Mucho') | ✓ con Diccionario; resuelto por normalización q009 |
| `6.1_Lo_Mas_Valioso_Programa` (ST5) | open-text → recoded en hoja `Motivación` | 3 buckets en hoja anexa | 0 | ✓ con hoja Motivación n=77 |

**Cobertura SOST: 3/3 categóricas críticas validadas con Diccionario o fuente documental**. ST4 cerrada con [VERSION-LOCK-OVERRIDE] (fuente Gráficas rows 230-234) — no requiere validate_cardinality porque la lógica es codificación manual tesis-time. ST3 cualitativo, no aplica. ST6 son Likert numéricas, no categóricas.

Lección B aplicada correctamente: para 6.3 el Diccionario declara cardinalidad → atípicos reportados explícitamente (no clasificados como variantes silenciosas). Para 6.4 normalización q009 resuelve. Para 6.1 la fuente es hoja anexa (Motivación) — coding alternativo n=80 documentado pero NO usado.
