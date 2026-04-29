import { describe, it, expect } from 'vitest';
import { auditDisclosures } from './disclosure_audit';
import type { DataSource, Section } from '@/types';

const emptySection = (id: string): Section => ({
  id,
  title: '',
  subtitle: '',
  description: '',
  indicators: [],
});

const mockData: DataSource = {
  geografia: {
    ...emptySection('GEO'),
    indicators: [
      {
        id: 'WITH',
        title: 'Con disclosure',
        type: 'kpi_card',
        kpiValue: '1',
        kpiUnit: 'unidad',
        trend: 'OK',
        story: { title: 't', text: 't' },
        disclosure: {
          source: 'test',
          transformation: 'test',
          timeWindow: 'test',
          n: 80,
          note: 'test',
        },
      },
      {
        id: 'WITHOUT',
        title: 'Sin disclosure',
        type: 'kpi_card',
        kpiValue: '2',
        kpiUnit: 'unidad',
        trend: 'OK',
        story: { title: 't', text: 't' },
      },
      {
        id: 'WITH_NULL_N',
        title: 'Disclosure con n: null (SROI-like)',
        type: 'kpi_card',
        kpiValue: '3',
        kpiUnit: 'unidad',
        trend: 'OK',
        story: { title: 't', text: 't' },
        disclosure: {
          source: 'test',
          transformation: 'test',
          timeWindow: 'test',
          n: null,
          note: 'ratio sin subgrupo',
        },
      },
    ],
  },
  poblacion: emptySection('POB'),
  ambiental: emptySection('AMB'),
  social: emptySection('SOC'),
  economica: emptySection('ECO'),
  gobernanza: emptySection('GOB'),
  sostenibilidad: emptySection('SOST'),
  sroi: emptySection('SROI'),
};

describe('auditDisclosures', () => {
  it('identifica IDs con disclosure (incluyendo n: null)', () => {
    const result = auditDisclosures(mockData);
    expect(result.present).toContain('WITH');
    expect(result.present).toContain('WITH_NULL_N');
    expect(result.present).toHaveLength(2);
  });

  it('identifica IDs sin disclosure', () => {
    const result = auditDisclosures(mockData);
    expect(result.missing).toContain('WITHOUT');
    expect(result.missing).toHaveLength(1);
  });

  it('total = present + missing', () => {
    const result = auditDisclosures(mockData);
    expect(result.total).toBe(result.present.length + result.missing.length);
    expect(result.total).toBe(3);
  });

  it('DataSource vacío retorna conteo cero', () => {
    const empty: DataSource = {
      geografia: emptySection('GEO'),
      poblacion: emptySection('POB'),
      ambiental: emptySection('AMB'),
      social: emptySection('SOC'),
      economica: emptySection('ECO'),
      gobernanza: emptySection('GOB'),
      sostenibilidad: emptySection('SOST'),
      sroi: emptySection('SROI'),
    };
    const result = auditDisclosures(empty);
    expect(result.total).toBe(0);
    expect(result.present).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('itera todas las secciones (no solo la primera)', () => {
    const data: DataSource = {
      ...mockData,
      sroi: {
        ...emptySection('SROI'),
        indicators: [
          {
            id: 'SR_TEST',
            title: 'SROI test',
            type: 'kpi_card',
            kpiValue: '0',
            kpiUnit: 'unidad',
            trend: 'OK',
            story: { title: 't', text: 't' },
          },
        ],
      },
    };
    const result = auditDisclosures(data);
    expect(result.missing).toContain('SR_TEST');
  });
});
