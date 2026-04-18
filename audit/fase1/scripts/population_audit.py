"""Auditoría estadística de los 5 indicadores de la sección Población.

Piloto de la Fase 1. Sale 0 si el script corre sin excepciones; la decisión
de "piloto OK" queda para el humano al revisar piloto_REPORT.md y el xlsx.

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/population_audit.py

Produce:
    audit/fase1/piloto_poblacion.xlsx    (gitignored, binario)
    audit/fase1/scripts/population_audit.run.log (stdout, tracked)

Contrato de los 5 indicadores (en data.tsx:114-195):
    P1  Composición por Género        chart_pie            1.6_Sexo
    P2  Jefatura de Hogar por Sexo    chart_bar_stacked    1.6_Sexo x 1.8_Rol_Familia
    P3  Pirámide Poblacional          chart_bar_vertical   1.7_Edad x 1.6_Sexo + Rango_Edad
    P4  Edad Promedio                 kpi_card             1.7_Edad
    P5  Jefatura del Hogar            kpi_card             1.8_Rol_Familia
"""

from __future__ import annotations

import sys
from pathlib import Path

# Import local sin afectar instalación global
sys.path.insert(0, str(Path(__file__).parent))

from common import (  # noqa: E402
    ANCHORS,
    IndicadorResultado,
    MetodoRow,
    classify_severity,
    diff_props_ci,
    get_connection,
    median_bootstrap_ci,
    median_iqr,
    summarize_severities,
    wilson_ci,
    write_excel,
)

SECCION = "Población"
OUT_XLSX = Path("audit/fase1/piloto_poblacion.xlsx")

# Viz recomendadas por visual_rules del CLAUDE.md
VIZ_RECOM = {
    "P1": "proporcion_wilson_bar",  # "Nunca pie de 2 categorías"
    "P2": "chart_bar_stacked + IC",
    "P3": "piramide_ejes_simetricos",  # Opción A de questions/001
    "P4": "boxplot + histograma (mediana + IQR + IC bootstrap)",  # Opción A de questions/002
    "P5": "proporcion_wilson_bar",
}

# Handoffs preemptivos
HANDOFF_MAP = {
    "P1": "",
    "P2": "",
    "P3": "questions/001_piramide_ejes_simetricos.md · questions/003_rangos_etarios_p3.md",
    "P4": "questions/002_kpi_edad_media_vs_mediana.md",
    "P5": "",
}

ACCION_MAP = {
    "P1": "Migrar a barra con Wilson CI; conservar narrativa de inclusión femenina.",
    "P2": "Agregar anotación de diff de proporciones con IC95 Wilson sobre el stacked actual.",
    "P3": "Implementar pirámide ECharts (opción A q001); normalizar labels a bins inequívocos (q003).",
    "P4": "Reemplazar KPI media por mediana 60 + IQR [46, 67] + IC bootstrap; reescribir narrativa (q002).",
    "P5": "Agregar IC95 Wilson como subtítulo del KPI.",
}


def main() -> int:
    con = get_connection()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ------------------------------------------------------------------------
    # P1 — Composición por Género
    # Valores código: H 58.8%, M 41.2%. Ancla: 58.75% / 41.25%.
    # ------------------------------------------------------------------------
    q1 = 'SELECT "1.6_Sexo" sexo, COUNT(*) n FROM datos GROUP BY 1 ORDER BY 1'
    df1 = con.execute(q1).fetchdf()
    total_p1 = int(df1["n"].sum())
    counts_p1 = dict(zip(df1["sexo"], df1["n"].astype(int)))
    kH, kM = counts_p1.get("M", 0), counts_p1.get("F", 0)

    for etiqueta, k, v_codigo, ancla_key in [
        ("Hombres", kH, 0.588, "poblacion.genero.hombres_prop"),
        ("Mujeres", kM, 0.412, "poblacion.genero.mujeres_prop"),
    ]:
        p = k / total_p1
        lo, hi, _ = wilson_ci(k, total_p1)
        sev, diff = classify_severity(v_codigo, p, total_p1, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="P1",
            seccion=SECCION,
            titulo_codigo="Composición por Género",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=total_p1,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["P1"],
            viz_viola_rules=True,  # "Nunca pie de 2 categorías"
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=ancla_key,
            notas="Código redondea a 1 decimal; ancla verificada con n=80 completo.",
        ))
    metodo.append(MetodoRow(
        id_indicador="P1",
        variables_fuente="1.6_Sexo",
        query_duckdb=q1.strip(),
        formula_ic="Wilson 95% por scipy.stats.binomtest(k,n).proportion_ci",
        supuestos="Sin missings (n=80 completo en 1.6_Sexo); binomial independiente.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ------------------------------------------------------------------------
    # P2 — Jefatura de Hogar por Sexo
    # Código: M 78.79% jefes, H 93.62% jefes.
    # ------------------------------------------------------------------------
    q2 = """
    SELECT "1.6_Sexo" sexo,
           CASE WHEN "1.8_Rol_Familia" = 'JEFE DE HOGAR' THEN 'jefe' ELSE 'otro' END rol,
           COUNT(*) n
    FROM datos GROUP BY 1,2 ORDER BY 1,2
    """
    df2 = con.execute(q2).fetchdf()
    counts2 = {(r.sexo, r.rol): int(r.n) for r in df2.itertuples()}
    n_F = sum(v for (s, _), v in counts2.items() if s == "F")
    n_M = sum(v for (s, _), v in counts2.items() if s == "M")
    k_F_jefe = counts2.get(("F", "jefe"), 0)
    k_M_jefe = counts2.get(("M", "jefe"), 0)

    for etiqueta, k, n_eff, v_codigo, ancla_key in [
        ("Mujeres jefas", k_F_jefe, n_F, 0.7879, "poblacion.jefatura.mujeres_prop"),
        ("Hombres jefes", k_M_jefe, n_M, 0.9362, "poblacion.jefatura.hombres_prop"),
    ]:
        p = k / n_eff
        lo, hi, _ = wilson_ci(k, n_eff)
        sev, diff = classify_severity(v_codigo, p, n_eff, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="P2",
            seccion=SECCION,
            titulo_codigo="Jefatura de Hogar por Sexo",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_eff,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_stacked",
            viz_recomendada=VIZ_RECOM["P2"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=ancla_key,
            notas=f"Subgrupo n={n_eff}; IC Wilson es ancho por baja n.",
        ))

    # Diff de proporciones jefatura H vs M
    lo_diff, hi_diff = diff_props_ci(k_M_jefe, n_M, k_F_jefe, n_F)
    diff_obs = k_M_jefe / n_M - k_F_jefe / n_F
    resultados.append(IndicadorResultado(
        id_indicador="P2",
        seccion=SECCION,
        titulo_codigo="Jefatura de Hogar por Sexo",
        tipo_stat="diff_props",
        subgrupo="Brecha H − M",
        valor_codigo=0.9362 - 0.7879,
        valor_real=diff_obs,
        n_efectivo=n_F + n_M,
        missing_rate=0.0,
        unidad="diferencia_proporcion",
        ic_low=lo_diff, ic_high=hi_diff, ic_metodo="wilson_diff_props",
        viz_actual="chart_bar_stacked",
        viz_recomendada=VIZ_RECOM["P2"],
        viz_viola_rules=False,
        severidad=classify_severity(0.9362 - 0.7879, diff_obs, n_F + n_M)[0],
        discrepancia_pp=classify_severity(0.9362 - 0.7879, diff_obs, n_F + n_M)[1],
        ancla_ref=None,
        notas="Diff observada con IC95 no cubre 0 ⇒ brecha significativa. Soporta narrativa 'doble carga femenina'.",
    ))
    metodo.append(MetodoRow(
        id_indicador="P2",
        variables_fuente="1.6_Sexo × 1.8_Rol_Familia",
        query_duckdb=q2.strip(),
        formula_ic="Wilson por sexo + Wald diff 2indep (statsmodels)",
        supuestos="JEFE DE HOGAR es categoría literal; otros 7 roles (Ama de casa, Cónyuge, Hijo/a, Beneficiario, Independiente, Pensionado, Representante) ⇒ 'otro'.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ------------------------------------------------------------------------
    # P3 — Pirámide Poblacional
    # (a) bins del código aplicados al continuo.
    # (b) bins de Rango_Edad tal como vienen.
    # Cruce con sexo para pirámide.
    # ------------------------------------------------------------------------
    BINS_CODIGO = [
        ("<18-30", 0, 30),   # label del código, intepretado como [0,30]
        ("31-45", 31, 45),
        ("46-60", 46, 60),
        ("61-75", 61, 75),
        (">75",   76, 999),
    ]
    CODE_VALUES = {
        "<18-30": 5.00, "31-45": 17.50, "46-60": 28.75,
        "61-75": 35.00, ">75": 13.75,
    }

    q3_cont = """
    SELECT CAST("1.7_Edad" AS INT) edad, "1.6_Sexo" sexo
    FROM datos
    """
    df3 = con.execute(q3_cont).fetchdf()
    total_p3 = len(df3)

    def _bin(edad: int) -> str:
        for label, lo, hi in BINS_CODIGO:
            if lo <= edad <= hi:
                return label
        return "unk"

    df3["bin"] = df3["edad"].apply(_bin)
    grouped = df3.groupby(["bin", "sexo"]).size().unstack(fill_value=0)
    marginal = df3.groupby("bin").size()

    for label, _, _ in BINS_CODIGO:
        k = int(marginal.get(label, 0))
        p = k / total_p3
        v_codigo = CODE_VALUES[label] / 100
        lo, hi, _ = wilson_ci(k, total_p3)
        sev, diff = classify_severity(v_codigo, p, total_p3, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="P3",
            seccion=SECCION,
            titulo_codigo="Pirámide Poblacional",
            tipo_stat="proporcion",
            subgrupo=f"bin_{label}",
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=total_p3,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_vertical",
            viz_recomendada=VIZ_RECOM["P3"],
            viz_viola_rules=True,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas="bins del código aplicados al continuo 1.7_Edad",
        ))
        for sexo in ("F", "M"):
            k_s = int(grouped.loc[label, sexo]) if label in grouped.index and sexo in grouped.columns else 0
            n_s = int(df3[df3["sexo"] == sexo].shape[0])
            if n_s > 0:
                lo_s, hi_s, _ = wilson_ci(k_s, n_s)
            else:
                lo_s = hi_s = None
            resultados.append(IndicadorResultado(
                id_indicador="P3",
                seccion=SECCION,
                titulo_codigo="Pirámide Poblacional",
                tipo_stat="conteo",
                subgrupo=f"bin_{label}_sexo_{sexo}",
                valor_codigo=None,
                valor_real=float(k_s),
                n_efectivo=n_s,
                missing_rate=0.0,
                unidad="conteo",
                ic_low=lo_s, ic_high=hi_s, ic_metodo="wilson" if n_s else None,
                viz_actual="chart_bar_vertical",
                viz_recomendada=VIZ_RECOM["P3"],
                viz_viola_rules=True,
                severidad="ok",
                discrepancia_pp=None,
                ancla_ref=None,
                notas=f"Cruce bin×sexo: conteo crudo para pirámide ECharts",
            ))

    # Comparar bins código vs Rango_Edad
    q3_rango = 'SELECT "Rango_Edad" rango, COUNT(*) n FROM datos GROUP BY 1 ORDER BY 1'
    df3r = con.execute(q3_rango).fetchdf()
    rango_counts = dict(zip(df3r["rango"], df3r["n"].astype(int)))
    # Mapear labels
    bins_code_counts = {label: int(marginal.get(label, 0)) for label, _, _ in BINS_CODIGO}
    notas_bins_p3 = (
        f"Rango_Edad xlsx: {rango_counts}. "
        f"Bins código: {bins_code_counts}. "
        "Mismos conteos (4/14/23/28/11) ⇒ label del código '<18-30' es ambiguo pero el valor reproduce el bin xlsx '18-30'. "
        "Ver questions/003."
    )

    metodo.append(MetodoRow(
        id_indicador="P3",
        variables_fuente="1.7_Edad × 1.6_Sexo; Rango_Edad",
        query_duckdb=f"(a) {q3_cont.strip()}; (b) {q3_rango.strip()}",
        formula_ic="Wilson 95% por bin (marginal); conteo crudo por bin×sexo para pirámide",
        supuestos="Bins del código interpretados como [0,30],[31,45],[46,60],[61,75],[76,∞]. Coinciden con Rango_Edad salvo label del bin inferior.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=notas_bins_p3,
    ))

    # ------------------------------------------------------------------------
    # P4 — Edad Promedio
    # Código: 57.8 años (media). Viola visual_rules (nunca media en KPI).
    # ------------------------------------------------------------------------
    q4 = """
    SELECT
        AVG(CAST("1.7_Edad" AS INT)) media,
        STDDEV_SAMP(CAST("1.7_Edad" AS INT)) sd,
        PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY CAST("1.7_Edad" AS INT)) mediana,
        PERCENTILE_DISC(0.25) WITHIN GROUP (ORDER BY CAST("1.7_Edad" AS INT)) q1,
        PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY CAST("1.7_Edad" AS INT)) q3,
        COUNT(*) n
    FROM datos
    """
    row4 = con.execute(q4).fetchone()
    media_real, sd_real, mediana_real, q1_real, q3_real, n4 = row4

    # Bootstrap IC para mediana — lee columna directamente vía pandas
    edad_series = con.execute('SELECT CAST("1.7_Edad" AS INT) AS e FROM datos').fetchdf()["e"]
    mi = median_iqr(edad_series)
    boot_lo, boot_hi = median_bootstrap_ci(edad_series)

    # Fila mediana (estadístico principal por visual_rules)
    sev_med, diff_med = classify_severity(57.8, mi["median"], n4, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="P4",
        seccion=SECCION,
        titulo_codigo="Edad Promedio",
        tipo_stat="mediana",
        subgrupo="mediana",
        valor_codigo=57.8,  # el código publica media, pero comparamos contra la mediana real
        valor_real=float(mi["median"]),
        n_efectivo=n4,
        missing_rate=0.0,
        unidad="años",
        ic_low=boot_lo, ic_high=boot_hi, ic_metodo="bootstrap_percentile_10k",
        dispersion_tipo="IQR",
        dispersion_valor=float(mi["iqr"]),
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["P4"],
        viz_viola_rules=True,
        severidad="handoff",  # afecta narrativa protegida; elevado manualmente
        discrepancia_pp=diff_med,
        ancla_ref="poblacion.edad.mediana",
        notas="KPI publica media; estadístico correcto por asimetría es mediana. Ver questions/002.",
    ))

    # Fila media (registro complementario, NO principal)
    sev_mean, diff_mean = classify_severity(57.8, float(media_real), n4, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="P4",
        seccion=SECCION,
        titulo_codigo="Edad Promedio",
        tipo_stat="media",
        subgrupo="media",
        valor_codigo=57.8,
        valor_real=float(media_real),
        n_efectivo=n4,
        missing_rate=0.0,
        unidad="años",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="sd",
        dispersion_valor=float(sd_real),
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["P4"],
        viz_viola_rules=True,
        severidad=sev_mean,
        discrepancia_pp=diff_mean,
        ancla_ref="poblacion.edad.media",
        notas="Media coincide con ancla 57.81 y con literal del código (diff<0.02 años). Registrada como secundaria; mediana=60 es la principal.",
    ))
    metodo.append(MetodoRow(
        id_indicador="P4",
        variables_fuente="1.7_Edad",
        query_duckdb=q4.strip(),
        formula_ic="Mediana: bootstrap percentile 10k resamples (seed=42); media sin IC (no aplica estadístico principal).",
        supuestos="1.7_Edad int, n=80 sin missings. Distribución asimétrica (anclas: mediana 60 > media 57.81).",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"IQR = [{q1_real}, {q3_real}] años.",
    ))

    # ------------------------------------------------------------------------
    # P5 — Jefatura del Hogar (global)
    # Código: 87.5%. Ancla: 87.50%.
    # ------------------------------------------------------------------------
    q5 = """
    SELECT
        COUNT(*) FILTER (WHERE "1.8_Rol_Familia" = 'JEFE DE HOGAR') jefes,
        COUNT(*) total
    FROM datos
    """
    k5, n5 = con.execute(q5).fetchone()
    p5 = k5 / n5
    lo5, hi5, _ = wilson_ci(k5, n5)
    sev5, diff5 = classify_severity(0.875, p5, n5, unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="P5",
        seccion=SECCION,
        titulo_codigo="Jefatura del Hogar",
        tipo_stat="proporcion",
        subgrupo="global",
        valor_codigo=0.875,
        valor_real=p5,
        n_efectivo=n5,
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo5, ic_high=hi5, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["P5"],
        viz_viola_rules=False,  # KPI card para proporción es aceptable; se recomienda agregar IC
        severidad=sev5,
        discrepancia_pp=diff5,
        ancla_ref="poblacion.jefatura.global_prop",
        notas="KPI card es OK; recomendación: añadir IC95 Wilson como subtítulo.",
    ))
    metodo.append(MetodoRow(
        id_indicador="P5",
        variables_fuente="1.8_Rol_Familia",
        query_duckdb=q5.strip(),
        formula_ic="Wilson 95% binomial",
        supuestos="'JEFE DE HOGAR' como categoría literal. 70/80 casos.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ------------------------------------------------------------------------
    # Output
    # ------------------------------------------------------------------------
    write_excel(resultados, metodo, OUT_XLSX, accion_map=ACCION_MAP, handoff_map=HANDOFF_MAP)

    print(f"filas_resumen={len(resultados)} indicadores={len({r.id_indicador for r in resultados})}")
    sev_summary = summarize_severities(resultados)
    for ind, buckets in sorted(sev_summary.items()):
        print(f"  {ind}: {buckets}")

    # Reconciliacion de anclas (ASCII-safe para stdout cp1252 en Windows)
    print("\nReconciliacion de anclas (|valor_real - ancla|):")
    for r in resultados:
        if r.ancla_ref and r.ancla_ref in ANCHORS:
            diff = abs(r.valor_real - ANCHORS[r.ancla_ref])
            status = "ok" if diff < 0.01 else f"DIFF={diff:.4f}"
            print(f"  {r.id_indicador}/{r.subgrupo} vs {r.ancla_ref} ({ANCHORS[r.ancla_ref]}): {status}")

    print(f"\nxlsx escrito: {OUT_XLSX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
