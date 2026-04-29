# Validación post-push — pasos 3-5 del CLOSEOUT F2

Fecha: 2026-04-29
Branch: refactor/v2 (HEAD `e43f1e2`)
Preview URL: https://ban-co-2-git-refactor-v2-andres-s-projects-ee165711.vercel.app
Production main URL: https://evaluacionbanco2.com (commit 3d50da2)
Vercel deploy: `dpl_6y4WJp2iZoAqFKbwk6r2QJTm4mTs` (build 15s, Ready)

## Paso 3 — Smoke 8 tabs × 2 viewports

Script: `audit/baseline/smoke_preview.mjs --bypass-token <token>` (Vercel deployment-protection bypass via header `x-vercel-protection-bypass`).

**16/16 OK · 0 errores rojos totales.**

| Sección | desktop err/warn | mobile err/warn |
|---|---|---|
| geografia | 0 / 0 | 0 / 0 |
| poblacion | 0 / 3 | 0 / 3 |
| ambiental | 0 / 3 | 0 / 3 |
| social | 0 / 7 | 0 / 7 |
| economica | 0 / 8 | 0 / 8 |
| gobernanza | 0 / 4 | 0 / 4 |
| sostenibilidad | 0 / 4 | 0 / 4 |
| sroi | 0 / 1 | 0 / 1 |

**Warnings identificados (no bloqueantes, pre-existentes pre-F2):**

1. **Tailwind CDN warning** — `cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI`. Origen: `index.html` línea 7 (`<script src="https://cdn.tailwindcss.com">`). NO regresión F2. Candidato F3 (decisión stack).

2. **Recharts ResponsiveContainer width(-1)** — `The width(-1) and height(-1) of chart should be greater than 0`. Warning durante el primer mount cuando el container aún no calculó dimensiones. Render correcto post-mount. Conocido de recharts 3.x. NO regresión F2.

**Veredicto Paso 3**: PASS (0 errores rojos). Warnings documentados como deuda pre-existente.

## Paso 4 — axe-core retroactivo (gate informativo)

Script: `audit/baseline/axe_smoke.mjs --preview <url> --bypass-token <token>`. Tags: `wcag2a, wcag2aa, wcag21a, wcag21aa`.

| Métrica | preview F2 | prod main | Delta |
|---|---|---|---|
| violations | 2 | 2 | **0** |
| passes | 21 | 21 | 0 |

**Mismas violations en preview y prod** (deuda a11y pre-F2):

- `button-name` (critical, 1 nodo) — "Ensure buttons have discernible text". Probablemente algún botón con icono solo y sin `aria-label`.
- `color-contrast` (serious, 4 nodos) — "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio".

**Veredicto Paso 4**: PASS. Delta = 0 violations, 0 nuevas en F2. F2 NO regresa a11y. Las 2 violations son candidatos para F4 (visual polish + a11y fixes).

## Paso 5 — Lighthouse mobile (3 corridas + referencia prod)

Script: `audit/baseline/lighthouse_mobile.mjs --preview <url> --bypass-token <token>`.

Form factor: mobile (360×640 @2x). Throttling: rttMs=150, throughputKbps=1638.4, cpuSlowdownMultiplier=4 (estándar mobile slow 4G).

### Corridas

| Run | Performance | Accessibility | LCP | TBT | CLS |
|---|---|---|---|---|---|
| preview run 1 | 56 | 94 | 4041 ms | 972 ms | 0.000 |
| preview run 2 | 64 | 94 | 3953 ms | 619 ms | 0.027 |
| preview run 3 | 50 | 94 | 4238 ms | 1419 ms | 0.000 |
| **preview mediana** | **56** | **94** | **4041 ms** | — | — |
| prod (referencia) | 51 | 94 | 4210 ms | 1343 ms | 0.000 |

### Comparación vs baseline F0 (`audit/baseline/lighthouse-summary.md`)

Baseline F0: Performance 46, Accessibility 94, LCP 4239 ms.

| Métrica | F0 baseline | preview F2 (mediana) | Δ vs F0 | Gate |
|---|---|---|---|---|
| Performance | 46 | **56** | **+10 puntos** | ≥ 40 ✓ |
| Accessibility | 94 | **94** | 0 | ≥ 94 ✓ |
| LCP | 4239 ms | **4041 ms** | **-198 ms** | ≤ 4500 ms ✓ |

### Comparación vs prod main (commit 3d50da2)

| Métrica | prod (commit 3d50da2) | preview F2 (mediana) | Δ vs prod |
|---|---|---|---|
| Performance | 51 | 56 | +5 |
| Accessibility | 94 | 94 | 0 |
| LCP | 4210 ms | 4041 ms | -169 ms |

**Veredicto Paso 5**: 3/3 gates PASS. F2 mejora ligeramente Performance y LCP vs prod (probable consecuencia del code-splitting de Vite sobre los componentes modulares vs el monolito). A11y idéntico.

## Resumen — validación post-push completa

| Paso | Resultado | Bloquea merge? |
|---|---|---|
| Paso 1 (/ultrareview local) | 0 hallazgos | No |
| Paso 2 (push origin/refactor/v2) | Vercel build OK | No |
| Paso 3 (smoke 8 tabs × 2 viewports) | 16/16 OK · 0 errores rojos | No |
| Paso 4 (axe-core delta) | delta = 0 violations | No |
| Paso 5 (Lighthouse mobile mediana) | 3/3 gates PASS | No |

**Estado**: listo para Paso 6 (PR refactor/v2 → main + merge), decisión humana.

## Observaciones para F3+

1. **Tailwind CDN → PostCSS plugin**: warning recurrente en console; F3 evaluará migración. Beneficio adicional: tree-shake de clases no utilizadas (reduce bundle ~30-50 KB típicamente).

2. **a11y deuda pre-existente** (2 violations): F4 (visual polish) es el momento natural para resolverlas. Ya están enumeradas en este reporte; no requiere question/NNN.

3. **Performance F2 +10 puntos** vs F0: hipótesis razonable es que Vite hizo mejor minificación con módulos separados. Si F3 introduce code-splitting real (lazy-load de componentes SROI), debería mejorar más.
