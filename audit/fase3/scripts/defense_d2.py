"""
audit/fase3/scripts/defense_d2.py

Validación estadística reproducible de la cifra "Brecha 8,5:1"
publicada en Velásquez, Palacio y Álvarez (2025, p.50).

Genera audit/fase3/scripts/defense_d2_run.log con los 4 argumentos
estadísticos inscritos en la sección "Justificación metodológica D2"
de audit/fase4/HANDOFF.md.

Uso:
    cd <repo_root>
    python audit/fase3/scripts/defense_d2.py

Pre-requisito: data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx
presente (gitignored). Si no está, el script falla con mensaje claro.

Si CUALQUIER estadístico difiere de los inscritos en HANDOFF F4
(con tolerancia ±$1.000 en montos, ±0.001 en p-value), el script
falla con assert para forzar revisión humana — no se actualiza
silenciosamente.
"""
from __future__ import annotations

import hashlib
import json
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Cifras-ancla inscritas en HANDOFF F4. Si el cálculo difiere fuera
# de tolerancia, el script falla y exige decisión humana.
EXPECTED = {
    "n_total": 24,
    "n_H": 18,
    "n_M": 6,
    "median_H": 850_000,
    "median_M": 100_000,
    "ratio_median": 8.50,
    "mannwhitney_U": 93.5,
    "mannwhitney_p": 0.00786,
    "bootstrap_ic_low": 1.50,
    "bootstrap_ic_high": 16.67,
    "hodges_lehmann": 700_000,
    "n_H_no_outliers": 15,
    "median_H_no_outliers": 300_000,
    "ratio_no_outliers": 3.00,
    "outlier_max_H": 23_990_000,
    "outlier_max_M": 300_000,
    "ratio_mean_caveat": 26.91,
    # Argumento 5 — Concordancia género × capital productivo
    "top6_h": 6,
    "top6_m": 0,
    "bot18_h": 12,
    "bot18_m": 6,
    "median_capital": 6_733_333,    # tesis cita $6.733.350 — diferencia por redondeo de mediana de pares
    "median_subsist": 100_000,
    "ratio_capital": 67.33,
}
TOL_AMOUNT = 1_000
TOL_RATIO = 0.01
TOL_P = 0.001
SEED = 42

REPO_ROOT = Path(__file__).resolve().parents[3]
XLSX_PATH = REPO_ROOT / "data_source" / "BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx"
LOG_PATH = REPO_ROOT / "audit" / "fase3" / "scripts" / "defense_d2_run.log"
SELF_PATH = Path(__file__).resolve()


def sha256_of(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def fail(msg: str) -> None:
    print(f"FATAL: {msg}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    if not XLSX_PATH.exists():
        fail(
            f"XLSX no encontrado en {XLSX_PATH}. "
            f"Verificar que data_source/ está poblado (gitignored)."
        )

    try:
        import openpyxl  # type: ignore[import-untyped]
        from scipy import stats as sps  # type: ignore[import-not-found]
        import numpy as np  # type: ignore[import-not-found]
    except ImportError as exc:
        fail(f"Dependencia faltante: {exc}. pip install openpyxl scipy numpy")
        return

    py_version = sys.version.split()[0]
    np_ver = np.__version__
    scipy_ver = sps.__name__ and __import__("scipy").__version__
    openpyxl_ver = openpyxl.__version__

    xlsx_hash = sha256_of(XLSX_PATH)
    script_hash = sha256_of(SELF_PATH)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Variables fuente (índices verificados 2026-04-29)
    COL_SEXO = 6
    COL_INGRESO = 61

    wb = openpyxl.load_workbook(str(XLSX_PATH), read_only=True, data_only=True)
    ws = wb["Datos_Normalizados"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))

    SEX_MAP = {"M": "H", "F": "M"}  # Xlsx codifica M/F; anchors usan H/M
    points: list[dict[str, Any]] = []
    for r in rows:
        ing = r[COL_INGRESO]
        sx_raw = r[COL_SEXO]
        if not isinstance(sx_raw, str) or sx_raw.strip().upper() not in SEX_MAP:
            continue
        if isinstance(ing, (int, float)) and ing > 0:
            points.append({"sex": SEX_MAP[sx_raw.strip().upper()], "ingreso": int(ing)})

    H = sorted([p["ingreso"] for p in points if p["sex"] == "H"])
    M = sorted([p["ingreso"] for p in points if p["sex"] == "M"])

    if len(H) + len(M) != EXPECTED["n_total"]:
        fail(
            f"n total inesperado: {len(H)+len(M)} (esperado {EXPECTED['n_total']}). "
            f"Posible drift en microdatos — revisar antes de continuar."
        )
    if len(H) != EXPECTED["n_H"] or len(M) != EXPECTED["n_M"]:
        fail(f"n_H={len(H)} n_M={len(M)} difiere de esperado {EXPECTED['n_H']}/{EXPECTED['n_M']}.")

    # Argumento 1 — Mediana robusta
    median_H = statistics.median(H)
    median_M = statistics.median(M)
    ratio_median = median_H / median_M
    mean_H = statistics.mean(H)
    mean_M = statistics.mean(M)
    ratio_mean = mean_H / mean_M

    # Argumento 2 — Pruebas no paramétricas
    u_stat, p_val = sps.mannwhitneyu(H, M, alternative="two-sided")

    np.random.seed(SEED)
    N_BOOT = 10_000
    ratios = []
    for _ in range(N_BOOT):
        H_s = np.random.choice(H, size=len(H), replace=True)
        M_s = np.random.choice(M, size=len(M), replace=True)
        mh = float(np.median(H_s))
        mm = float(np.median(M_s))
        if mm > 0:
            ratios.append(mh / mm)
    ic_low = float(np.percentile(ratios, 2.5))
    ic_high = float(np.percentile(ratios, 97.5))

    diffs = [h - m for h in H for m in M]
    hl = float(np.median(diffs))

    # Argumento 3 — Sensitivity sin outliers IQR-fence
    q1 = float(np.percentile(H, 25))
    q3 = float(np.percentile(H, 75))
    iqr = q3 - q1
    upper_fence = q3 + 1.5 * iqr
    H_outliers = [h for h in H if h > upper_fence]
    H_clean = [h for h in H if h <= upper_fence]
    median_H_clean = statistics.median(H_clean)
    ratio_clean = median_H_clean / median_M

    # Argumento 5 — Concordancia entre brecha de género y brecha de capital productivo
    # (refuerzo línea 472 tesis: "Dos velocidades económicas: inclusión vs. acumulación")
    all_sorted = sorted([(p["ingreso"], p["sex"]) for p in points], key=lambda x: -x[0])
    top6 = all_sorted[:6]
    bot18 = all_sorted[6:]
    top6_h = sum(1 for _, sx in top6 if sx == "H")
    top6_m = sum(1 for _, sx in top6 if sx == "M")
    bot18_h = sum(1 for _, sx in bot18 if sx == "H")
    bot18_m = sum(1 for _, sx in bot18 if sx == "M")
    median_capital = statistics.median([ing for ing, _ in top6])
    median_subsist = statistics.median([ing for ing, _ in bot18])
    ratio_capital = median_capital / median_subsist

    # Asserts: drift detector
    def check(name: str, got: float, expected: float, tol: float) -> str:
        ok = abs(got - expected) <= tol
        return f"  [{'OK' if ok else 'FAIL'}] {name}: got={got} expected={expected} tol={tol}"

    checks = [
        ("median_H", median_H, EXPECTED["median_H"], TOL_AMOUNT),
        ("median_M", median_M, EXPECTED["median_M"], TOL_AMOUNT),
        ("ratio_median", ratio_median, EXPECTED["ratio_median"], TOL_RATIO),
        ("mannwhitney_U", u_stat, EXPECTED["mannwhitney_U"], 0.5),
        ("mannwhitney_p", p_val, EXPECTED["mannwhitney_p"], TOL_P),
        ("bootstrap_ic_low", ic_low, EXPECTED["bootstrap_ic_low"], TOL_RATIO),
        ("bootstrap_ic_high", ic_high, EXPECTED["bootstrap_ic_high"], TOL_RATIO),
        ("hodges_lehmann", hl, EXPECTED["hodges_lehmann"], TOL_AMOUNT),
        ("median_H_no_outliers", median_H_clean, EXPECTED["median_H_no_outliers"], TOL_AMOUNT),
        ("ratio_no_outliers", ratio_clean, EXPECTED["ratio_no_outliers"], TOL_RATIO),
        ("ratio_mean_caveat", ratio_mean, EXPECTED["ratio_mean_caveat"], TOL_RATIO),
        ("top6_h", top6_h, EXPECTED["top6_h"], 0),
        ("top6_m", top6_m, EXPECTED["top6_m"], 0),
        ("bot18_h", bot18_h, EXPECTED["bot18_h"], 0),
        ("bot18_m", bot18_m, EXPECTED["bot18_m"], 0),
        ("median_capital", median_capital, EXPECTED["median_capital"], 1_000),
        ("median_subsist", median_subsist, EXPECTED["median_subsist"], 1_000),
        ("ratio_capital", ratio_capital, EXPECTED["ratio_capital"], 0.1),
    ]

    failed = [c for c in checks if abs(c[1] - c[2]) > c[3]]

    # Construir log
    lines: list[str] = []
    lines.append("=" * 72)
    lines.append("audit/fase3/scripts/defense_d2.py — RUN LOG")
    lines.append("=" * 72)
    lines.append("")
    lines.append("HEADER DE TRAZABILIDAD")
    lines.append("-" * 72)
    lines.append(f"  Timestamp UTC      : {timestamp}")
    lines.append(f"  XLSX path          : {XLSX_PATH.relative_to(REPO_ROOT)}")
    lines.append(f"  XLSX SHA-256       : {xlsx_hash}")
    lines.append(f"  Script SHA-256     : {script_hash}")
    lines.append(f"  Python             : {py_version}")
    lines.append(f"  numpy              : {np_ver}")
    lines.append(f"  scipy              : {scipy_ver}")
    lines.append(f"  openpyxl           : {openpyxl_ver}")
    lines.append(f"  Bootstrap seed     : {SEED}")
    lines.append(f"  Bootstrap N        : {N_BOOT}")
    lines.append("")
    lines.append("PARÁMETROS DE FILTRADO")
    lines.append("-" * 72)
    lines.append(f"  Hoja               : Datos_Normalizados")
    lines.append(f"  Var fuente ingreso : col 61 = 5.2.4_Ingreso_Mensual_Promedio_COP")
    lines.append(f"  Filtro             : notna() & (>0)")
    lines.append(f"  Var grupo          : col 6 = 1.6_Sexo")
    lines.append(f"  Codificación xlsx  : M=Masculino, F=Femenino")
    lines.append(f"  Mapeo a anchors    : M(xlsx)->H(Hombre), F(xlsx)->M(Mujer)")
    lines.append(f"  n total            : {len(H)+len(M)}")
    lines.append(f"  n_H                : {len(H)}")
    lines.append(f"  n_M                : {len(M)}")
    lines.append("")
    lines.append("ESTADÍSTICOS DESCRIPTIVOS")
    lines.append("-" * 72)
    lines.append(f"  H: min=${H[0]:,.0f}, Q1=${q1:,.0f}, mediana=${median_H:,.0f}, Q3=${q3:,.0f}, max=${H[-1]:,.0f}, media=${mean_H:,.0f}")
    lines.append(f"  M: min=${M[0]:,.0f}, mediana=${median_M:,.0f}, max=${M[-1]:,.0f}, media=${mean_M:,.0f}")
    lines.append(f"  Valores H: {H}")
    lines.append(f"  Valores M: {M}")
    lines.append("")
    lines.append("=" * 72)
    lines.append("ARGUMENTO 1 — Mediana robusta a outliers por construcción")
    lines.append("=" * 72)
    lines.append(f"  Ratio mediana H/M  = {ratio_median:.2f}:1")
    lines.append(f"  Ratio media H/M    = {ratio_mean:.2f}:1  (caveat: media inflada por outliers)")
    lines.append(f"  Lectura: la mediana selecciona posiciones centrales (9-10 de 18 ordenados),")
    lines.append(f"  los 3 outliers superiores (posiciones 16-18) NO afectan ese cálculo.")
    lines.append(f"  La media SÍ se infla; statistical_rules CLAUDE.md exige mediana en distribuciones asimétricas.")
    lines.append("")
    lines.append("=" * 72)
    lines.append("ARGUMENTO 2 — Validación con 3 pruebas no paramétricas")
    lines.append("=" * 72)
    lines.append(f"  Mann-Whitney U     = {u_stat:.1f}")
    lines.append(f"  Mann-Whitney p     = {p_val:.5f}  (significativa α=0.01)")
    lines.append(f"  Bootstrap N        = {N_BOOT} réplicas, seed={SEED}")
    lines.append(f"  Bootstrap IC 95%   = [{ic_low:.2f}; {ic_high:.2f}]")
    lines.append(f"  IC NO incluye 1?   = {ic_low > 1.0}  (brecha estadísticamente real)")
    lines.append(f"  Hodges-Lehmann     = ${hl:,.0f}  (mediana de las {len(H)*len(M)} diferencias H_i - M_j pareadas)")
    lines.append(f"")
    lines.append(f"  CAVEAT METODOLÓGICO: con n_M=6, el bootstrap de mediana es discretizado")
    lines.append(f"  (la mediana M solo puede tomar promedios de pares centrales de un resampleo")
    lines.append(f"  donde los valores únicos son {{60.000; 100.000; 300.000}}). El upper bound")
    lines.append(f"  16,67 = 1.000.000 / 60.000 es artefacto de cuando el resampleo bootstrap saca")
    lines.append(f"  [60k×6] como muestra de mujeres. La cota inferior 1,50 es robusta y >> 1,")
    lines.append(f"  evidencia que la brecha es estadísticamente real; la cota superior es")
    lines.append(f"  conservadora por el tamaño muestral pequeño.")
    lines.append("")
    lines.append("=" * 72)
    lines.append("ARGUMENTO 3 — Robustez a la especificación (sensitivity)")
    lines.append("=" * 72)
    lines.append(f"  IQR-fence superior H = ${upper_fence:,.0f}")
    lines.append(f"  Outliers IQR-fence H : {[f'${v:,.0f}' for v in H_outliers]}")
    lines.append(f"  ID Encuesta declarado: 40 (M, PECUARIO) — anchor CLAUDE.md")
    lines.append(f"  n_H sin outliers     : {len(H_clean)}")
    lines.append(f"  Mediana H sin outliers = ${median_H_clean:,.0f}")
    lines.append(f"  Ratio sin outliers   = {ratio_clean:.2f}:1")
    lines.append(f"  Lectura: brecha persiste, magnitud cambia esperadamente (n menor).")
    lines.append("")
    lines.append("=" * 72)
    lines.append("ARGUMENTO 4 — Dualidad distributiva (referencia tesis p.50-51)")
    lines.append("=" * 72)
    lines.append(f"  En el circuito institucional PSA (n=134 Familia Campesina), la dirección")
    lines.append(f"  de la brecha se INVIERTE: mediana M $277.312 > mediana H $215.688")
    lines.append(f"  (anchor CLAUDE.md, fórmula PSA mensualizado canónica cerrada en F1).")
    lines.append(f"")
    lines.append(f"  Verificable vía: questions/004_psa_formula_canonica.md (cerrada F1)")
    lines.append(f"  No recalculado en este script (excede scope D2). Argumento referenciado.")
    lines.append(f"")
    lines.append(f"  Implicación: la desigualdad NO está en el esquema PSA (que es progresivo")
    lines.append(f"  con mujeres), sino en el mercado de ingresos productivos. Convierte E4 de")
    lines.append(f"  hallazgo descriptivo a argumento de política pública (Plan R2 tesis).")
    lines.append("")
    lines.append("=" * 72)
    lines.append("ARGUMENTO 5 — Concordancia género × capital productivo (refuerzo línea 472 tesis)")
    lines.append("=" * 72)
    lines.append(f"  Segmentación 1 (sexo)        : H {len(H)} / M {len(M)}, ratio mediana 8,5:1")
    lines.append(f"  Segmentación 2 (capital)     : top 6 vs bot 18 ingresos, ratio mediana {ratio_capital:.1f}:1")
    lines.append(f"  Top 6 (capitalizados)        : {top6_h} hombres + {top6_m} mujeres")
    lines.append(f"  Bot 18 (subsistencia)        : {bot18_h} hombres + {bot18_m} mujeres")
    lines.append(f"  Mediana capitalizados        : ${median_capital:,.0f}")
    lines.append(f"  Mediana subsistencia         : ${median_subsist:,.0f}")
    lines.append(f"  Hallazgo crítico             : la concentración del capital productivo es 100% masculina.")
    lines.append(f"  Las 6 mujeres de la muestra están todas en el segmento de subsistencia.")
    lines.append(f"  Lectura para defensa: las dos brechas (8,5:1 género; {ratio_capital:.0f}:1 capital) son")
    lines.append(f"  vistas superpuestas del mismo fenómeno. La asimetría de género en ingresos productivos")
    lines.append(f"  COINCIDE con la asimetría de género en propiedad de activos productivos (ganadería en")
    lines.append(f"  segmento capitalizado, según tesis línea 472). Convierte 8,5:1 de hallazgo descriptivo")
    lines.append(f"  en evidencia de exclusión estructural en propiedad de activos.")
    lines.append(f"  Refuerza el plan R2 (Economía del Cuidado y Cierre de Brechas) tesis.")
    lines.append("")
    lines.append("=" * 72)
    lines.append("VERIFICACIÓN DE PARIDAD CON HANDOFF F4")
    lines.append("=" * 72)
    for c in checks:
        lines.append(check(*c))
    lines.append("")
    if failed:
        lines.append("RESULTADO: FAIL — al menos un valor difiere de lo inscrito en HANDOFF.")
        lines.append("Acción: NO modificar HANDOFF unilateralmente; reportar discrepancia.")
    else:
        lines.append("RESULTADO: OK — todos los valores coinciden con los inscritos en")
        lines.append("audit/fase4/HANDOFF.md sección Justificación Metodológica D2.")
    lines.append("")
    lines.append("=" * 72)
    lines.append("FIN")
    lines.append("=" * 72)

    log_text = "\n".join(lines) + "\n"
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(log_text, encoding="utf-8")

    print(log_text)

    if failed:
        # JSON resumen para debugging
        diff_summary = {
            c[0]: {"got": c[1], "expected": c[2], "tol": c[3]} for c in failed
        }
        print("DRIFT DETECTED:")
        print(json.dumps(diff_summary, indent=2))
        sys.exit(2)


if __name__ == "__main__":
    main()
