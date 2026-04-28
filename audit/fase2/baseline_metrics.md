# Baseline F2 — métricas pre-refactor

Fecha: 2026-04-28
Branch: refactor/v2 (HEAD 3d50da2)
Origen: PM7 del [PLAN.md](PLAN.md) F2.

## Bundle (`vite build` sobre `refactor/v2`)

| Artefacto | Tamaño | Notas |
|---|---|---|
| `dist/` total | **736 KB** | incluye `index.html` + `assets/` |
| `dist/assets/index-B598jU8w.js` | **747.46 kB** (raw) | gzip: **219.06 kB** |
| `dist/index.html` | 0.96 kB | gzip 0.52 kB |
| Modules transformed | 2.354 | tras `vite build` |
| Build time | 9.43 s | Windows 11 + Vite 6.4.2 |

### Verificación importmap+Vite (B3)

`index.html` declara `<script type="importmap">` con React/recharts/lucide-react apuntando a `https://esm.sh/`. **Vite NO respeta el importmap en build**: resuelve los imports desde `node_modules/` y los bundlea en el chunk único.

```bash
grep -lE "createRoot|forwardRef" dist/assets/*.js
# dist/assets/index-B598jU8w.js
grep -cE "createRoot|forwardRef" dist/assets/*.js
# 10
```

React, ReactDOM, recharts y lucide-react están bundleados en el único chunk `index-*.js` de 747 kB. El importmap en `index.html` es código muerto en producción — solo tendría efecto si los módulos estuvieran marcados `external` en `vite.config.ts`, lo cual no está configurado.

**Implicación para el delta gate F2**: la métrica `du -sh dist/` y el tamaño raw del chunk JS son trazables y comparables post-refactor. R4 (importmap+Vite divergen) no se materializó.

**Deuda separada (no bloqueante F2)**: el importmap activo en `index.html` puede confundir auditorías futuras. Decisión sugerida en F3: o eliminarlo o convertir los módulos a `external` en `vite.config.ts` para que SÍ se sirvan vía CDN. Out-of-scope F2.

## Visual baseline

`audit/baseline/v2/` — 16 PNGs (8 secciones × 2 viewports).

| Sección | desktop (1440×900) | mobile (390×844) |
|---|---|---|
| geografia | OK 1550 ms | OK 1862 ms |
| poblacion | OK 1435 ms | OK 1629 ms |
| ambiental | OK 1492 ms | OK 1783 ms |
| social | OK 1562 ms | OK 1639 ms |
| economica | OK 1678 ms | OK 1966 ms |
| gobernanza | OK 1630 ms | OK 1849 ms |
| sostenibilidad | OK 1367 ms | OK 1612 ms |
| sroi | OK 1556 ms | OK 1686 ms |

Capturadas con `npm run preview` (puerto 4173, build prod), no con `npm run dev`. Comparabilidad asegurada.

Cada PNG es viewport-clip (no `fullPage`) — la comparación post-refactor mide el viewport visible al cargar cada tab, no el scroll completo. Si F4 introduce sentinel scrolls (lazy-load), revisar.

## Gates derivados para cierre F2

- **Bundle delta** (post-refactor vs este baseline):
  - **Trigger**: `dist/` > 773 KB (+5%) **OR** chunk JS raw > 785 KB (+5%) **OR** chunk JS raw delta > +10 KB absoluto, lo más conservador.
  - Si supera: escalar antes de cerrar.
- **Visual diff** (`audit/baseline/v2-after/` vs `audit/baseline/v2/`):
  - Umbral: 16/16 con diff < 0,1% (pixelmatch `{ threshold: 0.1, includeAA: false }`).
  - NO aflojar a 0,2%.

## Estado

PM7 cerrado. Sin bloqueos. Listo para arrancar commits 1-10.
