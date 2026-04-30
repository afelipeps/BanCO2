import { useState, type ReactNode } from 'react';
import { RechartsAll } from './pages/recharts/All';
import { EchartsAll } from './pages/echarts/All';
import { PlotlySmoke } from './pages/plotly-smoke/Boxplot';
import { Stress } from './pages/stress/Stress';
import { Baseline } from './pages/baseline/Baseline';

type Tab = 'recharts' | 'echarts' | 'plotly' | 'baseline' | 'stress';

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'stress', label: 'Stress (3 charts ECharts)' },
  { id: 'recharts', label: 'Recharts custom' },
  { id: 'echarts', label: 'ECharts' },
  { id: 'plotly', label: 'Plotly smoke' },
  { id: 'baseline', label: 'Baseline (React only)' },
];

const VALID_TABS: ReadonlySet<Tab> = new Set(TABS.map((t) => t.id));

function readInitialTab(): Tab {
  if (typeof window === 'undefined') return 'stress';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('mode');
  if (raw && (VALID_TABS as Set<string>).has(raw)) return raw as Tab;
  return 'stress';
}

function setUrlMode(tab: Tab): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (tab === 'stress') url.searchParams.delete('mode');
  else url.searchParams.set('mode', tab);
  window.history.replaceState({}, '', url.toString());
}

export function App(): ReactNode {
  const [tab, setTab] = useState<Tab>(readInitialTab);

  const handleClick = (id: Tab) => {
    setTab(id);
    setUrlMode(id);
  };

  return (
    <div style={{ minHeight: '100vh', padding: 16 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Banco2 viz benchmark — F3</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px' }}>
          URLs: <code>/?mode=recharts</code> · <code>/?mode=echarts</code> ·{' '}
          <code>/?mode=plotly</code> · <code>/?mode=baseline</code> ·{' '}
          <code>/</code> (stress)
        </p>
        <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleClick(t.id)}
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
        {tab === 'stress' && <Stress />}
        {tab === 'recharts' && <RechartsAll />}
        {tab === 'echarts' && <EchartsAll />}
        {tab === 'plotly' && <PlotlySmoke />}
        {tab === 'baseline' && <Baseline />}
      </main>
    </div>
  );
}
