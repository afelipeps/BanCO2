import React from 'react';
import ReactDOM from 'react-dom/client';
import { EchartsAll } from './pages/echarts/All';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element missing');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <EchartsAll />
  </React.StrictMode>,
);
