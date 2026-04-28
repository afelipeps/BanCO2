# Resolución PSA mensual — fórmula canónica

**Estado:** ESCENARIO 1 (reconcilia exacto). · **Sub-agente:** Económica (Tiempo 3) · **Fecha:** 2026-04-28 · **Para uso de:** Sub-agente Sostenibilidad (Tiempo 3) si necesita PSA por sexo.

## Decisión

**Fórmula canónica adoptada:** mediana de `PROMEDIO MENSUAL 2022-2023` por SEXO sobre subgrupo `CATEGORÍA = 'Familia Campesina'` (n=134; H=97, M=37).

## Reconciliación con anclas tesis

| Subgrupo | Mediana microdato | Ancla tesis | Diff (COP) | Diff relativo | IQR | n |
|---|---:|---:|---:|---:|---:|---:|
| Hombres | 215.687,5 | 215.688 | -0,5 | 0,00% | [179.739, 277.312] | 97 |
| Mujeres | 277.312,5 | 277.312 | +0,5 | 0,00% | [215.687, 277.312] | 37 |

Ambos reconcilian **exactamente** dentro de la precisión de redondeo (las anclas tesis están redondeadas al entero). El ancla original parece haber sido truncada (`floor`) mientras el cálculo real es `round_half_up`, lo que explica los ±0,5 COP.

## Fórmulas alternativas descartadas

| Fórmula | Mediana H | Mediana M | Diff vs ancla H | Diff vs ancla M | Reconcilia? |
|---|---:|---:|---:|---:|---|
| `VALOR MENSUAL 2022` | 210.000 | 270.000 | -2,64% | -2,64% | NO |
| `VALOR MENSUAL 2023` | 221.375 | 284.625 | +2,64% | +2,64% | NO |
| **`PROMEDIO MENSUAL 2022-2023`** | **215.687,5** | **277.312,5** | **0%** | **0%** | **SÍ (canon)** |

## Sanity check vs summary embedded del xlsx (rows 146-147)

| Estadística | H summary | M summary | H computado | M computado |
|---|---:|---:|---:|---:|
| N | 97 | 37 | 97 ✓ | 37 ✓ |
| Mediana (`VALOR MENSUAL 2023`) | 221.375 | 284.625 | 221.375 ✓ | 284.625 ✓ |
| Media (`VALOR MENSUAL 2023`) | 249.122 | 274.368 | 249.122 ✓ | 274.368 ✓ |

El summary embedded reporta el estadístico de **2023** (no del promedio 2022-2023). Las **anclas tesis** publicadas en `<anchors>` corresponden al promedio 2022-2023 y reconcilian con `PROMEDIO MENSUAL 2022-2023`. Sin contradicción: son dos cifras diferentes (snapshot 2023 vs ventana 2022-2023), ambas correctas en su contexto. La tesis publica la ventana porque coincide con la ventana SROI.

## Hallazgos secundarios

### Distribución cuantizada (9 tarifas discretas)

Los valores `PROMEDIO MENSUAL 2022-2023` toman exactamente 9 valores distintos:
- 110.687,5 / 135.187,5 / 179.739,5 / 215.687,5 / 251.437,5 / 277.312,5 / 457.052 / 462.187,5 / 554.625

Esto refleja la estructura tarifaria del PSA (función escalonada por hectáreas conservadas). Implicación: el bootstrap CI de la mediana es **degenerado** (single point) porque más del 50% de los hombres se concentran en el tier 215.687,5. Reportar el IQR como dispersion principal en lugar del IC.

### Asimetría direccional H/M

- Hombres: 19/97 = 19,6% en tiers superiores ($277k+).
- Mujeres: 19/37 = 51,4% en tiers superiores ($277k+).

Esto explica matemáticamente el ancla "mediana PSA mujeres > hombres": las mujeres están más concentradas en tiers superiores (probablemente porque conservan más hectáreas en promedio). **Confirma narrativa "Dualidad Distributiva" — PSA progresivo.**

### Mann-Whitney U test (informativo)

H (n=97) vs M (n=37): U=1.298, p=0,0117 (significativo a α=0,05). Diferencia estadísticamente significativa con dirección consistente (mediana M > mediana H), lo cual **no contradice** el ancla.

## Implicaciones para el script de auditoría

1. La fórmula canónica `PROMEDIO MENSUAL 2022-2023` debe usarse en cualquier cálculo de PSA mensualizado.
2. Reportar IQR como dispersión principal; el bootstrap CI estará degenerado por la cuantización.
3. El ancla `economica.psa_mensual.mediana_*` ya está en `common.py:ANCHORS` con esta fórmula; no requiere ajuste.

## Referencias

- Tesis dataset (Velásquez, Palacio, Álvarez 2025): cifras `<anchors>` H $215.688 / M $277.312.
- Microdatos `Pagos` 2026-04: 141 socios totales, 134 Familia Campesina, summary embedded en rows 146-147.
- DuckDB read_xlsx devuelve los 141 socios limpios (sin las 3 filas summary embedded), ver `questions/004`.
