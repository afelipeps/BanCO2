# 009 — Ancla "Continuaría sin pago 100%" vs real 98,75%

**Estado:** **resuelta empíricamente — ancla 100% confirmada** (Andrés, 2026-04-18) · **Contexto:** auditoría Fase 1 sección Social · **Afecta:** ancla `<anchors>` del `CLAUDE.md` "Continuaría sin pago: 100% (n=80)".

## Resolución empírica

El caso "disidente" respondió **"Mucho"** (semánticamente afirmativo intensificado, no negación). El ancla 100% es **correcta**. La auditoría de Social no normalizó la categórica; el cálculo estricto `= 'Sí'` excluyó el caso `'Mucho'` que también es positivo.

Bajo normalización `TRIM(LOWER(...)) IN ('si','sí','mucho')`: **80/80 = 100%** → ancla reconcilia.

## Acciones operativas

1. **`social_audit.py` — S_ANCLA**: cambiar query strict-equality por normalización categórica:
   ```sql
   COUNT(*) FILTER (WHERE TRIM(LOWER("6.4_Continuaria_Sin_Pago")) IN ('si', 'sí', 'mucho'))
   ```

2. **`common.py` — nueva utility**: agregar `validate_cardinality(series, declared_n_categories) -> dict`. Reporta valores fuera del set esperado para columnas documentadas como n-categóricas en `Diccionario_Datos`. Retorna dict con valores únicos observados, esperados, y casos atípicos para revisión manual.

3. **Política para Tiempo 3**: aplicar `validate_cardinality` preventivamente a todas las columnas categóricas declaradas en `Diccionario_Datos` antes de calcular proporciones.

4. **`CLAUDE.md <statistical_rules>`**: agregar regla:
   > Antes de calcular proporciones sobre categóricas, ejecutar `validate_cardinality` contra `Diccionario_Datos`. Reportar valores fuera del set declarado.

## Contexto

El bloque `<anchors>` del `CLAUDE.md` declara:

> Continuaría sin pago: 100% (n=80)

El auditor de Social computó contra `Datos_Normalizados` (variable por identificar, probablemente una columna Sí/No sobre intención de continuar conservando sin incentivo):

- k = 79 (dijeron "Sí")
- n = 80
- **p_real = 98,75%**
- Diff contra ancla = **1,25 pp** (exactamente en el umbral "nota → handoff" del piloto).

Un solo caso respondió distinto al 100%.

## La pregunta específica

¿El ancla del `<anchors>` "100%" es:

- **Defectuoso** (el caso real es 79/80 y hay que corregir la cifra a "98,75% (79/80)")
- **Correcto** (el auditor interpretó mal la variable fuente o incluyó un caso con missing que debería haberse excluido)
- **Narrativo** ("100%" como cifra redonda que acepta un caso marginal)

## Investigación pendiente

1. **Identificar la variable fuente exacta en `Diccionario_Datos`.** Candidatas: probablemente una columna tipo `3.X_Continuaria_Sin_Pago` o similar. El auditor de Social la inferió pero no dejó el nombre exacto en el log.
2. **Revisar el único caso disidente**: ¿es una respuesta genuina "No continuaría" o es un NaN / respuesta en blanco convertida por el auditor a "No"?
3. **Consultar la tesis**: ¿reporta 100% (con el mismo n) o el 98,75% se menciona en algún pie de tabla?

## Opciones

### A — Corregir ancla a "98,75% (79/80)" si la variable fuente es unívoca

Actualizar `CLAUDE.md <anchors>`:

```diff
-Continuaría sin pago: 100% (n=80)
+Continuaría sin pago: 98,75% (79/80; IC95 Wilson [93,25; 99,78])
```

**Pros:** verdad empírica; evita pretender consenso perfecto que no existe.
**Contras:** la narrativa "100%" es potente y forma parte del discurso institucional del dashboard. Cambio semántico no trivial.

### B — Validar el caso disidente y, si es NaN/missing, ajustar denominador

Si el caso "No" resulta ser un NaN que el auditor imputó incorrectamente como "No", el cálculo correcto sería 79/79 = 100% con n_efectivo = 79 (reportando missing rate 1,25%).

**Pros:** preserva el ancla sin violar estadística.
**Contras:** requiere inspección manual del xlsx.

### C — Mantener ancla como "100% redondeado" con disclaimer

Dejar el ancla como está y anotar en el REPORT que 1/80 caso responde en negativo pero se redondea al alza.

**Pros:** cero cambio.
**Contras:** viola `<statistical_rules>` que exige "precisión máx 1 decimal con n<100" — 100% vs 98,75% son interpretables al decimal.

## Recomendación tentativa

**Opción B primero, A si B no aplica.** Antes de corregir el ancla, el auditor de Social debe verificar si el único caso disidente es genuino o missing. Si es missing, la aclaración es sólo una nota al pie del KPI. Si es genuino, corregir el ancla.

## Bloqueante

Ligero. El piloto de Fase 1 no cierra hasta resolver esta ancla porque afecta directamente una cifra del `<anchors>`. No detiene otros auditores pero requiere resolución antes de pasar a Fase 3.

## No ejecutar

Andrés decide cuál opción adoptar una vez revisado el caso disidente.
