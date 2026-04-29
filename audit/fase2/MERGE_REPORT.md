# F2 — Reporte de cierre post-merge

Fecha merge: 2026-04-29 (UTC `2026-04-29T18:46:08Z`)
Merge commit: `fa59b463edbd12436f05a938f95693ad821515fc`
Tag: `v0.2.0` apunta a `ef1ef7e8b7355c82d591b97edd51e4591803b229` (version bump post-merge)
Tag SHA: `e2a69538a9f6a41c9508830449f369afe79c53e1` (annotated tag object)
GitHub Release: https://github.com/afelipeps/BanCO2/releases/tag/v0.2.0
Sesión: continuación post-/ultrareview + pre-merge gates + 8 pasos plan crítico

## Pre-merge state

- **PR #1**: state `MERGED`, mergeable `MERGEABLE`, mergeStateStatus `CLEAN`
- **Diff stats vs main**: **+21370 / -1721 sobre 135 archivos**
  - `src/` (código fuente): +3183 sobre 44 archivos (refactor real)
  - `audit/` (docs + scripts + baselines): +9666 sobre 55 archivos
  - resto (135 - 44 - 55 = 36 files): package.json/lock, removidos shims raíz (`types.ts`, `data.tsx`, `theme.ts`, `components/`)
- **Diferencia +3191 líneas vs estimado original** (+18179): 4 commits docs/audit-f2 legítimos agregados post-/ultrareview con resultados de validación pre-merge:
  - `0da585f` preview validation pasos 3-5
  - `6f563de` Lighthouse extendido a 5 runs
  - `f87325e` PR_BODY consolidado
  - `e43f1e2` V3 inspection scope debt + KpiCard regression test debt
  Estos commits son docs trazables, no código fuente — el contrato del refactor (src/) sigue siendo `+3183` líneas netas.
- **Checks**: Vercel build pass · Vercel Preview Comments pass
- **5/5 gates pre-merge verde**:
  1. /ultrareview local: 0 hallazgos
  2. push origin/refactor/v2: Vercel build OK
  3. smoke 8 tabs × 2 viewports en preview: 16/16 OK · 0 errores rojos
  4. axe-core delta preview vs prod: 0 violations nuevas
  5. Lighthouse mobile mediana de 5 runs: Perf 61, A11y 94, LCP 3928 ms (3/3 gates PASS)

## Merge execution

- **Estrategia**: `gh pr merge 1 --merge --delete-branch=false`
- **Razón `--merge` (no `--squash`)**: preservar los 23 commits granulares de F2 para `git blame` / `git bisect` / revert quirúrgico. La granularidad es operativamente útil; el resumen consolidado vive en `audit/fase2/PLAN.md` y `CLOSEOUT.md`.
- **Branch `refactor/v2`**: conservado en remoto (`--delete-branch=false`) para trazabilidad y posible cherry-pick.
- **Merge commit message**: heredado del título del PR ("refactor(v2): Fase 2 — arquitectura modular + strict TS + tests")

## Post-merge validation (sesión actual)

Ejecutado tras `git checkout main && git pull origin main`:

| Check | Resultado |
|---|---|
| `LOCAL_SHA` == `MERGE_SHA` | MATCH (`fa59b46`) ✓ |
| `npm install` | OK, sin warnings críticos |
| `npx tsc --noEmit` (strict + noImplicitAny + noUncheckedIndexedAccess) | exit 0 ✓ |
| `npm run test` | 35/35 pass ✓ |
| `npm run build` | OK · `dist/` = 736 KB · chunk `index-aVaBvwIj.js` (732 KB raw) |
| 0 `: any` en `src/` | ✓ |
| 0 `as any` en `src/` | ✓ |

## Vercel auto-deploy a Production

- **Auto-deploy desde `main` está ACTIVO** (verificado vía observación post-merge — Vercel CLI no expone el setting directamente, pero el deploy se creó automáticamente 2 min tras el merge sin intervención manual)
- **Deployment ID**: `dpl_4g63WyepNECRCMbXK3a9CYtvYEnP`
- **Deployment URL**: https://ban-co-2-8ev3c4qqm-andres-s-projects-ee165711.vercel.app
- **Status**: Ready (build 19s)
- **Custom domain `evaluacionbanco2.com`**: re-routed correctamente al deploy nuevo. `curl https://evaluacionbanco2.com/?_cb=$(date +%s) | grep index-` retorna `index-aVaBvwIj.js` = match con build local actual.

## Smoke prod (16/16 OK)

Ejecutado con `audit/baseline/smoke_preview.mjs --url https://evaluacionbanco2.com` (sin `--bypass-token` porque prod es público).

```
OK   geografia       desktop  err=0 warn=0 failedReq=0
OK   poblacion       desktop  err=0 warn=3 failedReq=0
OK   ambiental       desktop  err=0 warn=3 failedReq=0
OK   social          desktop  err=0 warn=7 failedReq=0
OK   economica       desktop  err=0 warn=8 failedReq=0
OK   gobernanza      desktop  err=0 warn=4 failedReq=0
OK   sostenibilidad  desktop  err=0 warn=4 failedReq=0
OK   sroi            desktop  err=0 warn=1 failedReq=0
OK   geografia       mobile   err=0 warn=0 failedReq=0
OK   poblacion       mobile   err=0 warn=3 failedReq=0
OK   ambiental       mobile   err=0 warn=3 failedReq=0
OK   social          mobile   err=0 warn=7 failedReq=0
OK   economica       mobile   err=0 warn=8 failedReq=0
OK   gobernanza      mobile   err=0 warn=4 failedReq=0
OK   sostenibilidad  mobile   err=0 warn=4 failedReq=0
OK   sroi            mobile   err=0 warn=1 failedReq=0

16/16 OK · 0 errores totales
```

**Tree-shake del DEV warning verificado en prod**: `[F2-debt]` warning **NO** apareció en ninguna celda (con el script ampliado para detectar leaks específicamente). Confirma que `if (import.meta.env.DEV)` se elimina en build prod por Vite.

**Failed requests**: 0 en todas las celdas.

**Warnings** (43 totales, idénticos al preview, ninguno bloqueante):
- Tailwind CDN deprecation (pre-F2, candidato F3)
- recharts ResponsiveContainer width(-1) durante mount (pre-F2, conocido del lib)

## Tag y release

- **Version bump commit**: `ef1ef7e` "chore(release): bump version to 0.2.0 (F2 closure)" — sincroniza `package.json` con el tag
- **Smoke improvements commit**: `4ea5622` "feat(audit-baseline): add failedRequests + F2-debt leak detection to smoke" — agrega features pedidas para verificación prod
- **Tag annotated `v0.2.0`** apunta a `ef1ef7e` (no al merge commit, ni al smoke improvements). SemVer pre-1.0 (segunda iteración del proyecto desde 0.0.0 inicial). Mensaje del tag incluye:
  - Estructura: discriminated union 18 variantes, src/ scaffolded
  - TypeScript: strict + noImplicitAny + noUncheckedIndexedAccess
  - Tests: 35/35, coverage 92.8%
  - Métricas: bundle delta +0.99 kB, visual diff 16/16, Lighthouse Perf 61/A11y 94/LCP 3928ms (mediana 5 runs)
  - Deuda heredada link a `audit/fase2/`
- **GitHub Release**: https://github.com/afelipeps/BanCO2/releases/tag/v0.2.0 con notes desde `audit/fase2/PR_BODY.md`

## Deuda heredada (queue F3-F5)

- **49 indicadores sin disclosure individual** (45 no-SROI + 4 SROI con herencia section-level): runtime warning loggea en dev. Cierre F4/F5. Detalle: [`audit/fase2/disclosure_debt.md`](./disclosure_debt.md).
- **axe-core retroactivo**: delta = 0 violations vs prod main pre-F2. Las 2 violations existentes (`button-name` critical 1 nodo, `color-contrast` serious 4 nodos) son deuda pre-F2 candidata para F4 (visual polish).
- **Lighthouse Performance baseline post-F2**: 61 mobile (vs F0 baseline 46 = +15 puntos, vs prod pre-F2 56 = +5 puntos). LCP 3928 ms (-311 ms vs F0). Si F3 introduce code-splitting real (lazy-load SROI), debería mejorar más.
- **Backlog visual** ([`backlog/fase4_visuales.md`](../../backlog/fase4_visuales.md)): existe (verificado pre-paso 6). Issues visuales para F4 enumerados ahí.
- **Test de regresión KpiCard NO agregado** en commit `734fa7d` (solo restauración del código byte-a-byte). Si F4/F5 toca KpiCard o introduce un trend con keywords críticas ('Déficit'/'Riesgo'/'Atención'), agregar test ANTES de modificar. Detalle: [`audit/fase2/scope_review.md`](./scope_review.md).
- **V3 inspección asimétrica**: 14 componentes (charts/*, tables/*, sroi/* excepto los 4 con pasada profunda) recibieron inspección menos detallada. Si F4 modifica cualquiera, hacer pasada byte-a-byte contra `git show 3d50da2:components/IndicatorRenderer.tsx`. Detalle: [`audit/fase2/scope_review.md`](./scope_review.md).
- **Tailwind CDN warning**: `cdn.tailwindcss.com should not be used in production` (pre-F2). Candidato F3 para migrar a PostCSS plugin. Beneficio adicional: tree-shake de clases ~30-50 KB.
- **importmap dead code**: `index.html` declara importmap esm.sh para React/recharts/lucide pero Vite bundlea desde node_modules. Es código muerto en prod. Candidato F3.
- **StoryBox keyword auto-detection eliminada** (era dead code post-strict). Si F5 quiere indicadores con `story.type='success'`, pasarlo explícito en data. Detalle: [`audit/fase2/dead_code_removed.md`](./dead_code_removed.md).
- **Vercel preview Lighthouse cold-start**: 3 runs daban varianza 14 pts; 5 runs convergen a 4. Lección operativa: para gates Lighthouse sobre Vercel preview, default a 5 runs (no 3).

## Lecciones operativas (queue F3+)

1. **Visual diff cero NO valida lógica byte-a-byte** (lección V3 KpiCard): refactors estructurales requieren pasada manual sobre condicionales no-ejercitadas con la data actual.
2. **Verificación de scope MCPs antes de delegar**: gh + vercel CLI deben estar instalados y autenticados. Para Vercel preview con deployment-protection: bypass token vía header `x-vercel-protection-bypass`.
3. **Lighthouse 5 runs > 3** cuando varianza Performance > 10 puntos. Implementar Hodges-Lehmann simplificado (descarta extremos) para mediana robusta.
4. **Bundle delta gate**: usar absoluto (+10 kB) además de relativo (+5%). Con bundle base pequeño, % puede engañar.
5. **Tree-shake de código DEV verificable** con grep en bundle prod (`grep -c "F2-debt" dist/assets/*.js → 0`).
6. **Bypass token Vercel para deploys protegidos**: env var `VERCEL_BYPASS_TOKEN` o flag `--bypass-token`, NUNCA commiteado.
7. **`gh pr merge --merge` (no --squash)** para refactors estructurales: preservar commits granulares es operativamente más valioso que un main "limpio".
8. **Auto-deploy Vercel desde main**: el setting NO es visible vía CLI directamente. Verificar empíricamente post-merge (deploy aparece automáticamente con target=production y SHA del merge).

## Próximos pasos

- **F3 — Decisión stack visual**: arrancar en sesión fresca con HANDOFF F3 (paso 7 de este cierre).
- **NO arrancar F3 en esta sesión**: cambio de modo (ejecución → análisis comparativo de bibliotecas) merece sesión nueva.
- HANDOFF F3 generado en `audit/fase3/HANDOFF.md` con: contexto F2 cerrada, objetivo F3, candidatos a evaluar, plan según roadmap maestro, lecciones aplicables, comando arranque sugerido, anti-objetivos.

## Veredicto

**F2 cerrada · v0.2.0 etiquetada · prod sirve refactor verificado · 0 regresiones · deuda trazable a F4/F5.**
