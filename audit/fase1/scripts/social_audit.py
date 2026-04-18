"""Auditoría estadística de los 9 indicadores de la sección Social (id SOC).

Fase 1 — sub-agente Social. Rama `refactor/v2`.

Indicadores (data.tsx líneas 294-435):
    S1  Desacople del Incentivo           chart_line_multi       1.9_Año_Ingreso × {3.1,6.4}
    S2  Destino de la Inversión PSA       chart_bar_horizontal   3.2_Inversion_PSA_Seleccion
    S3  Capacidad de Ahorro                chart_bar_vertical     3.3_Mejoro_Ahorro_Estabilidad_SiNo
    S4  Acceso a Educación                 kpi_card               3.7_Acceso_Educacion_SiNo
    S5  Salud (Estufas)                    kpi_card               5.1.1_Tiene_Estufa_Eficiente_SiNo
    S6  Participación Comunitaria          chart_pie              3.6_Participa_Grupos_Comunitarios_SiNo
    S7  Relaciones Vecinales               chart_pie              4.6_Fortalecio_Relacion_Vecinos
    S8  El Valor del Tiempo                chart_bar_horizontal   5.1.3 − 5.1.4 (condicional a 5.1.1=Sí)
    S9  Liderazgo Femenino                 chart_bar_stacked      1.6_Sexo × 3.6_Participa

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/social_audit.py

Produce:
    audit/fase1/social.xlsx                       (gitignored, 3 hojas)
    audit/fase1/scripts/social_audit.run.log      (stdout capturado en commit)
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from common import (  # noqa: E402
    ANCHORS,
    IndicadorResultado,
    MetodoRow,
    classify_severity,
    get_connection,
    median_bootstrap_ci,
    median_iqr,
    summarize_severities,
    wilson_ci,
    write_excel,
)

SECCION = "Social"
OUT_XLSX = Path("audit/fase1/social.xlsx")

# Viz recomendadas según visual_rules del CLAUDE.md
VIZ_RECOM = {
    "S1": "chart_line_multi con eje dual + banda IC por bin",      # serie temporal multi-indicador: aceptable
    "S2": "chart_bar_horizontal + IC Wilson por categoría",         # proporciones mutuamente excluyentes: OK
    "S3": "chart_bar_horizontal o stacked diverging + IC Wilson",   # 3 categorías ordinales: barra vertical pasable
    "S4": "proporcion_wilson_bar",                                   # "Nunca pie"; KPI card aceptable + IC
    "S5": "proporcion_wilson_bar sobre 'tiene estufa' (n=80)",      # KPI 100% no describe la variable
    "S6": "proporcion_wilson_bar",                                   # "Nunca pie de 2 categorías"
    "S7": "chart_bar_horizontal + IC Wilson o diverging Likert",    # originalmente 4 niveles de percepción
    "S8": "chart_bar_horizontal + IC Wilson; revelar n=12 (baja potencia)",
    "S9": "chart_bar_stacked + diff_props CI",
}

HANDOFF_MAP = {
    "S1": "questions/006_s1_desacople_fases_sin_mapping.md",
    "S2": "questions/007_s2_labels_psa_ambiguos.md",
    "S3": "",
    "S4": "",
    "S5": "questions/008_s5_kpi_estufas_100_vs_18.md",
    "S6": "",
    "S7": "questions/009_s7_agrupa_4_categorias_en_2.md",
    "S8": "",
    "S9": "",
}

ACCION_MAP = {
    "S1": "Desvincular del microdato: aclarar provenance (fuente tesis). Si se mantiene, documentar método de construcción de las 4 fases y recalcular con n por bin.",
    "S2": "Renombrar label 'Alim + Educ' → 'Alim + Educ + Vivienda + Productivo' (4-items) para representar fielmente la categoría n=13. 'Otros Mixtos' 24.9% reagrupa 20/80=25%.",
    "S3": "Mantener 3 categorías reagrupadas (No='No Mejoró', NO HA CAMBIADO…='Igual/NS', resto='Sí Mejoró'). Añadir IC Wilson por categoría.",
    "S4": "Reemplazar KPI estático por barra con Wilson CI; subtítulo n=80.",
    "S5": "Resolver disonancia: KPI 100% (sin fuente en microdato) vs story 18.8% (15/80). Proponer KPI = 18.8% tiene_estufa con IC.",
    "S6": "Reemplazar chart_pie (2 categorías) por barra proporción + IC Wilson.",
    "S7": "Documentar agrupación de 4 niveles (No ha influido, No, Sí algo, Sí mucho) en 2 categorías; proponer diverging bar Likert.",
    "S8": "Exponer n=12 y baja potencia. Reclasificar con criterio documentado (aquí: bin_superior=[4,+∞), bin_medio=[1,4), sin_cambio=(-∞,1) con diffs negativos agrupados).",
    "S9": "Añadir diff_props con IC95; indicar que H (n=46) excluye el NaN.",
}


# ----------------------------------------------------------------------------
# Helpers locales
# ----------------------------------------------------------------------------

def _missing_rate(con, columna: str) -> tuple[int, int, float]:
    """Retorna (n_total, n_missing, missing_rate) para una columna dada.

    Considera NULL literal y el string 'NaN' como missing (convención del xlsx).
    """
    n_tot = con.execute("SELECT COUNT(*) FROM datos").fetchone()[0]
    n_null = con.execute(
        f'SELECT COUNT(*) FROM datos WHERE "{columna}" IS NULL OR "{columna}" = \'NaN\''
    ).fetchone()[0]
    return (int(n_tot), int(n_null), float(n_null) / n_tot if n_tot else 0.0)


def main() -> int:
    con = get_connection()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ========================================================================
    # S1 — Desacople del Incentivo
    # Código: 4 fases A/B/C/D con bienestar [71.4, 43.8, 26.7, 14.8]% y compromiso=100%.
    # Microdato: ninguna partición natural (por Año_Ingreso, Cohorte_1, Antiguedad,
    # Rango_Edad) reproduce las 4 cifras. Abrir handoff 006 y registrar:
    # - por fase construida como ventana de Año_Ingreso {A:<2019, B:2019-2020, C:2021-2022, D:>=2023}
    # - 'compromiso' = % 6.4_Continuaria_Sin_Pago='Sí' (con ancla 100% pero real 79/80=98.75%)
    # ========================================================================
    q1_fases = """
    SELECT
        CASE
            WHEN TRY_CAST("1.9_Año_Ingreso" AS INT) < 2019 THEN 'A (pre-2019)'
            WHEN TRY_CAST("1.9_Año_Ingreso" AS INT) < 2021 THEN 'B (2019-2020)'
            WHEN TRY_CAST("1.9_Año_Ingreso" AS INT) < 2023 THEN 'C (2021-2022)'
            ELSE 'D (2023+)'
        END fase,
        COUNT(*) n,
        SUM(CASE WHEN "3.1_Bienestar_Economico_Cambio" = 'Mucho mejor' THEN 1 ELSE 0 END) bienestar_mm,
        SUM(CASE WHEN "6.4_Continuaria_Sin_Pago" = 'Sí' THEN 1 ELSE 0 END) continuaria_si
    FROM datos
    GROUP BY 1 ORDER BY 1
    """
    df_s1 = con.execute(q1_fases).fetchdf()
    CODIGO_BIENESTAR = {"A (pre-2019)": 0.714, "B (2019-2020)": 0.438, "C (2021-2022)": 0.267, "D (2023+)": 0.148}
    for row in df_s1.itertuples():
        p_bienestar = row.bienestar_mm / row.n
        v_codigo = CODIGO_BIENESTAR.get(row.fase)
        lo, hi, _ = wilson_ci(int(row.bienestar_mm), int(row.n))
        sev, diff = classify_severity(v_codigo, p_bienestar, int(row.n), unit_is_pp=True)
        # Elevación manual: ningún mapping natural explica las 4 cifras del código.
        sev = "handoff" if sev in ("ok", "nota") else sev
        resultados.append(IndicadorResultado(
            id_indicador="S1",
            seccion=SECCION,
            titulo_codigo="Desacople del Incentivo",
            tipo_stat="proporcion",
            subgrupo=f"bienestar_{row.fase}",
            valor_codigo=v_codigo,
            valor_real=p_bienestar,
            n_efectivo=int(row.n),
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_line_multi",
            viz_recomendada=VIZ_RECOM["S1"],
            viz_viola_rules=False,  # línea multi para serie temporal ordinal es aceptable
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                "Código usa 4 fases (A/B/C/D) con valores [71.4, 43.8, 26.7, 14.8]% para 'bienestar'. "
                "Ningún split natural por Año_Ingreso reproduce las 4 cifras. Probable origen literal "
                "de tesis, no calculado desde microdato. Ver questions/006."
            ),
        ))
        # Compromiso por fase (100% en código)
        p_compromiso = row.continuaria_si / row.n
        lo_c, hi_c, _ = wilson_ci(int(row.continuaria_si), int(row.n))
        sev_c, diff_c = classify_severity(1.0, p_compromiso, int(row.n), unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="S1",
            seccion=SECCION,
            titulo_codigo="Desacople del Incentivo",
            tipo_stat="proporcion",
            subgrupo=f"compromiso_{row.fase}",
            valor_codigo=1.0,
            valor_real=p_compromiso,
            n_efectivo=int(row.n),
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo_c, ic_high=hi_c, ic_metodo="wilson",
            viz_actual="chart_line_multi",
            viz_recomendada=VIZ_RECOM["S1"],
            viz_viola_rules=False,
            severidad=sev_c,
            discrepancia_pp=diff_c,
            ancla_ref=None,
            notas="'Sí' literal / total en la fase. La fase B incluye 1 caso 'Mucho' (open-text) no contabilizado.",
        ))
    metodo.append(MetodoRow(
        id_indicador="S1",
        variables_fuente="1.9_Año_Ingreso × 3.1_Bienestar_Economico_Cambio × 6.4_Continuaria_Sin_Pago",
        query_duckdb=q1_fases.strip(),
        formula_ic="Wilson 95% por fase (bienestar='Mucho mejor'/n, compromiso='Sí'/n)",
        supuestos=(
            "Fases construidas con ventanas cerradas de Año_Ingreso: A<2019, B∈[2019,2020], "
            "C∈[2021,2022], D≥2023. El split es heurístico; el código no documenta cómo construyó las 4 fases."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            "Ninguna partición natural del microdato (Año_Ingreso, Cohorte_1, Antiguedad, "
            "Rango_Edad) reproduce [71.4, 43.8, 26.7, 14.8]. Probable origen literal de tesis. "
            "Ver questions/006."
        ),
    ))

    # ========================================================================
    # S2 — Destino de la Inversión PSA
    # Código: Solo Alim 35.0, Alim+Prod 23.8, Alim+Educ 16.3, Otros Mixtos 24.9.
    # Microdato 3.2_Inversion_PSA_Seleccion es categoría combinada (string).
    # ========================================================================
    q2 = 'SELECT "3.2_Inversion_PSA_Seleccion" destino, COUNT(*) n FROM datos GROUP BY 1 ORDER BY n DESC'
    df_s2 = con.execute(q2).fetchdf()
    counts_s2 = dict(zip(df_s2["destino"], df_s2["n"].astype(int)))
    n_s2 = int(df_s2["n"].sum())

    # Reconstruye los 4 buckets del código
    BUCKETS = {
        "Solo Alimentación": ["Alimentación"],
        "Alim + Prod": ["Alimentación,Actividad productiva"],
        "Alim + Educ": ["Alimentación,Educación,Vivienda,Actividad productiva"],  # LABEL AMBIGUO
    }
    k_alim = counts_s2.get("Alimentación", 0)
    k_alim_prod = counts_s2.get("Alimentación,Actividad productiva", 0)
    k_mixto4 = counts_s2.get("Alimentación,Educación,Vivienda,Actividad productiva", 0)
    k_otros = n_s2 - k_alim - k_alim_prod - k_mixto4

    CODIGO_S2 = {
        "Solo Alimentación": 0.350,
        "Alim + Prod": 0.238,
        "Alim + Educ": 0.163,
        "Otros Mixtos": 0.249,
    }
    REAL_S2 = {
        "Solo Alimentación": (k_alim, "3.2='Alimentación'"),
        "Alim + Prod": (k_alim_prod, "3.2='Alimentación,Actividad productiva'"),
        "Alim + Educ": (k_mixto4, "3.2='Alimentación,Educación,Vivienda,Actividad productiva' (LABEL AMBIGUO: 4 items, no 2)"),
        "Otros Mixtos": (k_otros, "complemento (Actividad productiva sola, Vivienda, Ahorro, combinaciones raras)"),
    }
    for label, v_codigo in CODIGO_S2.items():
        k, nota_label = REAL_S2[label]
        p = k / n_s2
        lo, hi, _ = wilson_ci(k, n_s2)
        sev, diff = classify_severity(v_codigo, p, n_s2, unit_is_pp=True)
        viz_viola = label == "Alim + Educ"  # el label es un bug documental
        resultados.append(IndicadorResultado(
            id_indicador="S2",
            seccion=SECCION,
            titulo_codigo="Destino de la Inversión PSA",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_s2,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["S2"],
            viz_viola_rules=viz_viola,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=nota_label,
        ))
    metodo.append(MetodoRow(
        id_indicador="S2",
        variables_fuente="3.2_Inversion_PSA_Seleccion",
        query_duckdb=q2.strip(),
        formula_ic="Wilson 95% por categoría recodificada; 4 buckets del código sobre 9 categorías del microdato.",
        supuestos=(
            "El código agrupa 9 respuestas open-text en 4 buckets por coincidencia textual. "
            "El bucket 'Alim + Educ' mapea al string 'Alimentación,Educación,Vivienda,Actividad productiva' "
            "(4 items): label sintácticamente incorrecto. Ver questions/007."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"counts: {counts_s2}",
    ))

    # ========================================================================
    # S3 — Capacidad de Ahorro
    # Código: No Mejoró 51.25, Sí Mejoró 35.0, Igual/NS 13.75. Sobre 3.3_Mejoro_Ahorro.
    # Microdato: open-text con 11 variantes; el código agrupa:
    #   'No' → No Mejoró (41)
    #   'NO HA CAMBIADO…' → Igual/NS (11)
    #   resto → Sí Mejoró (28)
    # ========================================================================
    q3 = """
    SELECT
        CASE
            WHEN "3.3_Mejoro_Ahorro_Estabilidad_SiNo" = 'No' THEN 'No Mejoró'
            WHEN upper("3.3_Mejoro_Ahorro_Estabilidad_SiNo") LIKE 'NO HA CAMBIADO%' THEN 'Igual/NS'
            ELSE 'Sí Mejoró'
        END cat,
        COUNT(*) n
    FROM datos
    GROUP BY 1 ORDER BY 1
    """
    df_s3 = con.execute(q3).fetchdf()
    counts_s3 = dict(zip(df_s3["cat"], df_s3["n"].astype(int)))
    n_s3 = int(df_s3["n"].sum())

    CODIGO_S3 = {"No Mejoró": 0.5125, "Sí Mejoró": 0.3500, "Igual/NS": 0.1375}
    for label, v_codigo in CODIGO_S3.items():
        k = counts_s3.get(label, 0)
        p = k / n_s3
        lo, hi, _ = wilson_ci(k, n_s3)
        sev, diff = classify_severity(v_codigo, p, n_s3, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="S3",
            seccion=SECCION,
            titulo_codigo="Capacidad de Ahorro",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_s3,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_vertical",
            viz_recomendada=VIZ_RECOM["S3"],
            viz_viola_rules=False,  # barra vertical con 3 categorías nominales: aceptable, no Likert clásico
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas="Recodificación de 11 respuestas open-text en 3 categorías.",
        ))
    metodo.append(MetodoRow(
        id_indicador="S3",
        variables_fuente="3.3_Mejoro_Ahorro_Estabilidad_SiNo",
        query_duckdb=q3.strip(),
        formula_ic="Wilson 95% por categoría recodificada.",
        supuestos="Matching textual sobre open-text: 'No' literal (case-sensitive), 'NO HA CAMBIADO%' (prefijo upper), resto Sí.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"counts reagrupados: {counts_s3}",
    ))

    # ========================================================================
    # S4 — Acceso a Educación
    # Código: 6.3%. Real: 5/80 = 6.25%.
    # ========================================================================
    q4 = 'SELECT COUNT(*) FILTER (WHERE "3.7_Acceso_Educacion_SiNo" = \'Sí\') k, COUNT(*) n FROM datos'
    k4, n4 = con.execute(q4).fetchone()
    p4 = k4 / n4
    lo4, hi4, _ = wilson_ci(k4, n4)
    sev4, diff4 = classify_severity(0.063, p4, n4, unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="S4",
        seccion=SECCION,
        titulo_codigo="Acceso a Educación",
        tipo_stat="proporcion",
        subgrupo="acceso_si",
        valor_codigo=0.063,
        valor_real=p4,
        n_efectivo=int(n4),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo4, ic_high=hi4, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["S4"],
        viz_viola_rules=False,
        severidad=sev4,
        discrepancia_pp=diff4,
        ancla_ref=None,
        notas="Código redondea a 1 decimal; 5/80=6.25% con IC Wilson amplio por baja k.",
    ))
    metodo.append(MetodoRow(
        id_indicador="S4",
        variables_fuente="3.7_Acceso_Educacion_SiNo",
        query_duckdb=q4.strip(),
        formula_ic="Wilson 95%.",
        supuestos="'Sí' = acceso; 'No' = no acceso. Sin missings.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ========================================================================
    # S5 — Salud (Estufas)
    # Código: kpiValue='100%' (Mejora Salud), pero story dice 18.8% tienen estufa.
    # Real 5.1.1 Sí=15, No=65. 15/80=18.75%. El KPI 100% no mapea a ninguna variable del microdato.
    # ========================================================================
    q5 = 'SELECT COUNT(*) FILTER (WHERE "5.1.1_Tiene_Estufa_Eficiente_SiNo" = \'Sí\') k, COUNT(*) n FROM datos'
    k5, n5 = con.execute(q5).fetchone()
    p5 = k5 / n5
    lo5, hi5, _ = wilson_ci(k5, n5)
    sev5, diff5 = classify_severity(0.188, p5, n5, unit_is_pp=True)  # comparación vs la cifra del story
    resultados.append(IndicadorResultado(
        id_indicador="S5",
        seccion=SECCION,
        titulo_codigo="Salud (Estufas)",
        tipo_stat="proporcion",
        subgrupo="tiene_estufa_story",
        valor_codigo=0.188,
        valor_real=p5,
        n_efectivo=int(n5),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo5, ic_high=hi5, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["S5"],
        viz_viola_rules=True,  # KPI 100% no refleja ninguna variable; viola 'cero valores hardcodeados sin metadata'
        severidad=sev5,
        discrepancia_pp=diff5,
        ancla_ref=None,
        notas="Reconcilia con la cifra del story (18.8%). El kpiValue '100%' no tiene mapeo al microdato.",
    ))
    # Fila adicional para el kpiValue='100%' sin mapping
    resultados.append(IndicadorResultado(
        id_indicador="S5",
        seccion=SECCION,
        titulo_codigo="Salud (Estufas)",
        tipo_stat="proporcion",
        subgrupo="kpi_100_sin_fuente",
        valor_codigo=1.0,
        valor_real=p5,  # comparamos contra la única variable plausible
        n_efectivo=int(n5),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo5, ic_high=hi5, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["S5"],
        viz_viola_rules=True,
        severidad="handoff",  # elevación manual
        discrepancia_pp=(1.0 - p5) * 100,
        ancla_ref=None,
        notas=(
            "kpiValue='100%' no tiene variable fuente en Diccionario_Datos. "
            "Posible lectura narrativa: 'de las 15 familias con estufa, el 100% reporta mejora', "
            "pero esa variable no existe en microdato. Ver questions/008."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="S5",
        variables_fuente="5.1.1_Tiene_Estufa_Eficiente_SiNo",
        query_duckdb=q5.strip(),
        formula_ic="Wilson 95%.",
        supuestos="Denominador=80 (universo muestra). KPI 100% sin mapeo.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins="Disonancia KPI (100%) vs story (18.8%). Recomendación en ACCION_MAP.",
    ))

    # ========================================================================
    # S6 — Participación Comunitaria
    # Código: 28.7% activos, 71.3% no participan. Variable: 3.6 con 1 NaN.
    # ========================================================================
    _, miss_s6, rate_s6 = _missing_rate(con, "3.6_Participa_Grupos_Comunitarios_SiNo")
    q6 = """
    SELECT
        COUNT(*) FILTER (WHERE "3.6_Participa_Grupos_Comunitarios_SiNo" = 'Sí') k_si,
        COUNT(*) FILTER (WHERE "3.6_Participa_Grupos_Comunitarios_SiNo" = 'No') k_no,
        COUNT(*) FILTER (WHERE "3.6_Participa_Grupos_Comunitarios_SiNo" NOT IN ('Sí', 'No') OR "3.6_Participa_Grupos_Comunitarios_SiNo" IS NULL) k_miss,
        COUNT(*) n
    FROM datos
    """
    k_si, k_no, k_miss, n_s6 = con.execute(q6).fetchone()
    # Dashboard: 23/80=28.75% (usa denominador completo incluyendo missing).
    p_si_full = k_si / n_s6
    lo_s6, hi_s6, _ = wilson_ci(int(k_si), int(n_s6))
    sev_s6, diff_s6 = classify_severity(0.287, p_si_full, int(n_s6), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="S6",
        seccion=SECCION,
        titulo_codigo="Participación Comunitaria",
        tipo_stat="proporcion",
        subgrupo="Activos en Grupos (denominador n=80)",
        valor_codigo=0.287,
        valor_real=p_si_full,
        n_efectivo=int(n_s6),
        missing_rate=rate_s6,
        unidad="proporcion",
        ic_low=lo_s6, ic_high=hi_s6, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["S6"],
        viz_viola_rules=True,  # "Nunca pie de 2 categorías"
        severidad=sev_s6,
        discrepancia_pp=diff_s6,
        ancla_ref=None,
        notas="Denominador n=80 (el NaN se cuenta como 'no participa'). Alternativa excl-NaN: 23/79=29.1%.",
    ))
    # Fila con denominador excluyendo NaN
    n_valid_s6 = int(n_s6) - int(k_miss)
    p_si_valid = k_si / n_valid_s6
    lo_v, hi_v, _ = wilson_ci(int(k_si), n_valid_s6)
    sev_v, diff_v = classify_severity(0.287, p_si_valid, n_valid_s6, unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="S6",
        seccion=SECCION,
        titulo_codigo="Participación Comunitaria",
        tipo_stat="proporcion",
        subgrupo="Activos en Grupos (excl. NaN, n=79)",
        valor_codigo=0.287,
        valor_real=p_si_valid,
        n_efectivo=n_valid_s6,
        missing_rate=rate_s6,
        unidad="proporcion",
        ic_low=lo_v, ic_high=hi_v, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["S6"],
        viz_viola_rules=True,
        severidad=sev_v,
        discrepancia_pp=diff_v,
        ancla_ref=None,
        notas="Recomendado reportar excl. NaN; difference 0.4 pp.",
    ))
    metodo.append(MetodoRow(
        id_indicador="S6",
        variables_fuente="3.6_Participa_Grupos_Comunitarios_SiNo",
        query_duckdb=q6.strip(),
        formula_ic="Wilson 95% sobre dos denominadores: n=80 (con missing como 'No') y n=79 (excl. NaN).",
        supuestos="El microdato tiene 1 fila con valor 'NaN' (string) en la columna.",
        n_missing=int(miss_s6),
        missing_pct=rate_s6,
        notas_bins=None,
    ))

    # ========================================================================
    # S7 — Relaciones Vecinales
    # Código: No hubo mejora 68.75, Hubo mejora 31.25.
    # Microdato 4.6: 4 niveles (No ha influido 54, Sí algo 10, Sí mucho 15, No 1)
    # Agrupación: Sí algo + Sí mucho = 25 (31.25%); resto = 55 (68.75%).
    # ========================================================================
    q7 = 'SELECT "4.6_Fortalecio_Relacion_Vecinos" v, COUNT(*) n FROM datos GROUP BY 1 ORDER BY n DESC'
    df_s7 = con.execute(q7).fetchdf()
    counts_s7 = dict(zip(df_s7["v"], df_s7["n"].astype(int)))
    n_s7 = int(df_s7["n"].sum())
    k_mejora = counts_s7.get("Sí, algo", 0) + counts_s7.get("Sí, mucho", 0)
    k_no_mejora = n_s7 - k_mejora
    for label, k, v_codigo in [
        ("Hubo mejora", k_mejora, 0.3125),
        ("No hubo mejora", k_no_mejora, 0.6875),
    ]:
        p = k / n_s7
        lo, hi, _ = wilson_ci(k, n_s7)
        sev, diff = classify_severity(v_codigo, p, n_s7, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="S7",
            seccion=SECCION,
            titulo_codigo="Relaciones Vecinales",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_s7,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["S7"],
            viz_viola_rules=True,  # pie de 2 categorías + agrupa 4 niveles sin mostrar el Likert
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                "Microdato tiene 4 niveles Likert-like: 'No ha influido' 54, 'Sí, algo' 10, "
                "'Sí, mucho' 15, 'No' 1. El código los colapsa en 2. Ver questions/009."
            ),
        ))
    metodo.append(MetodoRow(
        id_indicador="S7",
        variables_fuente="4.6_Fortalecio_Relacion_Vecinos",
        query_duckdb=q7.strip(),
        formula_ic="Wilson 95%.",
        supuestos="'Sí, algo' + 'Sí, mucho' → mejora; 'No ha influido' + 'No' → no mejora.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"counts originales 4 niveles: {counts_s7}",
    ))

    # ========================================================================
    # S8 — El Valor del Tiempo
    # Código: >4 Hrs 83.3, 1-3 Hrs 8.3, Sin Cambio 8.3. Suma=99.9 (rounding).
    # Subgrupo: familias con estufa (5.1.1='Sí') Y ambos tiempos válidos.
    # ========================================================================
    q8 = """
    SELECT
        (TRY_CAST("5.1.3_Tiempo_Lena_Antes_HorasSemana" AS DOUBLE)
         - TRY_CAST("5.1.4_Tiempo_Lena_Ahora_HorasSemana" AS DOUBLE)) ahorro_horas,
        "1.6_Sexo" sexo
    FROM datos
    WHERE "5.1.1_Tiene_Estufa_Eficiente_SiNo" = 'Sí'
      AND TRY_CAST("5.1.3_Tiempo_Lena_Antes_HorasSemana" AS DOUBLE) IS NOT NULL
      AND TRY_CAST("5.1.4_Tiempo_Lena_Ahora_HorasSemana" AS DOUBLE) IS NOT NULL
    """
    df_s8 = con.execute(q8).fetchdf()
    n_s8 = len(df_s8)
    n_estufa = int(con.execute("SELECT COUNT(*) FROM datos WHERE \"5.1.1_Tiene_Estufa_Eficiente_SiNo\" = 'Sí'").fetchone()[0])
    missing_rate_s8 = (n_estufa - n_s8) / n_estufa if n_estufa > 0 else 0.0

    # Bins replicando el dashboard: >=4 (bin_superior), [1,4) (bin_medio), <1 incluidos diff negativos (sin_cambio)
    k_mayor4 = int((df_s8["ahorro_horas"] >= 4).sum())
    k_1a3 = int(((df_s8["ahorro_horas"] >= 1) & (df_s8["ahorro_horas"] < 4)).sum())
    k_sincambio = int((df_s8["ahorro_horas"] < 1).sum())  # incluye 0 y negativos

    CODIGO_S8 = {"> 4 Hrs/Semana": (0.833, k_mayor4), "1-3 Hrs/Semana": (0.083, k_1a3), "Sin Cambio": (0.083, k_sincambio)}
    for label, (v_codigo, k) in CODIGO_S8.items():
        p = k / n_s8 if n_s8 > 0 else float("nan")
        lo, hi, _ = wilson_ci(k, n_s8) if n_s8 > 0 else (None, None, None)
        sev, diff = classify_severity(v_codigo, p, n_s8, unit_is_pp=True)
        # n<10 bump automático a nota dentro de classify_severity cuando sev=='ok'
        resultados.append(IndicadorResultado(
            id_indicador="S8",
            seccion=SECCION,
            titulo_codigo="El Valor del Tiempo",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_s8,
            missing_rate=missing_rate_s8,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["S8"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"n={n_s8} (subgrupo estufa=Sí con ambos tiempos). 3/15 con estufa tienen NaN en 'ahora'. "
                "Bin '>4 Hrs' = ahorro>=4; 'Sin cambio' incluye diffs negativos (1 caso: 7→21h)."
            ),
        ))

    # Estadístico agregado: mediana y IC bootstrap del ahorro
    mi_s8 = median_iqr(df_s8["ahorro_horas"])
    boot_lo, boot_hi = median_bootstrap_ci(df_s8["ahorro_horas"])
    resultados.append(IndicadorResultado(
        id_indicador="S8",
        seccion=SECCION,
        titulo_codigo="El Valor del Tiempo",
        tipo_stat="mediana",
        subgrupo="Ahorro_horas_mediana",
        valor_codigo=3.7,  # del story
        valor_real=float(mi_s8["median"]),
        n_efectivo=n_s8,
        missing_rate=missing_rate_s8,
        unidad="horas_semana",
        ic_low=boot_lo, ic_high=boot_hi, ic_metodo="bootstrap_percentile_10k",
        dispersion_tipo="IQR",
        dispersion_valor=float(mi_s8["iqr"]),
        viz_actual="chart_bar_horizontal",
        viz_recomendada=VIZ_RECOM["S8"],
        viz_viola_rules=False,
        severidad=classify_severity(3.7, float(mi_s8["median"]), n_s8, unit_is_pp=False)[0],
        discrepancia_pp=classify_severity(3.7, float(mi_s8["median"]), n_s8, unit_is_pp=False)[1],
        ancla_ref=None,
        notas=(
            f"Story del código dice 'promedio 3.7 hrs' (media con outlier negativo de -14). "
            f"Mediana=5.0 horas/semana es el estadístico robusto para esta continua asimétrica con n=12."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="S8",
        variables_fuente="5.1.3 − 5.1.4 | 5.1.1='Sí'",
        query_duckdb=q8.strip(),
        formula_ic="Wilson por categoría (n=12); mediana bootstrap percentile 10k (seed=42).",
        supuestos=(
            "Denominador restringido a estufa=Sí Y ambos tiempos no nulos. "
            "Por bajo n (<10 por categoría) la severidad recibe bump de ok→nota."
        ),
        n_missing=n_estufa - n_s8,
        missing_pct=missing_rate_s8,
        notas_bins=(
            f"n_estufa_si={n_estufa}; n_con_ambos_tiempos={n_s8} "
            f"(missing 3 por falta de tiempo 'ahora'). "
            f"Incluye 1 caso atípico con ahorro=-14 (antes 7h, ahora 21h)."
        ),
    ))

    # ========================================================================
    # S9 — Liderazgo Femenino
    # Código: Mujeres participa 36.36% (12/33), Hombres 23.91% (11/46, excluye NaN).
    # ========================================================================
    q9 = """
    SELECT
        "1.6_Sexo" sexo,
        COUNT(*) FILTER (WHERE "3.6_Participa_Grupos_Comunitarios_SiNo" = 'Sí') k_si,
        COUNT(*) FILTER (WHERE "3.6_Participa_Grupos_Comunitarios_SiNo" IN ('Sí', 'No')) n_eff,
        COUNT(*) n_total
    FROM datos
    GROUP BY 1 ORDER BY 1
    """
    df_s9 = con.execute(q9).fetchdf()
    CODIGO_S9 = {"F": 0.3636, "M": 0.2391}
    for row in df_s9.itertuples():
        k_si = int(row.k_si)
        n_eff = int(row.n_eff)
        p = k_si / n_eff if n_eff else float("nan")
        lo, hi, _ = wilson_ci(k_si, n_eff) if n_eff else (None, None, None)
        v_codigo = CODIGO_S9.get(row.sexo)
        sev, diff = classify_severity(v_codigo, p, n_eff, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="S9",
            seccion=SECCION,
            titulo_codigo="Liderazgo Femenino",
            tipo_stat="proporcion",
            subgrupo=f"participa_sexo_{row.sexo}",
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_eff,
            missing_rate=(int(row.n_total) - n_eff) / int(row.n_total) if row.n_total else 0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_stacked",
            viz_recomendada=VIZ_RECOM["S9"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"Denominador excluye NaN (hombres: 47-1=46). Mujeres n=33, hombres n=46."
            ),
        ))
    metodo.append(MetodoRow(
        id_indicador="S9",
        variables_fuente="1.6_Sexo × 3.6_Participa_Grupos_Comunitarios_SiNo",
        query_duckdb=q9.strip(),
        formula_ic="Wilson 95% por sexo; denominadores excluyen NaN.",
        supuestos="n_F=33 válidos; n_M=46 válidos (1 NaN). Sin diff_props aquí; se deja para visualización.",
        n_missing=1,
        missing_pct=1 / 80,
        notas_bins=None,
    ))

    # ========================================================================
    # Ancla crítica: continuaria.sin_pago (100%). Validación transversal.
    # Reporta el real 79/80 = 98.75% para documentar la discrepancia con la ancla.
    # ========================================================================
    q_ancla = "SELECT COUNT(*) FILTER (WHERE \"6.4_Continuaria_Sin_Pago\" = 'Sí') k, COUNT(*) n FROM datos"
    k_ap, n_ap = con.execute(q_ancla).fetchone()
    p_ap = k_ap / n_ap
    lo_ap, hi_ap, _ = wilson_ci(int(k_ap), int(n_ap))
    resultados.append(IndicadorResultado(
        id_indicador="S_ANCLA",
        seccion=SECCION,
        titulo_codigo="Continuaría sin pago (validación transversal)",
        tipo_stat="proporcion",
        subgrupo="global",
        valor_codigo=1.0,
        valor_real=p_ap,
        n_efectivo=int(n_ap),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_ap, ic_high=hi_ap, ic_metodo="wilson",
        viz_actual="(referencia transversal; no es viz del dashboard)",
        viz_recomendada="n/a",
        viz_viola_rules=False,
        severidad="handoff",  # discrepancia vs ancla
        discrepancia_pp=(1.0 - p_ap) * 100,
        ancla_ref=None,  # ancla no formalizada en ANCHORS: se documenta en questions/005
        notas=(
            "Ancla CLAUDE.md: 'Continuaría sin pago: 100% (n=80)'. Real: 79/80=98.75% — "
            "1 caso con valor open-text 'Mucho' (posible typo de 'Sí, mucho', rol 6.3='ningu0.'). "
            "Ambigüedad documentada en questions/005."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="S_ANCLA",
        variables_fuente="6.4_Continuaria_Sin_Pago",
        query_duckdb=q_ancla,
        formula_ic="Wilson 95% binomial.",
        supuestos="Se cuenta 'Sí' literal como positivo; 'Mucho' se trata como missing para estricto.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins="Ancla 100% vs real 98.75% — ver questions/005.",
    ))

    # ========================================================================
    # Output
    # ========================================================================
    write_excel(resultados, metodo, OUT_XLSX, accion_map=ACCION_MAP, handoff_map=HANDOFF_MAP)

    print(f"filas_resumen={len(resultados)} indicadores={len({r.id_indicador for r in resultados})}")
    sev_summary = summarize_severities(resultados)
    for ind, buckets in sorted(sev_summary.items()):
        print(f"  {ind}: {buckets}")

    # Reconciliacion de anclas relevantes para Social (ASCII-safe)
    print("\nReconciliacion de anclas (|valor_real - ancla|):")
    # Jefatura global (no es indicador directo aqui pero transversal)
    jef_row = con.execute(
        "SELECT COUNT(*) FILTER (WHERE \"1.8_Rol_Familia\" = 'JEFE DE HOGAR') k, COUNT(*) n FROM datos"
    ).fetchone()
    p_jef = jef_row[0] / jef_row[1]
    diff_jef = abs(p_jef - ANCHORS["poblacion.jefatura.global_prop"])
    print(f"  jefatura_global: {p_jef:.4f} vs 0.8750 -> {'ok' if diff_jef < 0.01 else f'DIFF={diff_jef:.4f}'}")
    # Continuaria sin pago
    diff_cont = abs(p_ap - 1.0)
    print(f"  continuaria_sin_pago: {p_ap:.4f} vs 1.0000 (ancla) -> DIFF={diff_cont:.4f} (ver questions/005)")

    print(f"\nxlsx escrito: {OUT_XLSX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
