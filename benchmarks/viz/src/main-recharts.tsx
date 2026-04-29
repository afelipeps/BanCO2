import React from 'react';
import ReactDOM from 'react-dom/client';
import { RechartsAll } from './pages/recharts/All';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('root element missing');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RechartsAll />
  </React.StrictMode>,
);
