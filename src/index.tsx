/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Auditoría runtime — solo en dev. Vite tree-shakea este bloque en
// build prod (import.meta.env.DEV → false → bloque eliminado).
// Compensa que `IndicatorBase.disclosure` siga `?` post-F2; ver
// audit/fase2/disclosure_debt.md para la deuda completa (49 IDs).
if (import.meta.env.DEV) {
  Promise.all([
    import('@/data'),
    import('@/lib/disclosure_audit'),
  ]).then(([{ DATA_SOURCE_OF_TRUTH }, { auditDisclosures }]) => {
    const result = auditDisclosures(DATA_SOURCE_OF_TRUTH);
    if (result.missing.length > 0) {
      console.warn(
        `[F2-debt] ${result.missing.length}/${result.total} indicadores sin disclosure:`,
        result.missing,
      );
    }
  });
}