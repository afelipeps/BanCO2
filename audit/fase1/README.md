# audit/fase1 — Auditoría estadística indicador-por-indicador

Fase 1 del protocolo de auditoría del dashboard Banco2. Audita cada indicador de `data.tsx` contra los microdatos de `data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx`, aplicando las `statistical_rules` y `visual_rules` del `CLAUDE.md`.

## Estado

| Sección | Script | xlsx | Report | Estado |
|---|---|---|---|---|
| Población (piloto) | [scripts/population_audit.py](scripts/population_audit.py) | `piloto_poblacion.xlsx` (gitignored) | [piloto_REPORT.md](piloto_REPORT.md) | Ejecutado, pendiente de validación humana |
| Territorial | — | — | — | Pendiente |
| Ambiental | — | — | — | Pendiente |
| Social | — | — | — | Pendiente |
| Económica | — | — | — | Pendiente |
| Gobernanza | — | — | — | Pendiente |
| Sostenibilidad | — | — | — | Pendiente |

## Ejecución

```bash
.venv/Scripts/python.exe audit/fase1/scripts/population_audit.py
```

Genera `piloto_poblacion.xlsx` (gitignored). El stdout se trackea en `scripts/population_audit.run.log`.

## Estructura

```
audit/fase1/
  scripts/
    common.py                        # utilidades compartidas (duckdb, scipy, schema)
    population_audit.py              # piloto ejecutable
    population_audit.run.log         # stdout del último run (tracked)
  piloto_poblacion.xlsx              # output binario (gitignored)
  piloto_REPORT.md                   # hallazgos + metodología (tracked)
  README.md                          # este archivo
```

## Contrato para sub-agentes (escalado post-piloto)

Cada `audit/fase1/scripts/<seccion>_audit.py`:

1. Importa de `common.py`: `get_connection`, `wilson_ci`, `diff_props_ci`, `median_iqr`, `median_bootstrap_ci`, `spearman`, `IndicadorResultado`, `MetodoRow`, `classify_severity`, `ANCHORS`, `write_excel`, `summarize_severities`.
2. Produce `audit/fase1/<seccion>_<name>.xlsx` con hojas Resumen / Críticos / Método.
3. Trackea stdout en `scripts/<seccion>_audit.run.log`.
4. Si una discrepancia contra ancla excede 1,25 pp, escribe `questions/NNN_ancla_<id>.md` **antes de commitear** con tentativa A/B/C.
5. Corre hasta el final del script aun con múltiples discrepancias; pausa para revisión humana sólo al terminar.

## Referencias

- Protocolo: [CLAUDE.md](../../CLAUDE.md) bloques `<audit_protocol>`, `<statistical_rules>`, `<visual_rules>`, `<handoff_protocol>`.
- Baseline Fase 0: [audit/baseline/REPORT.md](../baseline/REPORT.md).
- Dudas abiertas: [questions/](../../questions/).
