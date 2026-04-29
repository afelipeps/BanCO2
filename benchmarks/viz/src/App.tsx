import { useState, type ReactNode } from 'react';
import { RechartsAll } from './pages/recharts/All';
import { EchartsAll } from './pages/echarts/All';
import { PlotlySmoke } from './pages/plotly-smoke/Boxplot';
import { Stress } from './pages/stress/Stress';

type Tab = 'recharts' | 'echarts' | 'plotly' | 'stress';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'recharts', label: 'Recharts custom' },
  { id: 'echarts', label: 'ECharts' },
  { id: 'plotly', label: 'Plotly smoke' },
  { id: 'stress', label: 'Stress (3 charts)' },
];

export function App(): ReactNode {
  const [tab, setTab] = useState<Tab>('recharts');
  return (
    <div style={{ minHeight: '100vh', padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Banco2 viz benchmark — F3</h1>
        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              style={{
                padding: '6px 12px',
                background: tab === t.id ? '#1e293b' : '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {tab === 'recharts' && <RechartsAll />}
        {tab === 'echarts' && <EchartsAll />}
        {tab === 'plotly' && <PlotlySmoke />}
        {tab === 'stress' && <Stress />}
      </main>
    </div>
  );
}
