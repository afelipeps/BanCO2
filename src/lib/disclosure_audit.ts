// Auditoría runtime de cobertura de `disclosure` en el árbol de
// indicadores. Se invoca solo en dev (ver src/index.tsx) y loggea
// los IDs sin disclosure como warning. Compensa parcialmente que
// `IndicatorBase.disclosure` siga siendo `?` post-F2: el endurecimiento
// del tipo a obligatorio queda diferido a F5 (ver disclosure_debt.md).

import type { DataSource, SectionKey } from '@/types';

export interface DisclosureAuditResult {
  total: number;
  present: string[];
  missing: string[];
}

export function auditDisclosures(data: DataSource): DisclosureAuditResult {
  const present: string[] = [];
  const missing: string[] = [];
  const sectionKeys = Object.keys(data) as SectionKey[];
  for (const key of sectionKeys) {
    const section = data[key];
    for (const indicator of section.indicators) {
      // Criterio: el indicador tiene un objeto disclosure asignado
      // (independiente del valor de `n` — `n: null` es legítimo para
      // ratios SROI y otros donde el subgrupo no aplica).
      if (indicator.disclosure != null) {
        present.push(indicator.id);
      } else {
        missing.push(indicator.id);
      }
    }
  }
  return {
    total: present.length + missing.length,
    present,
    missing,
  };
}
