import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Multi-mode build to get per-library bundle sizes.
// `vite build --mode recharts` → dist-recharts/, only entry that imports recharts pages
// `vite build --mode echarts`  → dist-echarts/, only entry that imports echarts pages
// `vite build --mode plotly`   → dist-plotly/, only entry that imports plotly pages (smoke)
// `vite build`                 → dist/, includes router + all pages (stress test)

export default defineConfig(({ mode }) => {
  const isolatedMode =
    mode === 'recharts' || mode === 'echarts' || mode === 'plotly' || mode === 'baseline';
  const entry = isolatedMode
    ? path.resolve(__dirname, `src/entry-${mode}.html`)
    : path.resolve(__dirname, 'index.html');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@bench': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 4174,
      host: '0.0.0.0',
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: isolatedMode ? `dist-${mode}` : 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        input: entry,
      },
    },
  };
});
