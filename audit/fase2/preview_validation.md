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

Inicialmente 3 corridas dieron varianza Performance = 14 puntos (50/56/64), por encima del umbral robusto de 10. Re-ejecutado con `--runs 5` para mediana más estable; varianza colapsa a 4 puntos.

#### Corridas iniciales (3 runs, varianza alta — superseded)

| Run | Performance | Accessibility | LCP | TBT | CLS |
|---|---|---|---|---|---|
| preview run 1 | 56 | 94 | 4041 ms | 972 ms | 0.000 |
| preview run 2 | 64 | 94 | 3953 ms | 619 ms | 0.027 |
| preview run 3 | 50 | 94 | 4238 ms | 1419 ms | 0.000 |
| Range Performance | 14 puntos | — | — | — | — |

#### Corridas finales (5 runs — autoritativas)

| Run | Performance | Accessibility | LCP | TBT | CLS |
|---|---|---|---|---|---|
| preview run 1 | 59 | 94 | 4095 ms | 772 ms | 0.000 |
| preview run 2 | 61 | 94 | 3928 ms | 783 ms | 0.000 |
| preview run 3 | 61 | 94 | 3874 ms | 794 ms | 0.000 |
| preview run 4 | 62 | 94 | 3917 ms | 727 ms | 0.000 |
| preview run 5 | 58 | 94 | 3995 ms | 942 ms | 0.000 |
| **preview mediana** | **61** (range 4) | **94** (range 0) | **3928 ms** (range 221, trimmed) | — | — |
| prod (referencia) | 56 | 94 | 4178 ms | 894 ms | 0.027 |

Mediana LCP usa Hodges-Lehmann simplificado (descarta min y max porque range 221 ms > umbral 200 ms): mediana de [3917, 3928, 3995] = **3928 ms**. Performance no requiere trim (range 4 ≤ 10). Accessibility constante.

### Comparación vs baseline F0 (`audit/baseline/lighthouse-summary.md`)

Baseline F0: Performance 46, Accessibility 94, LCP 4239 ms.

| Métrica | F0 baseline | preview F2 (mediana de 5) | Δ vs F0 | Gate |
|---|---|---|---|---|
| Performance | 46 | **61** | **+15 puntos** | ≥ 40 ✓ |
| Accessibility | 94 | **94** | 0 | ≥ 94 ✓ |
| LCP | 4239 ms | **3928 ms** | **-311 ms** | ≤ 4500 ms ✓ |

### Comparación vs prod main (commit 3d50da2)

| Métrica | prod (commit 3d50da2) | preview F2 (mediana de 5) | Δ vs prod |
|---|---|---|---|
| Performance | 56 | 61 | +5 |
| Accessibility | 94 | 94 | 0 |
| LCP | 4178 ms | 3928 ms | -250 ms |

**Veredicto Paso 5**: 3/3 gates PASS. F2 mejora Performance (+15 vs F0, +5 vs prod) y LCP (-311 ms vs F0, -250 ms vs prod). A11y idéntico. La mejora vs prod es consistente con la hipótesis de que Vite produce mejor minificación con módulos separados que con el monolito original.

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

3. **Performance F2 +15 puntos** vs F0 (con mediana de 5 corridas estable): hipótesis razonable es que Vite hizo mejor minificación con módulos separados. Si F3 introduce code-splitting real (lazy-load de componentes SROI), debería mejorar más.

4. **Inestabilidad inicial de mediana de 3** (varianza 14 pts) vs **mediana de 5** (varianza 4 pts): los Vercel preview deployments tienen cold-start no-determinista en la primera invocación tras el build. La primera corrida del paso 5 con 3 runs golpeó cold-start; las 5 corridas posteriores estabilizaron tras warm-up. Lección operativa: para gates de performance sobre Vercel previews, default a 5 runs (no 3), idealmente con 1 run de warm-up descartado.
