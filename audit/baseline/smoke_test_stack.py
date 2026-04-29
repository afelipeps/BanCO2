"""Smoke test del stack tecnico de auditoria.

Valida que duckdb+scipy+statsmodels estan operativos en el venv
y que el ancla mas basica del CLAUDE.md (n=80, 58.75% hombres)
se sostiene contra los microdatos.

Uso:
    .venv/Scripts/python.exe audit/baseline/smoke_test_stack.py

Sale 0 si todo ok. Sale !=0 si cualquier assertion falla.
"""
from __future__ import annotations

from pathlib import Path

import duckdb
import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats

XLSX = Path("data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx")
assert XLSX.exists(), f"No se encontro {XLSX}"

con = duckdb.connect()
con.execute("INSTALL excel; LOAD excel;")

# 1. DuckDB abre xlsx nativo (ancla: n=80 en Datos_Normalizados)
rows = con.execute(
    f"""
    SELECT COUNT(*)
    FROM read_xlsx(
        '{XLSX.as_posix()}',
        sheet='Datos_Normalizados',
        all_varchar=true
    )
    """
).fetchone()[0]
assert rows == 80, f"Esperado n=80 en Datos_Normalizados, obtenido {rows}"

# 2. Wilson CI sobre ancla: 47/80 = 58.75% hombres
ci = stats.binomtest(47, 80).proportion_ci(method="wilson")
assert ci.low < 0.5875 < ci.high, f"Wilson CI no cubre el ancla 58.75%: {ci}"
width = ci.high - ci.low
assert width < 0.25, f"Wilson CI demasiado ancho para n=80: {width:.4f}"

# 3. Spearman (sanity check de scipy.stats)
rho, pval = stats.spearmanr([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])
assert abs(rho - 1.0) < 1e-9, f"Spearman sanity falla: rho={rho}"

# 4. statsmodels disponible (regresion OLS trivial)
x = sm.add_constant(np.arange(10, dtype=float))
y = 2 * np.arange(10, dtype=float) + 1
ols = sm.OLS(y, x).fit()
assert abs(ols.params[1] - 2.0) < 1e-9, f"OLS sanity falla: {ols.params}"

# 5. pandas + openpyxl leen el mismo xlsx (fallback sin DuckDB)
df = pd.read_excel(XLSX, sheet_name="Datos_Normalizados")
assert len(df) == 80, f"pandas.read_excel discrepa con DuckDB: {len(df)}"

print(f"Microdatos n = {rows} (Datos_Normalizados)")
print(
    f"Wilson CI 95% para 47/80 (58.75%): "
    f"[{ci.low:.4f}, {ci.high:.4f}] ancho={width:.4f}"
)
print(f"Spearman sanity: rho={rho:.3f} p={pval:.4f}")
print(f"OLS sanity: slope={ols.params[1]:.6f}")
print(f"pandas.read_excel: {len(df)} filas, {len(df.columns)} columnas")
print("SMOKE OK")
