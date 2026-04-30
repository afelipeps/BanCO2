"""
audit/fase3/scripts/wilson_h1viz.py

Validación reproducible de la Tabla H1-VIZ (7 indicadores ambientales con
Wilson IC 95%) inscrita en audit/fase4/HANDOFF.md sección H1-VIZ.

Genera audit/fase3/scripts/wilson_h1viz_run.log con header de trazabilidad
(timestamp UTC, SHA-256 XLSX, SHA-256 script, versiones).

Aplicación del principio CLAUDE.md <dashboard_role>: la tabla incluye 7
indicadores; los 6 publicados en Tabla 1 tesis (Velasquez, Palacio y Alvarez
2025, p.44) más Densidad de Árboles, medido con misma metodología pero no
publicado por límite editorial.

Uso:
    cd <repo_root>
    python audit/fase3/scripts/wilson_h1viz.py

Pre-requisito: data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx
(gitignored). Si no está, falla con mensaje claro.

Si CUALQUIER cifra difiere de las inscritas en HANDOFF (con tolerancia
±0,1 pp por statistical_rules CLAUDE.md "Precisión máx 1 decimal con n<100"),
falla con assert.
"""
from __future__ import annotations

import hashlib
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Cifras-ancla inscritas en audit/fase4/HANDOFF.md sección H1-VIZ tabla 7-filas
EXPECTED = {
    "n_total": 80,
    # Conteos afirmativos por indicador (cardinalidad validada explícitamente abajo)
    "k_aire": 78,
    "k_cantidad_agua": 78,
    "k_calidad_agua": 78,
    "k_fauna": 78,
    "k_densidad_arboles": 78,
    "k_clima": 79,                      # 1 missing tratado como No (alineado tesis)
    "k_continuidad": 80,                # 1 "Mucho" tratado como Sí intensificado
    # Wilson IC 95% (decimal, no porcentaje)
    "ci_low_78_80": 0.913,              # tolerancia ±0.001 ≈ ±0.1pp
    "ci_high_78_80": 0.993,
    "ci_low_79_80": 0.933,
    "ci_high_79_80": 0.998,
    "ci_low_80_80": 0.954,
    "ci_high_80_80": 1.000,
}
TOL_CI = 0.001

REPO_ROOT = Path(__file__).resolve().parents[3]
XLSX_PATH = REPO_ROOT / "data_source" / "BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx"
LOG_PATH = REPO_ROOT / "audit" / "fase3" / "scripts" / "wilson_h1viz_run.log"
SELF_PATH = Path(__file__).resolve()

# Mapeo indicador → columna xlsx (índices verificados 2026-04-29)
INDICADORES = [
    ("Calidad del aire",       22, "k_aire",              True),
    ("Cantidad de agua",       20, "k_cantidad_agua",     True),
    ("Calidad del agua",       21, "k_calidad_agua",      True),
    ("Fauna silvestre",        18, "k_fauna",             True),
    ("Densidad de arboles",    17, "k_densidad_arboles",  False),  # NO publicado tesis
    ("Mitigacion cambio clim", 29, "k_clima",             True),
    ("Continuidad sin pago",   71, "k_continuidad",       True),
]


def sha256_of(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def fail(msg: str) -> None:
    print(f"FATAL: {msg}", file=sys.stderr)
    sys.exit(1)


def count_affirmative(values: list[Any]) -> tuple[int, dict[str, int]]:
    """
    Aplica statistical_rules CLAUDE.md validate_cardinality:
    - Reportar cardinalidad observada
    - Tratamiento explícito de valores fuera del set canónico {Sí, No}
    - "Mucho" se trata como afirmativo intensificado (caso Continuidad sin pago)
    - None / valor vacío se trata como No (alineado con tesis Tabla 1 que usa n=80
      como denominador y reporta 79/80=98,8% para Mitiga clima donde hay 1 missing)
    """
    counter: Counter[str] = Counter()
    for v in values:
        if v is None:
            counter["__missing__"] += 1
        else:
            counter[str(v).strip()] += 1
    afirmativos = (
        counter.get("Sí", 0) + counter.get("Si", 0) +
        counter.get("SI", 0) + counter.get("SÍ", 0) +
        counter.get("Mucho", 0)  # afirmativo intensificado documentado
    )
    return afirmativos, dict(counter)


def main() -> None:
    if not XLSX_PATH.exists():
        fail(f"XLSX no encontrado en {XLSX_PATH}.")

    try:
        import openpyxl  # type: ignore[import-untyped]
        from statsmodels.stats.proportion import proportion_confint  # type: ignore[import-not-found]
    except ImportError as exc:
        fail(f"Dependencia faltante: {exc}. pip install openpyxl statsmodels")
        return

    import statsmodels  # type: ignore[import-not-found]
    py_version = sys.version.split()[0]
    sm_ver = statsmodels.__version__
    openpyxl_ver = openpyxl.__version__

    xlsx_hash = sha256_of(XLSX_PATH)
    script_hash = sha256_of(SELF_PATH)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    wb = openpyxl.load_workbook(str(XLSX_PATH), read_only=True, data_only=True)
    ws = wb["Datos_Normalizados"]
    rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[0] is not None]
    n_total = len(rows)

    if n_total != EXPECTED["n_total"]:
        fail(f"n total {n_total} != esperado {EXPECTED['n_total']}.")

    # Calcular k afirmativos + Wilson IC para cada indicador
    results = []
    for nombre, col, key, publicado in INDICADORES:
        vals = [r[col] for r in rows]
        k, cardinality = count_affirmative(vals)
        ci_low, ci_high = proportion_confint(k, n_total, alpha=0.05, method="wilson")
        results.append({
            "nombre": nombre,
            "col": col,
            "k": k,
            "n": n_total,
            "pct": k / n_total,
            "ci_low": float(ci_low),
            "ci_high": float(ci_high),
            "publicado": publicado,
            "cardinality": cardinality,
            "expected_key": key,
        })

    # Asserts contra HANDOFF
    checks: list[tuple[str, float, float, float]] = []
    for res in results:
        checks.append((
            res["expected_key"],
            float(res["k"]),
            float(EXPECTED[res["expected_key"]]),
            0.0,
        ))
    # IC para 78/80 (idéntico para los 5 indicadores con k=78)
    res_78 = next(r for r in results if r["k"] == 78)
    checks.append(("ci_low_78_80", res_78["ci_low"], EXPECTED["ci_low_78_80"], TOL_CI))
    checks.append(("ci_high_78_80", res_78["ci_high"], EXPECTED["ci_high_78_80"], TOL_CI))
    res_79 = next(r for r in results if r["k"] == 79)
    checks.append(("ci_low_79_80", res_79["ci_low"], EXPECTED["ci_low_79_80"], TOL_CI))
    checks.append(("ci_high_79_80", res_79["ci_high"], EXPECTED["ci_high_79_80"], TOL_CI))
    res_80 = next(r for r in results if r["k"] == 80)
    checks.append(("ci_low_80_80", res_80["ci_low"], EXPECTED["ci_low_80_80"], TOL_CI))
    checks.append(("ci_high_80_80", res_80["ci_high"], EXPECTED["ci_high_80_80"], TOL_CI))

    failed = [c for c in checks if abs(c[1] - c[2]) > c[3]]

    # Construir log
    lines: list[str] = []
    lines.append("=" * 72)
    lines.append("audit/fase3/scripts/wilson_h1viz.py — RUN LOG")
    lines.append("=" * 72)
    lines.append("")
    lines.append("HEADER DE TRAZABILIDAD")
    lines.append("-" * 72)
    lines.append(f"  Timestamp UTC      : {timestamp}")
    lines.append(f"  XLSX path          : {XLSX_PATH.relative_to(REPO_ROOT)}")
    lines.append(f"  XLSX SHA-256       : {xlsx_hash}")
    lines.append(f"  Script SHA-256     : {script_hash}")
    lines.append(f"  Python             : {py_version}")
    lines.append(f"  statsmodels        : {sm_ver}")
    lines.append(f"  openpyxl           : {openpyxl_ver}")
    lines.append(f"  Metodo IC          : Wilson score (statsmodels canonico)")
    lines.append(f"  Alpha              : 0.05  (IC 95%)")
    lines.append("")
    lines.append("APLICACION PRINCIPIO <dashboard_role> CLAUDE.md")
    lines.append("-" * 72)
    lines.append("  Tabla H1-VIZ del dashboard incluye 7 indicadores:")
    lines.append("  - 6 publicados en Tabla 1 tesis (Velasquez, Palacio, Alvarez 2025, p.44)")
    lines.append("  - 1 medido con misma metodologia, omitido por limite editorial:")
    lines.append("    Densidad de arboles. Disclosure explicito en footer academico.")
    lines.append("")
    lines.append("CARDINALIDAD OBSERVADA POR INDICADOR (validate_cardinality)")
    lines.append("-" * 72)
    for res in results:
        lines.append(f"  Col {res['col']:>2} {res['nombre']:<25} cardinalidad: {res['cardinality']}")
    lines.append("")
    lines.append("  Tratamiento de valores no canonicos:")
    lines.append("  - 'Mucho' (col 71 Continuaria sin pago, 1 caso): afirmativo intensificado.")
    lines.append("    Cuenta como Si. Resultado 80/80 = 100% alineado con Tabla 1 tesis.")
    lines.append("  - None (col 29 Mitiga clima, 1 caso): tratado como No.")
    lines.append("    Resultado 79/80 = 98,8% alineado con Tabla 1 tesis.")
    lines.append("")
    lines.append("RESULTADOS — TABLA H1-VIZ (7 INDICADORES) WILSON IC 95%")
    lines.append("-" * 72)
    lines.append(f"  {'Indicador':<25} {'k':>3} {'n':>3} {'%':>7} {'IC 95% Wilson':>18} {'Publicado tesis':<18}")
    for res in results:
        ic = f"[{res['ci_low']*100:5.1f}; {res['ci_high']*100:5.1f}]"
        pub = "Tabla 1" if res["publicado"] else "(expansion)"
        lines.append(f"  {res['nombre']:<25} {res['k']:>3} {res['n']:>3} {res['pct']*100:>6.1f}% {ic:>18} {pub:<18}")
    lines.append("")
    lines.append("=" * 72)
    lines.append("VERIFICACION DE PARIDAD CON HANDOFF F4 SECCION H1-VIZ")
    lines.append("=" * 72)
    for c in checks:
        ok = abs(c[1] - c[2]) <= c[3]
        lines.append(f"  [{'OK' if ok else 'FAIL'}] {c[0]}: got={c[1]} expected={c[2]} tol={c[3]}")
    lines.append("")
    if failed:
        lines.append("RESULTADO: FAIL — al menos una cifra difiere de lo inscrito en HANDOFF.")
        lines.append("Accion: NO modificar HANDOFF unilateralmente; reportar discrepancia.")
    else:
        lines.append("RESULTADO: OK — todas las cifras coinciden con las inscritas en")
        lines.append("audit/fase4/HANDOFF.md seccion H1-VIZ tabla 7-filas.")
    lines.append("")
    lines.append("=" * 72)
    lines.append("FIN")
    lines.append("=" * 72)

    log_text = "\n".join(lines) + "\n"
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(log_text, encoding="utf-8")
    print(log_text)

    if failed:
        sys.exit(2)


if __name__ == "__main__":
    main()
