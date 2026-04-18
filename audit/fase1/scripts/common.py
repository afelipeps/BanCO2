"""Utilidades compartidas para la auditoría estadística Fase 1.

Reutilizable por los auditores de cada sección (Población, Territorial, Ambiental,
Social, Económica, Gobernanza, Sostenibilidad). Contrato estable: cada
`<seccion>_audit.py` importa de aquí y sólo añade queries específicas.

Convenciones:
- DuckDB es el motor primario (queries sobre tabla in-memory).
- scipy para Wilson CI y bootstrap; statsmodels sólo para diff de proporciones.
- Todos los resultados se construyen como `IndicadorResultado` y se serializan
  vía `write_excel` a un xlsx de 3 hojas (Resumen, Críticos, Método).

Uso típico:
    from common import (
        get_connection, load_diccionario, wilson_ci, median_iqr,
        median_bootstrap_ci, diff_props_ci, IndicadorResultado,
        classify_severity, ANCHORS, write_excel,
    )

Tests inline al final: correr este archivo como script ejecuta un smoke que
valida el ancla 47/80 = 58.75% contra Wilson CI.
"""

from __future__ import annotations

import sys

# Forzar utf-8 en stdout/stderr cuando el host es Windows para no depender de
# PYTHONIOENCODING en el entorno de los sub-agentes. Esto evita que prints con
# caracteres como '−', '×', '≤' en nombres de variables o mensajes de log
# aborten el script con UnicodeEncodeError bajo cp1252. Debe ir antes de
# cualquier otro I/O del módulo o de scripts que lo importen.
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

import re
from dataclasses import asdict, dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Literal

import duckdb
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.proportion import confint_proportions_2indep

# ----------------------------------------------------------------------------
# Rutas y constantes del dominio
# ----------------------------------------------------------------------------

XLSX = Path("data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx")
SHEET_DATOS = "Datos_Normalizados"
SHEET_DICC = "Diccionario_Datos"

# Anclas verificadas contra microdatos (CLAUDE.md bloque <anchors>).
# Claves en formato seccion.indicador.subgrupo. Valores como float (proporción
# ∈ [0,1], o años para edad). El auditor compara valor_real vs estos valores.
ANCHORS: dict[str, float] = {
    "muestra.n": 80.0,
    "muestra.variables": 79.0,
    "poblacion.genero.hombres_prop": 0.5875,          # 47/80
    "poblacion.genero.mujeres_prop": 0.4125,          # 33/80
    "poblacion.jefatura.global_prop": 0.8750,         # 70/80
    "poblacion.jefatura.mujeres_prop": 0.7879,        # 26/33
    "poblacion.jefatura.hombres_prop": 0.9362,        # 44/47
    "poblacion.edad.media": 57.81,
    "poblacion.edad.mediana": 60.0,
    "poblacion.edad.min": 15.0,
    "poblacion.edad.max": 90.0,
    "territorial.area_por_familia_ha": 104.6,
    "poblacion.universo_familias": 155.0,
    "poblacion.muestra.area_ha": 22512.0,
    "poblacion.muestra.veredas": 52.0,
}

# Umbrales de severidad (pp = puntos porcentuales; para continuas interpretar
# discrepancia en unidades de la variable directamente).
SEV_OK_PP = 0.1
SEV_NOTA_PP = 1.25
SEV_HANDOFF_PP = 5.0


# ----------------------------------------------------------------------------
# Conexión DuckDB
# ----------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_connection() -> duckdb.DuckDBPyConnection:
    """Devuelve conexión DuckDB con tablas `datos` y `pagos` pre-cargadas.

    `all_varchar=true` fuerza lectura como string para evitar autocast flaky en
    columnas mixtas; cada auditor CASTea explícitamente sólo las columnas que
    necesita (vía TRY_CAST para tolerar celdas vacías).
    """
    con = duckdb.connect()
    con.execute("INSTALL excel; LOAD excel;")
    xlsx_posix = XLSX.as_posix()
    con.execute(
        f"""
        CREATE TABLE datos AS
        SELECT * FROM read_xlsx(
            '{xlsx_posix}',
            sheet='{SHEET_DATOS}',
            all_varchar=true
        )
        """
    )
    con.execute(
        f"""
        CREATE TABLE pagos AS
        SELECT * FROM read_xlsx(
            '{xlsx_posix}',
            sheet='Pagos',
            all_varchar=true
        )
        """
    )
    return con


def load_diccionario() -> pd.DataFrame:
    """Lee Diccionario_Datos. Header está en la fila 3 (skiprows=2)."""
    df = pd.read_excel(XLSX, sheet_name=SHEET_DICC, skiprows=2)
    df.columns = [str(c).strip() for c in df.columns]
    return df


# ----------------------------------------------------------------------------
# Parsers
# ----------------------------------------------------------------------------

def parse_anchor(texto: str) -> float:
    """Parsea un ancla en formato castellano ('58,75%' → 0.5875, '57,81' → 57.81).

    Tolera separador decimal coma, signo %, y espacios. Retorna float; si hay %,
    divide por 100.
    """
    s = texto.strip()
    pct = s.endswith("%")
    s = s.rstrip("%").strip()
    s = s.replace(",", ".")
    val = float(re.sub(r"[^\d\.\-]", "", s))
    return val / 100 if pct else val


# ----------------------------------------------------------------------------
# Estadísticos
# ----------------------------------------------------------------------------

def wilson_ci(k: int, n: int, alpha: float = 0.05) -> tuple[float, float, float]:
    """IC Wilson 95% para proporción k/n. Retorna (low, high, width)."""
    if n == 0:
        return (float("nan"), float("nan"), float("nan"))
    ci = stats.binomtest(k, n).proportion_ci(method="wilson", confidence_level=1 - alpha)
    return (float(ci.low), float(ci.high), float(ci.high - ci.low))


def diff_props_ci(
    k1: int, n1: int, k2: int, n2: int, alpha: float = 0.05
) -> tuple[float, float]:
    """IC 95% para p1 − p2 con método Wilson (statsmodels)."""
    low, high = confint_proportions_2indep(
        k1, n1, k2, n2, method="wald", compare="diff", alpha=alpha
    )
    return (float(low), float(high))


def median_iqr(series: pd.Series) -> dict:
    """Mediana, Q1, Q3, IQR, n efectivo y count de missings."""
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if len(clean) == 0:
        return {
            "median": float("nan"), "q1": float("nan"), "q3": float("nan"),
            "iqr": float("nan"), "n": 0, "n_missing": int(len(series)),
        }
    q1 = float(clean.quantile(0.25))
    q3 = float(clean.quantile(0.75))
    return {
        "median": float(clean.median()),
        "q1": q1, "q3": q3, "iqr": q3 - q1,
        "n": int(len(clean)),
        "n_missing": int(len(series) - len(clean)),
    }


def median_bootstrap_ci(
    series: pd.Series,
    n_resamples: int = 10_000,
    alpha: float = 0.05,
    seed: int = 42,
) -> tuple[float, float]:
    """IC 95% de la mediana vía bootstrap percentile (scipy.stats.bootstrap)."""
    clean = pd.to_numeric(series, errors="coerce").dropna().to_numpy()
    if len(clean) < 2:
        return (float("nan"), float("nan"))
    rng = np.random.default_rng(seed)
    res = stats.bootstrap(
        (clean,),
        np.median,
        n_resamples=n_resamples,
        confidence_level=1 - alpha,
        method="percentile",
        random_state=rng,
    )
    return (float(res.confidence_interval.low), float(res.confidence_interval.high))


def spearman(x: pd.Series, y: pd.Series) -> dict:
    """Correlación de Spearman con n efectivo (descartando pares con NaN)."""
    xa = pd.to_numeric(x, errors="coerce")
    ya = pd.to_numeric(y, errors="coerce")
    mask = xa.notna() & ya.notna()
    if mask.sum() < 3:
        return {"rho": float("nan"), "pvalue": float("nan"), "n_pairs": int(mask.sum())}
    rho, pval = stats.spearmanr(xa[mask], ya[mask])
    return {"rho": float(rho), "pvalue": float(pval), "n_pairs": int(mask.sum())}


# ----------------------------------------------------------------------------
# Schema de resultado
# ----------------------------------------------------------------------------

Severidad = Literal["ok", "nota", "handoff", "bloqueo"]
TipoStat = Literal["proporcion", "mediana", "media", "conteo", "diff_props"]


@dataclass
class IndicadorResultado:
    id_indicador: str
    seccion: str
    titulo_codigo: str
    tipo_stat: TipoStat
    subgrupo: str | None
    valor_codigo: float | None
    valor_real: float
    n_efectivo: int
    missing_rate: float
    unidad: str
    ic_low: float | None = None
    ic_high: float | None = None
    ic_metodo: str | None = None
    dispersion_tipo: str | None = None
    dispersion_valor: float | None = None
    viz_actual: str = ""
    viz_recomendada: str | None = None
    viz_viola_rules: bool = False
    severidad: Severidad = "ok"
    discrepancia_pp: float | None = None
    ancla_ref: str | None = None
    notas: str | None = None


@dataclass
class MetodoRow:
    id_indicador: str
    variables_fuente: str
    query_duckdb: str
    formula_ic: str
    supuestos: str
    n_missing: int
    missing_pct: float
    notas_bins: str | None = None


def classify_severity(
    valor_codigo: float | None,
    valor_real: float,
    n: int,
    unit_is_pp: bool = True,
) -> tuple[Severidad, float | None]:
    """Clasifica severidad y retorna también la discrepancia en pp (o unidades).

    unit_is_pp=True: proporción (compara en puntos porcentuales).
    unit_is_pp=False: continua (compara en unidades absolutas).
    """
    if valor_codigo is None or valor_real is None or np.isnan(valor_real):
        return ("nota", None)
    diff = abs(valor_codigo - valor_real)
    if unit_is_pp:
        diff_pp = diff * 100 if max(abs(valor_codigo), abs(valor_real)) <= 1.0 else diff
    else:
        diff_pp = diff
    if diff_pp <= SEV_OK_PP:
        sev: Severidad = "ok"
    elif diff_pp <= SEV_NOTA_PP:
        sev = "nota"
    elif diff_pp <= SEV_HANDOFF_PP:
        sev = "handoff"
    else:
        sev = "bloqueo"
    if n < 10 and sev == "ok":
        sev = "nota"  # baja potencia: bump
    return (sev, float(diff_pp))


# ----------------------------------------------------------------------------
# Output Excel
# ----------------------------------------------------------------------------

def to_resumen_df(resultados: list[IndicadorResultado]) -> pd.DataFrame:
    rows = [asdict(r) for r in resultados]
    cols = [
        "id_indicador", "seccion", "titulo_codigo", "tipo_stat", "subgrupo",
        "valor_codigo", "valor_real", "n_efectivo", "missing_rate", "unidad",
        "ic_low", "ic_high", "ic_metodo",
        "dispersion_tipo", "dispersion_valor",
        "viz_actual", "viz_recomendada", "viz_viola_rules",
        "severidad", "discrepancia_pp", "ancla_ref", "notas",
    ]
    df = pd.DataFrame(rows)
    return df[cols] if len(df) else pd.DataFrame(columns=cols)


def to_criticos_df(
    resultados: list[IndicadorResultado],
    accion_map: dict[str, str] | None = None,
    handoff_map: dict[str, str] | None = None,
) -> pd.DataFrame:
    accion_map = accion_map or {}
    handoff_map = handoff_map or {}
    criticos = [r for r in resultados if r.severidad in ("handoff", "bloqueo") or r.viz_viola_rules]
    df = to_resumen_df(criticos)
    if len(df):
        df["accion_sugerida"] = df["id_indicador"].map(accion_map).fillna("")
        df["handoff_ref"] = df["id_indicador"].map(handoff_map).fillna("")
        df["bloquea_ancla"] = df["ancla_ref"].notna() & df["severidad"].isin(["handoff", "bloqueo"])
    return df


def to_metodo_df(metodo: list[MetodoRow]) -> pd.DataFrame:
    rows = [asdict(m) for m in metodo]
    cols = [
        "id_indicador", "variables_fuente", "query_duckdb", "formula_ic",
        "supuestos", "n_missing", "missing_pct", "notas_bins",
    ]
    df = pd.DataFrame(rows)
    return df[cols] if len(df) else pd.DataFrame(columns=cols)


def write_excel(
    resultados: list[IndicadorResultado],
    metodo: list[MetodoRow],
    path: Path,
    accion_map: dict[str, str] | None = None,
    handoff_map: dict[str, str] | None = None,
) -> None:
    """Escribe 3 hojas: Resumen, Críticos, Método."""
    path.parent.mkdir(parents=True, exist_ok=True)
    resumen = to_resumen_df(resultados)
    criticos = to_criticos_df(resultados, accion_map, handoff_map)
    metodo_df = to_metodo_df(metodo)
    with pd.ExcelWriter(path, engine="openpyxl") as xw:
        resumen.to_excel(xw, sheet_name="Resumen", index=False)
        criticos.to_excel(xw, sheet_name="Críticos", index=False)
        metodo_df.to_excel(xw, sheet_name="Método", index=False)


def summarize_severities(resultados: list[IndicadorResultado]) -> dict[str, dict[str, int]]:
    """{id_indicador: {ok: int, nota: int, handoff: int, bloqueo: int}}."""
    out: dict[str, dict[str, int]] = {}
    for r in resultados:
        bucket = out.setdefault(r.id_indicador, {"ok": 0, "nota": 0, "handoff": 0, "bloqueo": 0})
        bucket[r.severidad] += 1
    return out


# ----------------------------------------------------------------------------
# Smoke tests inline
# ----------------------------------------------------------------------------

if __name__ == "__main__":
    # parse_anchor
    assert abs(parse_anchor("58,75%") - 0.5875) < 1e-9
    assert abs(parse_anchor("57,81") - 57.81) < 1e-9
    assert abs(parse_anchor(" 41,25 %") - 0.4125) < 1e-9

    # wilson_ci sobre ancla 47/80
    low, high, width = wilson_ci(47, 80)
    assert low < 0.5875 < high, f"Wilson CI no cubre ancla 58.75%: [{low}, {high}]"
    assert width < 0.25, f"Wilson CI demasiado ancho: {width}"

    # median_iqr en datos sintéticos
    s = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    r = median_iqr(s)
    assert r["median"] == 5.5
    assert r["n"] == 10 and r["n_missing"] == 0

    # median_bootstrap_ci determinístico con seed
    lo1, hi1 = median_bootstrap_ci(pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), n_resamples=1000, seed=42)
    lo2, hi2 = median_bootstrap_ci(pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), n_resamples=1000, seed=42)
    assert (lo1, hi1) == (lo2, hi2), "bootstrap no reproducible"

    # classify_severity
    assert classify_severity(0.588, 0.5875, 80)[0] == "ok"
    assert classify_severity(0.59, 0.5875, 80)[0] == "nota"
    assert classify_severity(0.60, 0.5875, 80)[0] == "nota"
    assert classify_severity(0.6175, 0.5875, 80)[0] == "handoff"  # diff 3.0 pp
    assert classify_severity(0.70, 0.5875, 80)[0] == "bloqueo"   # diff 11.25 pp

    # diff_props_ci sanity: 0.79 vs 0.94 con n=33 y n=47
    lo, hi = diff_props_ci(26, 33, 44, 47)
    assert lo < (26 / 33 - 44 / 47) < hi

    # Conexión DuckDB: n=80 en datos (ancla verificada Fase 0)
    con = get_connection()
    n = con.execute("SELECT COUNT(*) FROM datos").fetchone()[0]
    assert n == 80, f"n datos={n}, esperado 80"
    # Informativo: n pagos (ancla CLAUDE.md dice 148; cualquier divergencia se
    # audita en la sección Económica/Sostenibilidad, no bloquea el piloto).
    n_pagos = con.execute("SELECT COUNT(*) FROM pagos").fetchone()[0]
    print(f"pagos n={n_pagos} (ancla CLAUDE.md=148)")

    print("common.py SMOKE OK")
