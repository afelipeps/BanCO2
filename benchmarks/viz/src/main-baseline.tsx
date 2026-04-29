import React from 'react';
import ReactDOM from 'react-dom/client';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element missing');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <main>
      <h1>baseline — React only, no chart libs</h1>
    </main>
  </React.StrictMode>,
);
