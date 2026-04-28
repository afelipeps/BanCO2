# 013 — SROI: componentes externos al xlsx, vivo en Apéndice 1 de la tesis

**Estado:** RESUELTA con fuente documental · **Fecha cierre:** 2026-04-28
**Decisión:** [VERSION-LOCK-OVERRIDE] — fuente: Apéndice 1 de la tesis (.docx), no microdatos (.xlsx)

---

## Resolución (H5)

CONFIRMADO por usuario (coautor de la tesis): el cálculo SROI completo vive en **Apéndice 1 de la tesis** (`docs/tesis.docx`), no en el xlsx normalizado. Los componentes están documentados con metodología SROI estándar Social Value International (shadow wages, deadweight, attribution, displacement, drop-off rate).

**SROI = $3.926.103.128 / $1.765.929.034 = 2,22**

### Inputs ($1.765.929.034)

| Aporte | Monto COP | Concepto |
|---|---:|---|
| Masbosques (Base) | 1.389.456.598 | Operación, gestión, monitoreo, PSA |
| Municipio de San Rafael | 164.297.697 | Convenios PSA 2024-2025 |
| Municipio de Granada | 162.674.739 | Convenios PSA |
| Municipio de Guatapé | 21.000.000 | Aportes focalizados |
| CORNARE | 28.500.000 | 15 estufas eficientes en especie |
| **Total** | **1.765.929.034** | |

### Outputs ($3.926.103.128)

Desglose por outcomes monetizados (3 dimensiones):

- **Económica**: ~$948 millones (familias emprendedoras + empleo)
- **Ambiental**: balance del total
- **Social**: incluye estufas eficientes / sistema de salud

Cada outcome incorpora ajustes metodológicos: Attribution (AT), Deadweight (DW), Displacement (DESP), Drop-off Rate (DR).

### Outcomes NO monetizados (hoja de ruta futura)

Documentados como deuda metodológica en la tesis:
- Biodiversidad y servicios ecosistémicos de hábitat
- Servicios hídricos y gobernanza hídrica
- Cohesión social y capital social
- Fortalecimiento institucional
- Reputación corporativa (ESG)
- Capital humano y capacidades técnicas

## Implicación para auditoría

**La auditoría posible es contra `docs/tesis.docx` Apéndice 1, NO contra microdatos `.xlsx`.** Los microdatos no contienen el cálculo SROI agregado.

### Acción aplicada (Fase D)

- Auditoría de `data.tsx` líneas 786-968 (sección SROI) contra tablas del Apéndice 1: cada cifra publicada debe reconciliar exacto con el .docx.
- Disclosure metodológico en `data.tsx` SROI (shape `{ value, n: null, source: "Tesis Velásquez et al. 2025, Apéndice 1", transformation: "calculo_sroi_metodologia_social_value_international", timeWindow: "2022-2023" }`).
- Footer general sección SROI:
  > "Cálculo SROI conforme metodología Social Value International (shadow wages, deadweight, attribution, displacement). Inputs $1.765.929.034 (Masbosques + 3 municipios + CORNARE). Outputs $3.926.103.128 (3 dimensiones monetizadas). Outcomes no monetizados documentados como deuda metodológica para iteración futura. Fuente primaria: Apéndice 1, tesis Velásquez et al. 2025."

### Justificación del override (criterios C1-C2-C3 vs override)

- **Criterio C1 (magnitud bajo umbral)**: NO aplica — los componentes SROI no están en microdatos para comparar.
- **Override por trazabilidad documental**: la fuente es el Apéndice 1 de la tesis publicada. El xlsx normalizado del proyecto NO contiene el cálculo SROI agregado por diseño metodológico (servicios ecosistémicos valorados externamente). Disclosure explícito + shape metadata + auditoría dedicada contra .docx satisface las reglas.

## Cross-references

- `audit/fase1/sroi_REPORT.md` — auditoría dedicada de SROI vs Apéndice 1 (Fase D).
- `data.tsx` líneas 786-968 — sección SROI con metadata aplicada.
- `CLAUDE.md` — definición de [VERSION-LOCK-OVERRIDE] en sección Severidades.
- `docs/tesis.docx` — Apéndice 1 SROI (gitignored, copia local de trabajo).
