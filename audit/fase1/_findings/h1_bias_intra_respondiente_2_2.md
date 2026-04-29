# H1 — Bias intra-respondiente en los 5 ejes `2.2_Mejoro_*_SiNo`

**Estado:** finding cerrado · **Fecha:** 2026-04-28 · **Sección afectada:** Ambiental (auditada Tiempo 2) + Sostenibilidad ST5 (Tiempo 3, descubrimiento)
**Resolución del ancla `<anchors>` "Mejora ambiental percibida 97,5% en todos los ejes".**

---

## Hallazgo

Los 5 ejes evaluados en la batería `2.2_Mejoro_*_SiNo` (densidad arbórea, fauna, cantidad de agua, calidad de agua, aire puro) presentan **correlación perfecta inter-respondiente** (φ=1,000 en los 10 pares). Los **mismos 2 encuestados** respondieron 'No' en los 5 ejes; los **78 restantes** respondieron 'Sí' en los 5 ejes. **Cero respuestas mixtas.**

El ancla "97,5% en todos los ejes" es matemáticamente idéntica al porcentaje de respondientes que dicen "Sí en todo": 78/80 = 97,5%, IC95 Wilson [91,34%, 99,31%].

## Evidencia (microdatos, n=80)

### Conteos por columna

| Columna | Sí | No | NA |
|---|---:|---:|---:|
| `2.2_Mejoro_Densidad_Arboles_SiNo` | 78 | 2 | 0 |
| `2.2_Mejoro_Fauna_SiNo` | 78 | 2 | 0 |
| `2.2_Mejoro_Cantidad_Agua_SiNo` | 78 | 2 | 0 |
| `2.2_Mejoro_Calidad_Agua_SiNo` | 78 | 2 | 0 |
| `2.2_Mejoro_Aire_Puro_SiNo` | 78 | 2 | 0 |

### Matriz de correlación φ (Pearson sobre dummies binarios)

```
                                 D.Arb  Fauna  C.Agua C.Cal  Aire
2.2_Mejoro_Densidad_Arboles_SiNo  1.00   1.00   1.00   1.00   1.00
2.2_Mejoro_Fauna_SiNo             1.00   1.00   1.00   1.00   1.00
2.2_Mejoro_Cantidad_Agua_SiNo     1.00   1.00   1.00   1.00   1.00
2.2_Mejoro_Calidad_Agua_SiNo      1.00   1.00   1.00   1.00   1.00
2.2_Mejoro_Aire_Puro_SiNo         1.00   1.00   1.00   1.00   1.00
```

Los 10 pares fuera de diagonal son φ = 1,000 exacto.

### Distribución de patrones de respuesta

Con suma de "Sí" por respondiente (rango 0-5):

| Suma de "Sí" | n encuestados |
|---:|---:|
| 0 (todos "No") | 2 |
| 1 | 0 |
| 2 | 0 |
| 3 | 0 |
| 4 | 0 |
| 5 (todos "Sí") | 78 |

**Mixtas (1-4): 0/80 = 0,00%.**

## Interpretación

La intersección estricta = el promedio individual = 97,5%. No hay diferenciación inter-eje a nivel de respondiente. Posibles explicaciones (no mutuamente excluyentes):

1. **Acquiescence bias / halo effect**: respondiente que percibe mejora general "marca todo Sí" sin discriminación por dimensión.
2. **Pregunta administrada en batería con halo**: el formato de la encuesta presentó los 5 ítems en bloque continuo, induciendo respuesta uniforme.
3. **Mejora ambiental real es percepción unidimensional**: las 5 dimensiones cargan en un único factor latente "ambiente mejor o no". No es bias, es la estructura real del constructo en esta población.

Los datos disponibles no permiten distinguir entre las 3 hipótesis. Pero **la consecuencia operativa es la misma**: reportar los 5 ejes como indicadores independientes induce la falsa apariencia de validación cruzada cuando en realidad es **una sola dimensión replicada 5 veces**.

## Implicación para el dashboard

### Acción ahora (metadata)

El ancla `<anchors>` "Mejora ambiental percibida 97,5% en todos los ejes" es **válida numéricamente** pero requiere **reinterpretación narrativa**: no son 5 evidencias convergentes, son 1 índice unidimensional con n=80 y consistencia perfecta intra-respondiente.

### Acción Fase 4 (visual + narrativa) — queue

Reemplazar los 5 charts por **un solo chart Wilson IC95** con:

- **Título**: "Mejora ambiental percibida (índice agregado)"
- **Subtítulo**: "78/80 = 97,5%, IC95 [91,4%, 99,3%]"
- **Footer**: "Los 5 ejes evaluados (densidad arbórea, fauna, cantidad de agua, calidad de agua, aire) muestran correlación perfecta inter-respondiente (φ=1,00, n=80). Se reportan agregados como índice unidimensional. Lectura por eje individual no es interpretable."

Documentado en `backlog/fase4_visuales.md` para ejecución post-Fase 1.

## Reproducibilidad

Query verificación (DuckDB):

```sql
SELECT
  "2.2_Mejoro_Densidad_Arboles_SiNo",
  "2.2_Mejoro_Fauna_SiNo",
  "2.2_Mejoro_Cantidad_Agua_SiNo",
  "2.2_Mejoro_Calidad_Agua_SiNo",
  "2.2_Mejoro_Aire_Puro_SiNo"
FROM datos
```

Script de verificación: ad-hoc en `audit/fase1/_findings/h1_bias_intra_respondiente_2_2.md` (este archivo). Re-ejecutable con `.venv/Scripts/python.exe` + `audit/fase1/scripts/common.py`.

## Cross-references

- Tiempo 2 sección Ambiental: ancla 97,5% reportada como 5 indicadores independientes.
- Tiempo 3 sección Sostenibilidad ST5: descubrimiento original — el ancla NO es ST5 (motivación principal), es esta batería 2.2.
- `audit/fase1/sostenibilidad_REPORT.md` sección H1.
- `backlog/fase4_visuales.md` acción visual H1.
