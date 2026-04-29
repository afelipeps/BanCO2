# Dead code eliminado en F2

Fecha: 2026-04-28
Commit: db221a2 (9a — `chore(ts): enable strict + noImplicitAny`)
Branch: refactor/v2

## StoryBox keyword auto-detection

### Comportamiento previo (pre-F2)

`components/StoryBox.tsx` (original, ~38 líneas) recibía `type?: 'info' | 'alert' | 'success' | string`. Si el caller NO pasaba `type` explícito, el componente derivaba el `derivedType` por keyword matching sobre `title`:

```ts
let derivedType: 'info' | 'alert' | 'success' = type as any;
if (!['info', 'alert', 'success'].includes(type)) {
  derivedType = 'info';
  if (title.includes("DOLOR") || title.includes("Riesgo") || /* ...19 keywords... */) derivedType = "alert";
  if (title.includes("VICTORIA") || title.includes("Logrado") || /* ...14 keywords... */) derivedType = "success";
}
```

Las listas de keywords incluían:
- **alert**: DOLOR, Riesgo, Déficit, Alerta, Amenaza, Debilidad, Desacople, Erosión, Divergencia, Impuntualidad, Justicia, Alta Fricción, Dependencia, Fragilidad, Equidad, Brecha, Estancamiento, Subsidiada, Tensión, Disparidad
- **success**: VICTORIA, Logrado, Fortaleza, Minimo, Estratégico, Semilla, Orgullo, Expansión, Salto, Embudo, Consolidación, Rentabilidad, Potencial, Capital

### Comportamiento actual (post-F2)

`src/components/StoryBox.tsx` recibe `type?: StoryType` con `StoryType = 'info' | 'alert' | 'success'` (sin escape `| string`). Si `type` es undefined, default a `'info'` vía destructuring default. **No hay keyword matching.**

`src/App.tsx` siempre coalesce antes de pasar a StoryBox:

```tsx
type={indicator.story.type || (indicator.isAlert ? 'alert' : 'info')}
```

Resultado: `StoryBox` siempre recibe una literal del union estricto. Nunca `'success'` (porque `App.tsx` no lo deriva del `isAlert` solamente, y data.tsx no pasa `story.type` explícitamente en ningún indicador).

### Evidencia de dead code

PM5 verificó (`pre-migración` commit `a3423fb`):

```bash
grep -cE "type:\s*['\"](info|alert|success|warning)['\"]" data.tsx
# 0
```

Cero indicadores en data.tsx pasan `story.type` explícito. La única ruta que tocaba la auto-detección era cuando alguien pasara una literal **fuera** del union (e.g., `type: 'foo bar'`), lo cual nunca ocurría.

Commit 6 migró los 53 indicadores a `src/data/` preservando byte-a-byte: ninguno introduce `story.type`. Confirmado runtime con visual diff 16/16 PASS post-9a (commit 2e51c84).

### Implicación para F5 (storytelling)

Si F5 introduce un indicador con `story.type='success'`, **debe pasarlo explícito en el data file**. El sistema de tipos lo soporta:

```ts
{
  id: 'X1',
  // ...
  story: {
    title: 'Victoria',
    text: '...',
    type: 'success', // ← acepta literal del union
  },
}
```

Si F5 quiere de vuelta el auto-derive (parsing del title), **NO** restaurarlo en `StoryBox.tsx`. Reintroducir como helper testeable en `src/lib/story.ts`:

```ts
// src/lib/story.ts (propuesta F5, fuera de scope F2)
export function deriveStoryType(title: string, isAlert?: boolean): StoryType {
  if (/* keywords alert */) return 'alert';
  if (/* keywords success */) return 'success';
  return isAlert ? 'alert' : 'info';
}
```

Y testear independientemente. Razón: el componente `StoryBox` debe ser puro/declarativo; la heurística de derivación tiene sentido como utilidad separada con contrato testeable.

### Decisión revisable

F5 debe confirmar:
1. ¿Necesita el auto-derive por keywords? (si sí: reintroducir como helper, NO como lógica embebida en StoryBox)
2. ¿O conviene editar data.tsx para que cada indicador pase `story.type` cuando aplique success/alert? (más explícito pero más verboso)

Opción 2 es preferible para la auditabilidad — match con el principio de `disclosure` obligatorio (post-F5).

### Trazabilidad runtime

El visual diff F2 (`audit/baseline/v2-diff/`, 16/16 PASS) confirma cero diferencia perceptual entre la implementación previa y la actual sobre los 53 indicadores reales. Esta documentación garantiza que F5 puede revertir o evolucionar la decisión sin arqueología de git history.
