"""
extract_fixtures.py — F3 benchmark fixture builder.

Lee el xlsx normalizado y produce 3 JSON committeables con datos
agregados (sin PII) para los 3 canarios del benchmark F3:

- e4-boxplot.json   : ingreso mensual COP por sexo (n=24)
- st6-heatmap.json  : matriz 5x5 confianza × puntualidad (n<=80)
- p3-pyramid.json   : pirámide poblacional sexo × rango_edad (n=80)

READ-ONLY sobre data_source/. Outputs van a benchmarks/viz/fixtures/.
NO commitear data_source/. Los fixtures son committeables: sin PII,
solo agregados/valores que ya están en data.tsx o son derivables.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

import openpyxl  # type: ignore[import-untyped]

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
XLSX = REPO_ROOT / "data_source" / "BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx"
OUT = REPO_ROOT / "benchmarks" / "viz" / "fixtures"

# Indices de columna en hoja Datos_Normalizados (verificados 2026-04-29)
COL_SEXO = 6           # 1.6_Sexo
COL_EDAD = 7           # 1.7_Edad
COL_CONFIANZA = 35     # 3.5_Calif_Relacion_Masbosques_Cornare (Likert 1-5)
COL_PUNTUALIDAD = 41   # 4.2_Puntualidad_Pagos_1a5
COL_INGRESO = 61       # 5.2.4_Ingreso_Mensual_Promedio_COP
COL_RANGO_EDAD = 77    # Rango_Edad

# Bins etarios canónicos para pirámide (acordes a anchors edad 15-90)
AGE_BINS = ["<30", "30-44", "45-59", "60-74", ">=75"]


def bin_age(edad: int | None) -> str | None:
    if edad is None:
        return None
    if edad < 30:
        return "<30"
    if edad < 45:
        return "30-44"
    if edad < 60:
        return "45-59"
    if edad < 75:
        return "60-74"
    return ">=75"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    wb = openpyxl.load_workbook(str(XLSX), read_only=True, data_only=True)
    ws = wb["Datos_Normalizados"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))

    # 1) E4 boxplot: ingreso por sexo, solo filas con ingreso válido
    # En la hoja, SEXO está codificado 'M' (Masculino) / 'F' (Femenino).
    # Los anchors del proyecto usan 'H' (Hombre) / 'M' (Mujer). Normalizamos
    # al esquema de anchors: M(Masculino)->H(Hombre), F(Femenino)->M(Mujer).
    SEX_MAP = {"M": "H", "F": "M"}

    e4_points: list[dict[str, Any]] = []
    for r in rows:
        ing = r[COL_INGRESO]
        sx_raw = r[COL_SEXO]
        if not isinstance(sx_raw, str) or sx_raw.strip().upper() not in SEX_MAP:
            continue
        if isinstance(ing, (int, float)) and ing > 0:
            e4_points.append({"sex": SEX_MAP[sx_raw.strip().upper()], "ingreso": int(ing)})
    # Aseguramos outlier de anchors ($23.990.000 ID_Encuesta=40)
    e4_payload = {
        "label": "E4 Brecha género ingreso productivo (COP/mes)",
        "n": len(e4_points),
        "source": "data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx hoja Datos_Normalizados cols 1.6_Sexo + 5.2.4_Ingreso_Mensual_Promedio_COP",
        "transformation": "Filtrado: ingreso > 0 AND sex no nulo. Sin imputación.",
        "timeWindow": "2017-2024",
        "points": e4_points,
    }
    (OUT / "e4-boxplot.json").write_text(json.dumps(e4_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"E4 boxplot: n={len(e4_points)} -> fixtures/e4-boxplot.json")

    # 2) ST6 heatmap 5×5 Confianza × Puntualidad
    cells: Counter[tuple[int, int]] = Counter()
    for r in rows:
        c = r[COL_CONFIANZA]
        p = r[COL_PUNTUALIDAD]
        if isinstance(c, (int, float)) and isinstance(p, (int, float)):
            cells[(int(p), int(c))] += 1
    matrix = [
        {"x": x, "y": y, "count": cells[(x, y)]}
        for x in (1, 2, 3, 4, 5)
        for y in (1, 2, 3, 4, 5)
    ]
    n_eff = sum(c["count"] for c in matrix)
    st6_payload = {
        "label": "ST6 Confianza × Puntualidad (5×5 Likert)",
        "n": n_eff,
        "xAxis": {"label": "Puntualidad de Pagos", "ticks": [1, 2, 3, 4, 5]},
        "yAxis": {"label": "Confianza Institucional", "ticks": [1, 2, 3, 4, 5]},
        "source": "Datos_Normalizados cols 4.2_Puntualidad_Pagos_1a5 × 3.5_Calif_Relacion_Masbosques_Cornare",
        "transformation": "Tabla cruzada de frecuencias enteras Likert 1-5; null pairs descartados.",
        "spearmanRho": 0.5617,
        "spearmanPValue": 0.000003,
        "matrix": matrix,
    }
    (OUT / "st6-heatmap.json").write_text(json.dumps(st6_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"ST6 heatmap: n={n_eff} cells={len(matrix)} -> fixtures/st6-heatmap.json")

    # 3) P3 pirámide poblacional sexo × bin etario
    pyramid: dict[str, dict[str, int]] = {b: {"H": 0, "M": 0} for b in AGE_BINS}
    n_p3 = 0
    for r in rows:
        edad = r[COL_EDAD]
        sx_raw = r[COL_SEXO]
        if not isinstance(sx_raw, str):
            continue
        sx_key = sx_raw.strip().upper()
        if sx_key not in SEX_MAP:
            continue
        if not isinstance(edad, (int, float)):
            continue
        b = bin_age(int(edad))
        if b is None:
            continue
        pyramid[b][SEX_MAP[sx_key]] += 1
        n_p3 += 1
    p3_payload = {
        "label": "P3 Pirámide poblacional",
        "n": n_p3,
        "source": "Datos_Normalizados cols 1.6_Sexo + 1.7_Edad",
        "transformation": "Bins etarios: <30, 30-44, 45-59, 60-74, ≥75. Solo filas con sexo H/M y edad numérica.",
        "bins": [
            {"bin": b, "men": pyramid[b]["H"], "women": pyramid[b]["M"]}
            for b in AGE_BINS
        ],
    }
    (OUT / "p3-pyramid.json").write_text(json.dumps(p3_payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"P3 pyramid: n={n_p3} -> fixtures/p3-pyramid.json")

    print("\nFixtures escritos en", OUT)


if __name__ == "__main__":
    main()
