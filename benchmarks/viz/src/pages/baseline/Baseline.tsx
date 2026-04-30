import type { ReactNode } from 'react';

export function Baseline(): ReactNode {
  return (
    <section
      aria-labelledby="bl-title"
      style={{
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 24,
        background: '#0f172a',
        border: '1px dashed #334155',
        borderRadius: 8,
      }}
    >
      <h2 id="bl-title" style={{ fontSize: 16, color: '#e2e8f0', margin: 0 }}>
        Baseline — React only, sin librerías de chart
      </h2>
      <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
        Esta página existe para medir el costo de React+ReactDOM solo
        (~59 KB gzip). Cualquier delta de bundle entre baseline y los
        otros builds es atribuible a la librería de visualización.
      </p>
      <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
        Ver{' '}
        <code style={{ color: '#10b981' }}>benchmarks/viz/results/bundle.json</code>
        {' '}para los números canónicos.
      </p>
    </section>
  );
}
