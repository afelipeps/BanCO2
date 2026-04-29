# Reconciliación 54 vs 51 indicadores — pre-migración F2

Fecha: 2026-04-28
Branch: refactor/v2 (HEAD 3d50da2)
Origen: PM2 del [PLAN.md](PLAN.md) F2.

## Hallazgo numérico

El plan F2 asumía 54 indicadores en `data.tsx` y 51 auditados en F1, con 3 IDs faltantes. La reconciliación real:

| Métrica | Valor real | Plan asumía |
|---|---|---|
| Indicadores en `data.tsx` | **53** | 54 |
| Entradas en `audit/fase1/auditoria_estadistica.xlsx` hoja `Resumen_global` (IDs únicos) | **51** | 51 |
| Indicadores propiamente dichos en F1 | **49** | n/a |
| Anclas auditadas en F1 (validaciones, no renderizables) | **2** (E_ANCLA, S_ANCLA) | n/a |
| Faltantes en F1 vs `data.tsx` | **4** (todas SROI) | 3 |

## Conteo por sección — `data.tsx`

| Sección | IDs | Líneas |
|---|---|---|
| GEO | G1, G2, G3, G4, G5, G6 | 6 |
| POB | P1, P2, P3, P4, P5 | 5 |
| AMB | A1, A2, A3, A4, A5, A6 | 6 |
| SOC | S1, S2, S3, S4, S5, S6, S7, S8, S9 | 9 |
| ECO | E1, E2, E3, E4, E5, E6, E7, E8, E9 | 9 |
| GOB | GO1, GO2, GO3, GO4, GO5, GO6, GO7, GO8 | 8 |
| SOST | ST1, ST2, ST3, ST4, ST5, ST6 | 6 |
| SROI | SR1, SR2, SR3, **SR5** (gap SR4) | 4 |
| **Total** | | **53** |

SR4 está ausente por diseño y documentado en `audit/fase1/sroi_REPORT.md` ("verified absent" — la secuencia real del SROI es SR1→SR2→SR3→SR5).

## Conteo por sección — F1 (`Resumen_global`)

| Sección | IDs | Líneas |
|---|---|---|
| Poblacion | P1, P2, P3, P4, P5 | 5 |
| Territorial | G1, G2, G3, G4, G5, G6 | 6 |
| Ambiental | A1, A2, A3, A4, A5, A6 | 6 |
| Social | S1, S2, S3, S4, S5, S6, S7, S8, S9, **S_ANCLA** | 10 |
| Economica | E1, E2, E3, E4, E5, E6, E7, E8, E9, **E_ANCLA** | 10 |
| Gobernanza | GO1, GO2, GO3, GO4, GO5, GO6, GO7, GO8 | 8 |
| Sostenibilidad | ST1, ST2, ST3, ST4, ST5, ST6 | 6 |
| **Total** | | **51** (49 indicadores + 2 anclas) |

## Diferencia trazable

- **Auditados en F1 que NO aparecen en `data.tsx` como indicador**: 2 anclas (`E_ANCLA`, `S_ANCLA`). Son auditorías de validación de cifras-ancla (e.g., brecha 8,5:1, mediana PSA por género), no indicadores renderizables. Correcto que no estén en `data.tsx`.
- **En `data.tsx` que NO fueron auditados en F1**: 4 SROI (SR1, SR2, SR3, SR5). Confirma "F1 SROI parcial = 0%". El cálculo SROI fue auditado documentalmente en `audit/fase1/sroi_REPORT.md` (no como entradas individuales en `Resumen_global`).

## Decisión condicional (PM2)

**Caso aplicado**: los 4 IDs faltantes son SROI → confirma "F1 contó SROI parcial". **Sin acción adicional**. La sección SROI ya tiene `disclosure` a nivel sección (líneas 820-826 de `data.tsx`) con `[VERSION-LOCK-OVERRIDE q013]`. F2 promociona `disclosure: Disclosure` a obligatorio en cada indicador SR1-SR5; el contenido per-indicador puede inline-copiar la sección o inheritar via referencia textual en `note`.

## Impacto en `disclosure_debt.md`

El plan original estimaba 47 TODOs (54 − 4 V-L-O − 3 reconciliados). Conteo real:

- 53 indicadores en `data.tsx`
- − 4 V-L-O ya con disclosure trazable: ST4 (q010), E2 (q011), E5 (q012), E9 (q012)
- − 0 reconciliación adicional (los 2 anclas no son indicadores)
- = **49 TODOs de `disclosure`** a enumerar en `disclosure_debt.md`, divididos en:
  - 4 SROI (SR1, SR2, SR3, SR5) — disclosure inheritable de section-level (q013)
  - 45 indicadores de las 7 secciones no-SROI sin disclosure F1 explícita en código

## Verificación

```bash
python -c "
import openpyxl
wb = openpyxl.load_workbook('audit/fase1/auditoria_estadistica.xlsx', read_only=True, data_only=True)
ids = {row[0] for row in wb['Resumen_global'].iter_rows(min_row=2, values_only=True) if row[0]}
print(len(ids), sorted(ids))
"
# 51 IDs en F1
```

```bash
grep -cE "id:\s*[\"'](G|P|A|S|E|GO|ST|SR)[0-9]+[\"']" data.tsx
# 53 IDs en data.tsx (excluye los 8 IDs de sección: GEO, POB, AMB, SOC, ECO, GOB, SOST, SROI)
```

## Estado

PM2 cerrado. Sin bloqueos.
