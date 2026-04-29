import React from 'react';
import ReactDOM from 'react-dom/client';
import { PlotlySmoke } from './pages/plotly-smoke/Boxplot';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element missing');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <PlotlySmoke />
  </React.StrictMode>,
);
