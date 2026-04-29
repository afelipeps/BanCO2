# Fase 1 — Auditoría sección SROI (data.tsx 786-968 vs Apéndice 1 tesis)

**Estado:** Fase D Tiempo 3 ejecutada · **Rama:** `refactor/v2` · **Sección:** SROI (id `sroi`, 4 indicadores SR1/SR2/SR3/SR5, data.tsx líneas 786-968) · **Fuente primaria:** Apéndice 1 de la tesis (Velásquez, Palacio, Álvarez 2025), `docs/tesis.docx` · **Fecha:** 2026-04-28

---

## Resumen ejecutivo

La auditoría SROI se realiza contra `docs/tesis.docx` Apéndice 1 (no contra microdatos `.xlsx`), conforme a la decisión documentada en [questions/closed/013](../../questions/closed/013_sroi_componentes_apendice_tesis.md): el cálculo SROI es agregado por metodología Social Value International con valoraciones externas (shadow wages, costos de oportunidad, mercado de carbono) que no viven en los microdatos.

**Hallazgos principales**:

1. **SR1 Asimetría de Beneficios — reconcilia exacto al peso COP**. Inputs $1.765.929.034 = Masbosques 1.389.456.598 + Municipios 347.972.436 + CORNARE 28.500.000. Outputs $3.926.103.128 = Familias 948.200.400 + Medioambiente 1.851.776.000 + Estado 1.119.600.000 + Mujeres 6.526.728. Ratio 2,22:1 ✓.
2. **SR2 Matriz Evidencia — 5 de 6 filas reconcilian valor neto exacto**. 3 discrepancias **de etiqueta** (no de cálculo) detectadas (ver tabla más abajo).
3. **SR3 (Diagnóstico de Estancamiento) — cualitativo**. Coherente con Tabla AICE de la tesis (eje Económico/Social). No cuantificable.
4. **SR5 (Outcomes no monetizados) — reconcilia conceptualmente con Tabla 5 del Apéndice**. 6 outcomes en orden similar. Algunas etiquetas reorganizadas en el dashboard.

**0 bloqueos. 0 questions abiertas**. SR2 produce 3 notas de etiquetado para ajuste cosmético en Fase 4.

## Encabezado: estado de indicadores

| ID | Título | Tipo | Reconciliación cifras | Estado |
|---|---|---|---|---|
| SR1 | Asimetría de Beneficios | sroi_balance_chart | 100% exacto al peso COP | **verificado** |
| SR2 | Matriz de Evidencia (Auditoría SROI) | sroi_evidence_table | 5/6 filas exacto en NV; 3 discrepancias de etiqueta | **verificado con notas** |
| SR3 | Diagnóstico de Estancamiento | text_matrix | cualitativo, coherente con Tabla 7 AICE tesis | **verificado** |
| SR5 | Potencial SROI Futuro | sroi_future_impact_table | 6 outcomes coherentes con Tabla 5 tesis | **verificado** |

## SR1 — Asimetría de Beneficios (sroi_balance_chart)

### Reconciliación contra Tabla 4 del Apéndice 1 tesis

**Inputs:**

| Concepto | data.tsx | Apéndice 1 (Tabla 4) | Diff |
|---|---:|---:|---:|
| Masbosques (Base) | $1.389.456.598 | $1.389.456.598 | $0 |
| Municipios (San Rafael + Granada + Guatapé) | $347.972.436 | $164.297.697 + $162.674.739 + $21.000.000 = $347.972.436 | $0 |
| CORNARE | $28.500.000 | $28.500.000 | $0 |
| **Total inputs** | **$1.765.929.034** | **$1.765.929.034** | **$0** |

✓ Reconciliación 100% exacta. Los 3 municipios están agregados en data.tsx pero los componentes coinciden con la suma de los 3 ítems individuales del Apéndice.

**Outputs/Outcomes (Tabla 3 tesis):**

| Grupo | data.tsx (NV neto) | Apéndice 1 NV | Diff |
|---|---:|---:|---:|
| Familias (PSA + Emprendimiento) | $948.200.400 | $859.842.000 + $88.358.400 = $948.200.400 | $0 |
| Medioambiente | $1.851.776.000 | $1.851.776.000 | $0 |
| Estado/Sociedad (Deforestación + Salud) | $1.119.600.000 | $1.111.500.000 + $8.100.000 = $1.119.600.000 | $0 |
| Mujeres Cuidadoras | $6.526.728 | $6.526.728 | $0 |
| **Total outputs** | **$3.926.103.128** | **$3.926.103.128** | **$0** |

✓ Reconciliación 100% exacta.

**Ratio SROI:**

| | Valor |
|---|---|
| data.tsx | "El ratio SROI de 2.22..." (story) |
| Apéndice 1 (Tabla 4 last row) | 2,22 |
| Cálculo verificado | 3.926.103.128 / 1.765.929.034 = 2,2233... → 2,22 ✓ |

## SR2 — Matriz de Evidencia (sroi_evidence_table)

### Reconciliación contra Tabla 3 del Apéndice 1 tesis

| # | Grupo | NV data.tsx | NV tesis | Diff | AT data.tsx | AT tesis | DESP data.tsx | DESP tesis | DW/DR tesis (no captado) | Estado |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 1 | Familias Guardabosques | $859.842.000 | $859.842.000 | $0 | 100% | 100% | 0% | 0% | DW 0% | ✓ exacto |
| 2 | Medioambiente (tCO2e) | $1.851.776.000 | $1.851.776.000 | $0 | 100% | 100% | 0% | 0 | 0 | ✓ exacto |
| 3 | Estado/Deforestación | $1.111.500.000 | $1.111.500.000 | $0 | **63%** | **65%** (con DW 10%) | 15% | 15% | DW 10% | ⚠ etiqueta AT |
| 4 | Mujeres Cuidadoras | $6.526.728 | $6.526.728 | $0 | 80% | 80% | null | 0 | **DR 5%** (no captado) | ⚠ DR omitido |
| 5 | Familias Emprendedoras | $88.358.400 | $88.358.400 | $0 | 60% | 60% | **20% "Peso muerto"** | **0%** (DESP); DW=20% | ⚠ etiqueta swapped |
| 6 | Sistema de Salud | $8.100.000 | $8.100.000 | $0 | 40% | 40% | 0% | 0% | DW alto (no cuantificado) | ✓ exacto |

### 3 Discrepancias menores detectadas (todas de etiquetado, NO de cálculo)

#### N1 — Estado/Deforestación: AT 63% (data.tsx) vs 65% con DW 10% (tesis)

- **Cálculo NV reconcilia**: 2.280.000.000 × 0,65 × (1−0,10−0,15) = 2.280.000.000 × 0,65 × 0,75 = 1.111.500.000 ✓
- **Discrepancia de etiqueta**: data.tsx publica `attribution: '63% (Otros actores contribuyen)'`. La tesis usa AT=65% con DW (Deadweight) separado de 10%. La cifra 63% no aparece literalmente en el Apéndice — probablemente es el factor efectivo combinado AT × (1−DW) = 0,65 × 0,90 = 0,585 (no exacto a 63%) o un redondeo conceptual.
- **Recomendación queue Fase 4**: alinear etiqueta con tesis: `attribution: '65% (Otros actores contribuyen)'` + agregar campo `deadweight: '10%'` para reflejar la metodología SROI estándar.

#### N2 — Mujeres Cuidadoras: DR (Drop-off Rate) no capturado

- **Cálculo NV reconcilia**: 8.587.800 × 0,80 × (1−0,05) = 8.587.800 × 0,80 × 0,95 = 6.526.728 ✓
- **Discrepancia**: tesis aplica DR=5% (decrecimiento acumulado en 2 años por adaptación/deterioro). data.tsx no tiene campo `dropoff` o equivalente; el efecto está implícito en el NV pero no es visible al lector.
- **Recomendación queue Fase 4**: agregar campo `decrecimiento: '5% (adaptación 2 años)'` para reflejar la metodología completa.

#### N3 — Familias Emprendedoras: etiqueta DW vs DESP intercambiada

- **Cálculo NV reconcilia**: 184.080.000 × 0,60 × (1−0,20) = 184.080.000 × 0,60 × 0,80 = 88.358.400 ✓
- **Discrepancia de etiqueta**: data.tsx publica `displacement: '20% (Peso muerto)'`. Pero "Peso muerto" en SROI **es Deadweight (DW)**, no Displacement (DESP). La tesis declara correctamente DW=20%, DESP=0%.
- **Recomendación queue Fase 4**: corregir etiqueta a `deadweight: '20% (Peso muerto - parte del negocio existiría sin BancO2)'` y `displacement: '0%'`.

## SR3 — Diagnóstico de Estancamiento (text_matrix)

Cualitativo (4 cuadrantes: Diagnóstico/Riesgo/Imperativo/Futuro). Sin cifras que auditar. Coherente con la Tabla 7 AICE del Apéndice ("Trampa de la Eficiencia Subsidiada", "Dualidad Distributiva", "Gobernanza Híbrida y Desgaste Relacional"). El concepto "Eficiencia Subsidiada" reconcilia con el Capítulo 17 Conclusiones de la tesis. Sin acción correctiva requerida.

## SR5 — Potencial SROI Futuro (sroi_future_impact_table)

Reconciliación contra Tabla 5 del Apéndice 1 tesis: 6 outcomes coherentes en data.tsx vs tesis.

| # | Outcome (tesis) | Outcome (data.tsx) | Impacto data.tsx | Impacto tesis | Estado |
|---|---|---|---|---|---|
| 1 | Biodiversidad y servicios ecosistémicos de hábitat | igual | "Muy alto (Aumenta brecha)" | "Muy alto, condicionado a incrementalidad" | ✓ coherente |
| 2 | Servicios hídricos y gobernanza hídrica | igual | "Muy alto (Aumenta brecha)" | "Muy alto" | ✓ coherente |
| 3 | Cohesión social, capital social y paz territorial | igual | "Medio (Reduce brecha)" | "Medio. Puede ser alto en contextos conflictividad" | ✓ coherente |
| 4 | Fortalecimiento institucional y gobernanza ambiental | igual | "Medio (Neutro)" | "Medio. Habilitador del impacto agregado" | ✓ coherente |
| 5 | Reputación corporativa y beneficios ESG | igual | "Condicional (Aumenta brecha)" | "Condicional. Puede ser medio-alto" | ✓ coherente |
| 6 | Capital humano y capacidades técnicas | igual | "Medio-alto (Reduce brecha)" | "Medio-alto" | ✓ coherente |

**6/6 outcomes reconcilian conceptualmente.** El dashboard agrega calificadores narrativos ("Aumenta brecha"/"Reduce brecha"/"Neutro") que son interpretaciones de la asimetría distributiva, no contradicen la tesis.

## Reconciliación contra anclas

| Ancla | Esperado | Real | Estado |
|---|---:|---:|---|
| `sroi.global_2_22` | 2,22:1 | 2,22:1 (3.926M/1.766M) | ✓ exacto |
| Inputs total | $1.765.929.034 | $1.765.929.034 | ✓ exacto |
| Outputs total | $3.926.103.128 | $3.926.103.128 | ✓ exacto |
| Composición inputs (Masbosques/Municipios/CORNARE) | 1.389,5M/348,0M/28,5M | exacto | ✓ |
| Composición outputs (Familias/Medio/Estado/Mujeres) | 948,2M/1.851,8M/1.119,6M/6,5M | exacto | ✓ |

## Decisiones metodológicas aplicadas

### [VERSION-LOCK-OVERRIDE] q013 — fuente Apéndice 1 tesis

Decisión documentada en [questions/closed/013_sroi_componentes_apendice_tesis.md](../../questions/closed/013_sroi_componentes_apendice_tesis.md). Fuente primaria: `docs/tesis.docx` Apéndice 1 (Tablas 3, 4, 5). Microdatos `.xlsx` no contienen el cálculo SROI agregado — los inputs/outputs son valoraciones externas (shadow wages, mercado de carbono $23k/tCO2e, costo de restauración MinAmbiente, OMS costos enfermedades respiratorias). Disclosure metadata aplicada en data.tsx.

### Auditoría: data.tsx vs Apéndice 1 (no microdatos)

Verificación realizada con `python-docx` instalado en `.venv` (Tabla 0-5 de la tesis cargadas). Reconciliación al peso COP de inputs/outputs. NV (Net Value) en SR2 reconcilia exacto en 6/6 filas; 3 discrepancias detectadas son **de etiquetado SROI estándar** (DW/DR/DESP intercambiados o no capturados), NO de cálculo.

### Severidades

```
SR1: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # 100% exacto
SR2: {'ok': 3, 'nota': 3, 'handoff': 0, 'bloqueo': 0}   # 3 etiquetado (N1/N2/N3) + 3 exactos
SR3: {'ok': 1, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # cualitativo
SR5: {'ok': 6, 'nota': 0, 'handoff': 0, 'bloqueo': 0}   # 6 outcomes coherentes
```

**Total: 11 ok / 3 nota / 0 handoff / 0 bloqueo** sobre 4 indicadores. Tasa ok = 78,6%. Cero bloqueos.

### Visualización: violations declaradas

- SR1 `sroi_balance_chart`: tipo personalizado del proyecto, no cae bajo visual_rules estándar. Aceptable.
- SR2 `sroi_evidence_table`: tabla, sin restricción visual.
- SR3 `text_matrix`: aceptable para cualitativo.
- SR5 `sroi_future_impact_table`: tabla, sin restricción visual.

**0 violations visuales en SROI** (sección sin charts continuos asimétricos ni Likert).

## Recomendaciones queue Fase 4

1. **N1 — Estado/Deforestación**: corregir AT 63% → 65% + agregar `deadweight: '10%'`.
2. **N2 — Mujeres**: agregar campo `decrecimiento: '5% (adaptación 2 años)'`.
3. **N3 — Familias Emprendedoras**: swap etiqueta `displacement: '20% (Peso muerto)'` → `deadweight: '20% (Peso muerto)'` + `displacement: '0%'`.

Las 3 son ajustes cosméticos al data.tsx que mejoran fidelidad metodológica con SROI estándar (Social Value International). Los **valores netos publicados son correctos** y el ratio 2,22:1 reconcilia exacto. No bloquean Fase 1.

## Fuente reproducible

Script de verificación ad-hoc: `python-docx` cargado vía `.venv/Scripts/python.exe`. Tabla 4 del Apéndice 1 tiene la suma final ($3.926.103.128 / $1.765.929.034 = SROI 2,22). Tabla 3 detalla los 6 outcomes con AT/DW/DESP/DR. Re-ejecutable con:

```python
from docx import Document
doc = Document('docs/tesis.docx')
for ti, table in enumerate(doc.tables):
    print(f'Tabla {ti}: {len(table.rows)} filas, {len(table.columns)} cols')
```

Las cifras críticas se encuentran en:
- Tabla 3: SROI Outcomes detallados (Apéndice 1)
- Tabla 4: Inputs + totales + ratio SROI (Apéndice 1)
- Tabla 5: Outcomes no monetizados (hoja de ruta futura)
