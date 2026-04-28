# Fase 1 — Auditoría sección Económica

**Estado:** ejecutado, **5 anclas reconciliadas exactas (brecha 8,5:1 + mediana H/M $850k/$100k + PSA H/M $215.688/$277.312)**, **0 bloqueos finales** (D6 swap aplicado + 7 bloqueos previos en E2/E5/E9 cerrados con [VERSION-LOCK-OVERRIDE] vía questions/closed/011 y questions/closed/012), **3 questions cerradas (010, 011, 012)**. · **Rama:** `refactor/v2` · **Sección:** Económica (id `ECO`, 9 indicadores E1–E9 + E_ANCLA validación transversal, data.tsx líneas 436-577) · **Última actualización:** 2026-04-28 (post-D6 + cierre questions).

## Resumen ejecutivo

Económica es la sección con la **mejor reconciliación de anclas críticas** (3 anclas exactas: brecha 8,5:1, mediana PSA H, mediana PSA M) pero también con la **mayor proporción de recodificaciones tesis no reproducibles** desde microdatos actuales (E2, E5, E9 — 7 bloqueos sin tocar anclas).

**Hallazgos principales**:

1. **Investigación PSA formula resuelta — Escenario 1**: la fórmula canónica es la mediana de `PROMEDIO MENSUAL 2022-2023` por SEXO sobre `CATEGORÍA = 'Familia Campesina'` (n=134). Reconcilia exacto con anclas tesis (diff <1 COP, atribuible a `floor` vs `round`). Documentado en [`_findings/psa_formula.md`](_findings/psa_formula.md) para uso del sub-agente Sostenibilidad. Las otras dos fórmulas candidatas (`VALOR MENSUAL 2022` y `VALOR MENSUAL 2023`) producen mediana 2,64% off por estructura cuantizada del PSA.

2. **E4 brecha género reconcilia exacto** (8,5:1, p=0,008 Mann-Whitney). Mediana H $850k / M $100k sobre n=24 (18 H + 6 M). Outlier $23.990.000 COP/mes confirmado en cohorte H, no eliminado.

3. **E3 cobertura SMLV/incentivo verifica completo**: la serie 2018-2023 reconcilia <0,07 pp en todos los años. El "incentivo medio" reconcilia bajo `AVG(VALOR_MENSUAL_YYYY)` sobre los **141 socios totales** (no 134 Familia Campesina). Documentado.

4. **E6 y E8 version-locked** con 3 criterios cumplidos: 1 caso `Genera_Empleo='Sí'` con `ingreso=NaN` queda fuera del subgrupo, explica los 4,17 pp de diff exacto. Sevs handoff→ok.

5. **E2, E5, E9 cerradas con [VERSION-LOCK-OVERRIDE]** (questions/closed/011 y /012): la tesis aplicó filtros tesis-time confirmados por coautor (E2 fuente: hoja `Gráficas` rows 159-162; E5/E9: recodificación tesis-time no documentada). Discrepancias 10-25 pp >> 5 pp falla criterio C1 estándar pero **trazabilidad documental justifica el override**. Severidad downgrade bloqueo→nota con flag explícito. Disclosure metadata aplicada en data.tsx.

6. **D6 aplicado (decisión 2026-04-28) — E3 incentivo medio**: swap fuente referencia `AVG(141 totales)` → `AVG(134 Familia Campesina)`. Adendum 3 verificación: |diff| relativo 2,18% (2022) y 2,13% (2023), ambos bajo umbral 5%. Discrepancia disclosure: dashboard publica AVG(141)=246.522/261.659; verdad n=134=241.154/256.093. Cobertura recalculada n=134 reconcilia <1 pp con publicada (ok). Recomendación queue Fase 4: actualizar cifra publicada a AVG(134).

7. **Deuda Fase D (auditoría SROI)**: la sección SROI (data.tsx 786-968) se audita contra Apéndice 1 de la tesis (`docs/tesis.docx`), no contra microdatos. Reporte separado `sroi_REPORT.md`. Cierre [VERSION-LOCK-OVERRIDE] documentado en `questions/closed/013_sroi_componentes_apendice_tesis.md`.

## Encabezado: estado de indicadores anclados

| ID | Título | Ancla relevante | Reconciliación | Estado |
|---|---|---|---|---|
| E4 | Brecha Ingresos Género | brecha 8,5:1, mediana H $850k, mediana M $100k | exacto | **verificado** |
| E_ANCLA | PSA mediana hombres | $215.688 (n=134 FC) | exacto (diff $0,5) | **verificado** |
| E_ANCLA | PSA mediana mujeres | $277.312 (n=134 FC) | exacto (diff $0,5) | **verificado** |
| E1 | Tenencia Proyecto | n=80, 60/40 | exacto (48/32) | **verificado** |
| E3 | Erosión Incentivo | cobertura cae 25,9→22,6 (-3,3 pp) | exacto | **verificado** |
| E7 | Emprendimiento Origen | 12+11+9 sobre 32 | exacto (37,5/34,4/28,1) | **verificado** |
| E6 | Generación Empleo | 16,7% (4/24) | 12,5% (3/24) | version-lock (4,17 pp, criterio C cumplido) |
| E8 | Empleo Rural | 83,3/12,5/4,2 sobre n=24 | 87,5/8,3/4,2 | version-lock (4,17 pp) |
| E2 | Vocación Productiva | 78,3/21,7 | 56,5/43,5 (n=23) | **[VERSION-LOCK-OVERRIDE] q011 cerrada** (fuente Gráficas rows 159-162) |
| E5 | Destino Producción | 56/10/34 | 56,7/33,3/23,3 (n=30) | **[VERSION-LOCK-OVERRIDE] q012 cerrada** |
| E9 | Nivel Comercialización | 100/44/30/26 | 100/33,3/20,0/46,7 (n=30) | **[VERSION-LOCK-OVERRIDE] q012 cerrada** |

## Hallazgos por indicador

### E1 — Tenencia Proyecto · `chart_pie` — **viz viola rules**

- 2 ok. Reconcilia exacto: 48/80=60,0% No, 32/80=40,0% Sí.
- Viz viola "Nunca pie de 2 categorías"; fix Fase 4: barra Wilson + n=80 visible.

### E2 — Vocación Productiva · `chart_bar_horizontal` — **2 nota [VERSION-LOCK-OVERRIDE]**

- Originalmente 2 bloqueos. 78,3%/21,7% código vs 56,5%/43,5% real (porc_venta>=50 sobre n=23). Diff ~22 pp.
- **Cierre q011** (2026-04-28): fuente confirmada en hoja `Gráficas` rows 159-162 (cut `Venta > 25%` sobre n=23 "Distribución Medible" con filtros tesis-time no documentados). Trazabilidad documental justifica override de criterio C1.
- Severidad downgrade bloqueo→nota con flag `[VERSION-LOCK-OVERRIDE]`. Disclosure metadata aplicada en data.tsx.
- Cerrada: [closed/011_version_lock_override.md](../../questions/closed/011_version_lock_override.md).

### E3 — Erosión del Incentivo · `chart_erosion` — **5 ok + 4 nota (D6 swap aplicado)**

- 9 filas total: 6 cobertura por año + 1 caída delta + 2 disclosure incentivo D6.
- **D6 swap aplicado (decisión 2026-04-28)**: fuente referencia = `AVG(VALOR_MENSUAL_YYYY)` sobre 134 Familia Campesina (no 141 totales).
  - Justificación: "Eficiencia Subsidiada" se refiere a familias campesinas; los 7 socios Institución/Otro no son la población del PSA.
  - **Adendum 3 verificación**: |diff| relativo AVG(141) vs AVG(134) = 2,18% (2022) y 2,13% (2023), ambos bajo umbral 5%. Swap aplicable.
- **Discrepancias disclosure D6**:
  - 2022: dashboard publica 246.522 (=AVG(141)). Verdad n=134=241.154. Diff -5.369 COP (2,18% relativo) → severidad nota.
  - 2023: dashboard publica 261.659 (=AVG(141)). Verdad n=134=256.093. Diff -5.566 COP (2,13% relativo) → severidad nota.
- Cobertura publicada (`incentivo_pub / SMLV`) vs cobertura recalculada (`AVG(134) / SMLV`) reconcilia <1 pp en 2022/2023 → ok.
- SMLV oficial Colombia validado contra DANE 2018-2023.
- **Recomendación queue Fase 4**: actualizar cifras de E3 en data.tsx a AVG(134) para alinear con narrativa.

### E4 — Brecha Ingresos Género · `chart_bar_vertical` — **2 ok + 1 nota** (ancla crítica)

- Hombres mediana=$850.000 (n=18, IQR=[112.500, 1.000.000]). Reconcilia exacto.
- Mujeres mediana=$100.000 (n=6, IQR=[70.000, 100.000]). Baja potencia → bump nota.
- Brecha ratio H/M = 8,50:1. Reconcilia exacto con ancla `economica.brecha_genero_mercado_8_5_1`.
- Mann-Whitney U=93,5, **p=0,008** (significativo a α=0,05). La diferencia de medianas no es atribuible a azar.
- Outlier $23.990.000/mes confirmado en cohorte H (hombre, PECUARIO, ingreso productivo). Documentado en anchors.
- Mean inflado a $3.229.704 por 3 outliers >$10M; mediana es el estadístico correcto.
- **Viz viola rules**: bar vertical para continua asimétrica con outliers viola visual_rules → recomendado boxplot lado a lado con strip plot.

### E5 — Destino Producción · `chart_pie` — **3 nota [VERSION-LOCK-OVERRIDE]**

- "Venta" reconcilia bajo umbral porc_venta>=50: 17/30=56,67% (código 56%; nota por 0,67 pp).
- "Autoconsumo" 10% código vs 33,3% real → diff 23,3 pp; original bloqueo, downgrade a nota tras q012 cierre.
- "Pérdida/Mixto" 34% código vs 23,3% real → diff -10,7 pp; original bloqueo, downgrade a nota tras q012 cierre.
- **Cierre q012** (2026-04-28): recodificación tesis-time confirmada por coautor. Trazabilidad documental (tesis Velásquez et al. 2025) justifica override C1.
- Cerrada: [closed/012_version_lock_override.md](../../questions/closed/012_version_lock_override.md).

### E6 — Generación de Empleo · `kpi_card` — **1 ok (version-locked) + 1 handoff (alt)**

- Subgrupo principal (denom=ing>0, n=24): código 16,7% (4/24) vs real 12,5% (3/24). Diff 4,17 pp.
- **Version-lock aplicado** (handoff→ok): el caso 4 'Sí' tiene ing=NaN en data actual y queda fuera del subgrupo. Hipótesis específica documentable. Cumple los 3 criterios.
- Subgrupo alternativo (denom=tiene_proyecto, n=32): 4/32=12,5%. No version-locked (denominador no canónico). Mantiene handoff con nota.
- Recomendación viz: barra Wilson + n=24 visible (KPI 16,7% sin n es engañoso, baja potencia).

### E7 — Emprendimiento Origen · `chart_combo` — **4 ok + 2 nota**

- Proporciones reconcilian exacto: 12/32=37,50%, 11/32=34,38%, 9/32=28,12% sobre `Recod_Inicio_Proyecto`.
- **Hallazgo metodológico**: la columna `income` del data.tsx es la **mediana**, no la media (verificable: $100k coincide con mediana de cohortes Inicio/Tenía con 11 y 7 obs respectivamente; la media sería ~$300k). $6.733.350 coincide con mediana cohorte Fortalecido (avg sería $8.864.111).
- Bumped a nota: cohorte Inició PSA mediana=$100k (n=11 ⇒ ok); Ya tenía mediana=$100k (n=7 baja potencia ⇒ nota); Fortalecido mediana=$6.733.333 (diff $17 vs código $6.733.350, ok pero n=6 ⇒ nota).
- **Viz "chart_combo" mantiene viz_viola_rules=False** porque el código publica medianas (estadístico correcto). La narrativa "$100k vs $6.7M" aprovecha legítimamente la asimetría.

### E8 — Empleo Rural · `chart_bar_horizontal` — **3 ok (2 version-locked + 1 exacto)**

- Misma cohorte que E6 (n=24 productivos con ing>0).
- "No Genera": 21/24=87,5% vs código 83,3%. Diff 4,17 pp ⇒ version-lock (mismo razonamiento E6).
- "1-2 Jornales (dias<=4)": 2/24=8,3% vs código 12,5%. Diff 4,17 pp ⇒ version-lock.
- "3+ Jornales (dias>4)": 1/24=4,2% vs código 4,2% ⇒ exacto.

### E9 — Nivel Comercialización · `chart_funnel` — **1 ok + 3 nota [VERSION-LOCK-OVERRIDE]**

- "Producción total" 100% trivial (ok).
- "Autoconsumo" código 44% vs real 36,7% (cut <30%) ⇒ diff 7,3 pp; original bloqueo, downgrade a nota.
- "Venta parcial" código 30% vs real 13,3% (cut 30-79%) ⇒ diff 16,7 pp; original bloqueo, downgrade a nota.
- "Venta consolidada" código 26% vs real 50% (cut >=80%) ⇒ diff 24 pp; original bloqueo, downgrade a nota.
- Ningún cut alternativo simple sobre porc_venta produce 44/30/26 — recodificación tesis-time.
- **Cierre q012** (2026-04-28): mismo patrón que E5. Fuente: tesis Velásquez et al. 2025.
- Cerrada: [closed/012_version_lock_override.md](../../questions/closed/012_version_lock_override.md).

### E_ANCLA — Validación transversal de anclas críticas

- **Brecha género ratio 8,5:1**: ratio computado=8,50, diff=0,000. Reconcilia exacto.
- **PSA mediana hombres $215.688**: real=$215.687,5, diff=$0,5 (rounding floor vs round). Reconcilia.
- **PSA mediana mujeres $277.312**: real=$277.312,5, diff=$0,5. Reconcilia.

## Reconciliación contra anclas

| Ancla | Valor declarado | Real | Diff | Estado |
|---|---:|---:|---:|---|
| `economica.brecha_genero_mediana_h` | $850.000 | $850.000 | 0 | **ok exacto** |
| `economica.brecha_genero_mediana_m` | $100.000 | $100.000 | 0 | **ok exacto** |
| `economica.brecha_genero_mercado_8_5_1` | 8,5:1 | 8,50:1 | 0,003 | **ok exacto** |
| `economica.psa_mensual.mediana_hombres` | $215.688 | $215.687,5 | $0,5 | **ok (round vs floor)** |
| `economica.psa_mensual.mediana_mujeres` | $277.312 | $277.312,5 | $0,5 | **ok (round vs floor)** |
| `pagos.familia_campesina` | 134 | 134 | 0 | **ok** |
| `pagos.familia_campesina.hombres` | 97 | 97 | 0 | **ok** |
| `pagos.familia_campesina.mujeres` | 37 | 37 | 0 | **ok** |
| `pagos.n_total` | 141 | 141 | 0 | **ok** |
| `outlier.ingreso_productivo` | $23.990.000/mes | confirmado en E4 cohorte H | n/a | **ok** |

## Questions resueltas (cierre 2026-04-28)

- [closed/011](../../questions/closed/011_version_lock_override.md) — E2 cerrada con [VERSION-LOCK-OVERRIDE]. Fuente: hoja `Gráficas` rows 159-162 (cut `Venta > 25%` sobre n=23 "Distribución Medible" con filtros tesis-time).
- [closed/012](../../questions/closed/012_version_lock_override.md) — E5 + E9 cerradas con [VERSION-LOCK-OVERRIDE]. Recodificación tesis-time confirmada por coautor. Fuente: tesis Velásquez et al. 2025.

**Ninguna question afectó anclas**: brecha 8,5:1, mediana PSA H/M, mediana H $850k / M $100k todas reconcilian exactas.

## Decisiones metodológicas aplicadas

### PSA formula resolution (Escenario 1)

Tres fórmulas candidatas evaluadas sobre n=134 Familia Campesina:

| Fórmula | Mediana H | Mediana M | Diff vs ancla H | Diff vs ancla M |
|---|---:|---:|---:|---:|
| `VALOR MENSUAL 2022` | $210.000 | $270.000 | -2,64% | -2,64% |
| `VALOR MENSUAL 2023` | $221.375 | $284.625 | +2,64% | +2,64% |
| **`PROMEDIO MENSUAL 2022-2023`** ✓ | **$215.687,5** | **$277.312,5** | **0%** | **0%** |

Adoptado como canon. Documentado en `_findings/psa_formula.md`. Bootstrap CI degenerado por cuantización de tarifas (9 valores discretos); usar IQR como dispersión principal.

### Version-lock aplicado (E6, E8)

3 criterios cumplidos en ambos casos:
- C1 (magnitud ≤5 pp): diff exacto 4,17 pp ✓
- C2 (dirección consistente): n actual = n tesis (24); 1 caso 'Sí' adicional perdido por NaN ✓
- C3 (hipótesis específica): "1 caso Genera_Empleo='Sí' con ingreso=NaN excluído del subgrupo cohorte=ing>0" ✓

Sevs handoff→ok con nota explícita en notas.

### [VERSION-LOCK-OVERRIDE] aplicado (E2, E5, E9) — 2026-04-28

C1 falla en todos: discrepancias 10-25 pp >> 5 pp umbral, NO califica version-lock estándar. Sin embargo, **trazabilidad documental justifica el override**:

- **E2** (q011): fuente confirmada hoja `Gráficas` rows 159-162. Cut `Venta > 25%` sobre n=23 "Distribución Medible" con filtros tesis-time aplicados. Lógica del filtro no documentada en `Diccionario_Datos` pero la cifra publicada vive en el mismo xlsx normalizado.
- **E5 + E9** (q012): recodificación tesis-time confirmada por coautor. Fuente: tesis Velásquez et al. 2025.

Política aplicada: severidad bloqueo→nota con flag `[VERSION-LOCK-OVERRIDE]` + disclosure metadata explícito en data.tsx. Definición formal en CLAUDE.md sección Severidades.

### D6 swap E3 incentivo medio (2026-04-28)

- Decisión: fuente referencia = `AVG(VALOR_MENSUAL_YYYY)` sobre 134 Familia Campesina, no 141 totales.
- Adendum 3 contingencia verificada: |diff| relativo 2,18% (2022) / 2,13% (2023), ambos bajo umbral 5%. Swap aplicable.
- Aplicado al script en líneas 290-388 (subgrupo `cobertura_{year}_n134` + 2 filas disclosure de incentivo publicado vs n=134).
- Recomendación queue Fase 4: actualizar cifras de E3 en data.tsx 478-491 a AVG(134) — backlog/fase4_visuales.md.

### Lección B (validate_cardinality preventivo)

- E1: `5.2.1_Tiene_Proyecto_Productivo_SiNo` cardinalidad declarada 'Sí'/'No' (2 categorías). Sin valores fuera de set. No se requirió validate_cardinality formal.
- E5/E7: `5.2.2_Tipo_Proyecto` y `5.2.3_Fecha_Inicio_Proyecto` son **open-text** (cardinalidad NO declarada). Aplicada Lección B: reportar únicos sin clasificar como atípicos. 17 variantes ortográficas en `5.2.2_Tipo_Proyecto` (PECUARIO, AGRICOLA, ga0deria, AGRÍCOLA, etc.) → evidencia de captura no normalizada.

### Stats no triviales

- **E4 Mann-Whitney U**: U=93,5, p=0,0079. Confirma significancia estadística de la brecha género más allá de la muestra.
- **E4 bootstrap mediana CI**: H boot95=[$125.000, $1.000.000] muy ancho por outliers; M boot95=[$60.000, $200.000] estrecho.
- **PSA bootstrap CI degenerado**: cuantización tarifaria → la mediana cae en exactamente un tier; bootstrap retorna single-point CI. Documentado.

## Severidades (output `summarize_severities`, post-D6 + post-VERSION-LOCK-OVERRIDE)

```
E1: {'ok': 2, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
E2: {'ok': 0, 'nota': 2, 'handoff': 0, 'bloqueo': 0}   # [VERSION-LOCK-OVERRIDE] q011
E3: {'ok': 5, 'nota': 4, 'handoff': 0, 'bloqueo': 0}   # D6 swap (4 nota = 2 cobertura recalc + 2 disclosure incentivo)
E4: {'ok': 2, 'nota': 1, 'handoff': 0, 'bloqueo': 0}
E5: {'ok': 0, 'nota': 3, 'handoff': 0, 'bloqueo': 0}   # [VERSION-LOCK-OVERRIDE] q012
E6: {'ok': 1, 'nota': 0, 'handoff': 1, 'bloqueo': 0}
E7: {'ok': 4, 'nota': 2, 'handoff': 0, 'bloqueo': 0}
E8: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
E9: {'ok': 1, 'nota': 3, 'handoff': 0, 'bloqueo': 0}   # [VERSION-LOCK-OVERRIDE] q012
E_ANCLA: {'ok': 3, 'nota': 0, 'handoff': 0, 'bloqueo': 0}
```

**Totales post-cierre**: 37 filas Resumen sobre 10 indicadores. **ok=21, nota=15, handoff=1, bloqueo=0**. Tasa ok+nota = 97%. **Cero bloqueos finales.**

## Visualización: violations declaradas

| Indicador | viz_actual | viola | Razón | Fix Fase 4 |
|---|---|---|---|---|
| E1 | chart_pie (2 cats) | sí | "Nunca pie de 2 categorías" | barra Wilson + n=80 |
| E4 (3 filas) | chart_bar_vertical | sí | continua asimétrica con outliers | boxplot lado a lado + strip plot |
| E5 (3 filas) | chart_pie | sí | 3 categorías; pie aceptable pero barra mejor para IC | chart_bar_horizontal + Wilson |

E2 (`chart_bar_horizontal`), E3 (`chart_erosion`), E6 (`kpi_card`), E7 (`chart_combo`), E8 (`chart_bar_horizontal`), E9 (`chart_funnel`) NO violan visual_rules. **Total filas con `viz_viola_rules=True`: 7 sobre 35** (20%).

## Deuda explícita

- **SROI section** (data.tsx 786-968) NO se audita en Tiempo 3. Cifra principal $3.926.103.128 (output total servicios ecosistémicos) probablemente NO está en xlsx — corresponde a valoración externa (precios sombra, costos de oportunidad, captura de carbono). Diferida a Fase 2 o tarea aparte.
- **E2 / E5 / E9 recodificaciones**: requieren acceso al cálculo manual de la tesis (probable hoja Excel auxiliar no en el xlsx canónico) o aceptación explícita de cifras como version-locked sin reproducción automatizable.
- **E3 incentivo universo**: clarificar narrativa — ¿el "incentivo promedio" debe ser sobre 141 socios totales (con Institución) o 134 Familia Campesina? El código actual (n=141) reconcilia exacto pero la narrativa "Eficiencia Subsidiada" implícitamente apunta al subgrupo familia.

## Resumen para sub-agente Sostenibilidad

`audit/fase1/_findings/psa_formula.md` documenta:
- Fórmula canónica `PROMEDIO MENSUAL 2022-2023` por SEXO sobre Familia Campesina (n=134; H=97, M=37).
- 9 tarifas discretas {110.687,5 / 135.187,5 / ... / 554.625} → bootstrap CI degenerado, usar IQR.
- Mann-Whitney U=1.298, p=0,0117 (mediana M > mediana H significativo).
- Sanity check vs summary embedded del xlsx (rows 146-147) reporta el estadístico de 2023, no del promedio 2022-2023 — explicación: la tesis publica la ventana 2022-2023 que coincide con SROI; el summary embedded usa snapshot 2023 (más reciente).

---

## Anexo: Cobertura `validate_cardinality` (PC1, Adendum 2)

Verificación de cobertura sobre categóricas críticas usadas en cálculo de proporciones (no version-locked):

| Variable | Cardinalidad declarada en Diccionario_Datos | Valores observados | Atípicos | Cobertura |
|---|---|---|---|---|
| `5.2.1_Tiene_Proyecto_Productivo_SiNo` (E1) | Sí, 'Sí/No' | {'Sí','No'} | 0 | ✓ con Diccionario |
| `5.2.6_Genera_Empleo_SiNo` (E6) | **NO declarada** | {'Sí','No'} (datos limpios) | 0 | ⚠ deuda residual |
| `1.6_Sexo` (E4 subgrupo) | Sí, 'M, F' | {'M','F'} | 0 | ✓ con Diccionario |

**Cobertura ECO: 3/3 categóricas críticas validadas sin atípicos**. Las cerradas con [VERSION-LOCK-OVERRIDE] (E2, E5, E9) NO requieren validate_cardinality porque su lógica es tesis-time no reproducible (override por trazabilidad documental).

**Deuda residual documentada**: `5.2.6_Genera_Empleo_SiNo` no tiene cardinalidad declarada en `Diccionario_Datos`. Datos observados son limpios pero la falta de declaración es deuda del Diccionario, no del audit. Lección B aplicada: reportar valores observados sin clasificar como atípicos. Sugerencia: agregar entrada en Diccionario_Datos en próxima revisión de la base.

## Anexo: Trazabilidad outlier $23.990.000 (PC2)

Verificación realizada 2026-04-28:

| Campo | Valor |
|---|---|
| `ID_Encuesta` | **40** |
| `1.6_Sexo` | M (Masculino) |
| `1.7_Edad` | 41 |
| `5.2.2_Tipo_Proyecto` | PECUARIO |
| `5.2.4_Ingreso_Mensual_Promedio_COP` | **$23.990.000** |
| `5.2.5_Porc_Venta` | 90 |

**Verificado**: el outlier NO se eliminó del cálculo de mediana E4 (cohorte H, n=18). La mediana H = $850.000 reconcilia exactamente con ancla porque la mediana es robusta a outliers. La media H ($3.229.704) está inflada por este outlier + 2 más >$10M; documentado en hallazgos E4. Trazabilidad cumplida: el outlier es declarado, identificado por `ID_Encuesta=40`, conservado en cálculos.
