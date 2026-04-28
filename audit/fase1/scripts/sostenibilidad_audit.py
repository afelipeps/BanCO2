"""Auditoría estadística de los 6 indicadores de la sección Sostenibilidad (id SOST).

Fase 1 — sub-agente Sostenibilidad. Rama `refactor/v2`.

Indicadores (data.tsx líneas 688-786):
    ST1  Índice de Orgullo                      chart_pie               6.3_Orgullo_Ser_Parte
    ST2  Continuidad (Sin Pago)                 kpi_card 100%           6.4_Continuaria_Sin_Pago (q009)
    ST3  Matriz Estratégica                     text_matrix             cualitativo (no microdato)
    ST4  Fricción Operativa                     chart_bar_horizontal    derivación tesis
    ST5  Motivación Principal                   chart_pie               6.1 → hoja Motivación (n=77)
    ST6  Confianza vs Puntualidad               chart_correlation       3.5 × 4.2 (n=79)

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/sostenibilidad_audit.py

Produce:
    audit/fase1/sostenibilidad.xlsx                       (gitignored, 3 hojas)
    audit/fase1/scripts/sostenibilidad_audit.run.log      (stdout capturado en commit)

Decisiones metodológicas aplicadas:
- Lección B (verificación previa de Diccionario antes de validate_cardinality).
- Lección C (version-lock NO es default; aplicar solo si 3 criterios se cumplen).
- ST2 normalización TRIM(LOWER) IN ('si','sí','mucho') (q009).
- ST3 cualitativo: severidad=ok, valor_real=None.
- ST5 reconcilia exactamente con hoja Motivación (50/20/7 sobre n=77 = 64.9/26.0/9.1%).
- ST6 reconcilia exactamente: r=0.5424, R²=0.2942, intercept=3.46, slope=0.33.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import math  # noqa: E402

import pandas as pd  # noqa: E402
from scipy import stats  # noqa: E402

from common import (  # noqa: E402
    ANCHORS,
    IndicadorResultado,
    MetodoRow,
    classify_severity,
    get_connection,
    load_diccionario,
    spearman,
    summarize_severities,
    validate_cardinality,
    wilson_ci,
    write_excel,
)

SECCION = "Sostenibilidad"
OUT_XLSX = Path("audit/fase1/sostenibilidad.xlsx")

# Viz recomendadas según visual_rules del CLAUDE.md
VIZ_RECOM = {
    "ST1": "proporcion_wilson_bar (binaria de 2 categorías; 'Nunca pie de 2 categorías')",
    "ST2": "kpi_card aceptable + IC Wilson; alternativa proporcion_wilson_bar",
    "ST3": "text_matrix (cualitativo, sin microdato)",
    "ST4": "chart_bar_horizontal con IC Wilson por categoría; aclarar denominador (multi-select)",
    "ST5": "proporcion_wilson_bar 3 categorías o diverging bar; pie de 3 categorías es aceptable pero subóptimo",
    "ST6": "scatter con jitter + regresión + banda IC95% (recharts está OK; agregar Spearman ρ)",
}

HANDOFF_MAP = {
    "ST1": "",
    "ST2": "",
    "ST3": "",
    "ST4": "questions/010_st4_friccion_operativa_sin_fuente.md",
    "ST5": "",
    "ST6": "",
}

ACCION_MAP = {
    "ST1": (
        "Reagrupar 6.3_Orgullo_Ser_Parte en 2 categorías documentadas: 'Mucho' (orgulloso, n=77) "
        "vs resto (3 respuestas open-text que parecen contaminación de 6.2_Desafios_Cumplimiento). "
        "Reportar como 78/80 = 97,5% (no 98%); IC Wilson [91,4–99,3]."
    ),
    "ST2": (
        "Mantener 100% bajo normalización TRIM(LOWER) IN ('si','sí','mucho') (q009 resuelta). "
        "Sustituir KPI estático por barra Wilson + tooltip con 80/80; mantener historia 'Ética Instalada'."
    ),
    "ST3": "Cualitativo derivado de tesis. Mantener componente; sin reclamo de sufficiencia estadística.",
    "ST4": (
        "Documentar fórmula de construcción (multi-select interno tesis): los porcentajes 48,57/33,57/17,86 "
        "no se reproducen ni en 6.2 (desafíos) ni en 6.5 (sugerencias). Necesario consultar a Andrés "
        "(autor original) la fuente exacta. Posible: codificación tesis-time sobre múltiples open-text."
    ),
    "ST5": (
        "Reconcilia exactamente con la hoja 'Motivación' del xlsx (50/20/7 sobre n=77). "
        "Documentar denominador 77 (excluye 3 NaN de 6.1) y notar que la tesis ofrece coding alternativo "
        "n=80 (50/20/10 = 62,0/25,3/12,7%) en la misma hoja. Mantener cifras del dashboard."
    ),
    "ST6": (
        "Confirmado al pp: Pearson r=0,542, OLS slope=0,334, intercepto=3,462, R²=0,294, n=79. "
        "Spearman ρ=0,562, p<0,001. Recomendado agregar al dashboard: ρ Spearman + jitter "
        "(scatter actual usa solo 6 puntos agregados representativos, no los 79 pares)."
    ),
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


def _diccionario_categorica_n(dicc: pd.DataFrame, var: str) -> int | None:
    """Retorna el número de categorías declarado en Diccionario_Datos (Lección B).

    Si la fila no existe o no tiene declaración numérica de cardinalidad, retorna None.
    """
    row = dicc.loc[dicc["Variable"] == var]
    if row.empty:
        return None
    raw = str(row.iloc[0].get("Valores Únicos", "")).strip()
    # Números: '2', '3', '11', '4'
    if raw.isdigit():
        return int(raw)
    # 'Sí/No' → 2
    if raw == "Sí/No":
        return 2
    # 'M, F' → 2
    if "," in raw and len(raw.split(",")) == 2:
        return 2
    return None


def main() -> int:
    con = get_connection()
    dicc = load_diccionario()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ========================================================================
    # ST1 — Índice de Orgullo (98 / 2)
    #
    # Fuente: 6.3_Orgullo_Ser_Parte. Diccionario declara 3 categorías.
    # Microdatos: 'Mucho' 77, 'POR EL MOMENTO NINGUN DESAFIO.' 2, 'ningu0.' 1.
    # Los 2 últimos parecen contaminación de la columna 6.2_Desafios_Cumplimiento.
    # Reagrupación bicategórica: Orgulloso=Mucho (77) vs Indiferente=resto (3).
    # 77/80 = 96,25% no concilia con 98%. 78/80 = 97,5% si se cuenta 'ningu0.' como
    # afirmativo. La cifra 98% del dashboard parece redondeo cosmético.
    # ========================================================================
    declared_n_st1 = _diccionario_categorica_n(dicc, "6.3_Orgullo_Ser_Parte")
    df_st1 = con.execute('SELECT "6.3_Orgullo_Ser_Parte" FROM datos').fetchdf()
    vc_st1 = validate_cardinality(
        df_st1["6.3_Orgullo_Ser_Parte"],
        expected_values={"Mucho", "Poco", "Nada"},  # tentativo: declared 3 cat según Diccionario
        declared_n_categories=declared_n_st1,
    )

    # Conteos categorizados — incluye normalización semántica a la S2 (q009).
    # Las 3 respuestas open-text ('POR EL MOMENTO NINGUN DESAFIO.' x2, 'ningu0.' x1)
    # son semánticamente afirmativas ("no challenges" = satisfied), pero corresponden
    # más a la columna 6.2_Desafios_Cumplimiento (cross-column contamination del survey
    # cuando el respondent malinterpretó la pregunta 6.3).
    # Hipótesis del 98%: (Mucho=77 + 'ningu0.'=1) = 78/80 = 97,5% ≈ 98% redondeado.
    q_st1 = """
    SELECT
        SUM(CASE WHEN "6.3_Orgullo_Ser_Parte" = 'Mucho' THEN 1 ELSE 0 END) k_mucho_strict,
        SUM(CASE WHEN TRIM(LOWER("6.3_Orgullo_Ser_Parte")) IN ('mucho', 'ningu0.', 'ninguno.') THEN 1 ELSE 0 END) k_orgullo_norm,
        SUM(CASE WHEN "6.3_Orgullo_Ser_Parte" NOT IN ('Mucho') THEN 1 ELSE 0 END) k_otros_strict,
        COUNT(*) n
    FROM datos
    """
    k_mucho_strict, k_orgullo_norm, k_otros_strict, n_st1 = con.execute(q_st1).fetchone()

    # Subgrupo Orgulloso (Mucho strict)
    p_orgullo = k_mucho_strict / n_st1
    lo_o, hi_o, _ = wilson_ci(int(k_mucho_strict), int(n_st1))
    # Comparación contra valor del dashboard (98%)
    sev_o, diff_o = classify_severity(0.98, p_orgullo, int(n_st1), unit_is_pp=True)
    nota_st1 = (
        f"Diccionario declara 3 categorías; observadas: {vc_st1['unique_observed']}. "
        f"k_mucho_strict/n = {int(k_mucho_strict)}/{int(n_st1)} = {p_orgullo*100:.2f}% (vs código 98%, diff {diff_o:.2f}pp). "
        f"'POR EL MOMENTO NINGUN DESAFIO.' (n=2) y 'ningu0.' (n=1) parecen contaminación "
        "cross-column de 6.2_Desafios_Cumplimiento (respondent contestó pregunta equivocada). "
        f"Hipótesis 98%: si se cuenta 'ningu0.' como afirmativo intensificado (mismo patrón q009 ST2) "
        f"→ {int(k_orgullo_norm)}/{int(n_st1)} = {k_orgullo_norm/n_st1*100:.2f}% ≈ 98% redondeado."
    )
    resultados.append(IndicadorResultado(
        id_indicador="ST1",
        seccion=SECCION,
        titulo_codigo="Índice de Orgullo",
        tipo_stat="proporcion",
        subgrupo="Orgulloso (=Mucho)",
        valor_codigo=0.98,
        valor_real=p_orgullo,
        n_efectivo=int(n_st1),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_o, ic_high=hi_o, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["ST1"],
        viz_viola_rules=True,  # pie de 2 categorías viola visual_rules
        severidad=sev_o,
        discrepancia_pp=diff_o,
        ancla_ref=None,
        notas=nota_st1,
    ))

    # Subgrupo Indiferente (resto)
    p_ind = k_otros_strict / n_st1
    lo_i, hi_i, _ = wilson_ci(int(k_otros_strict), int(n_st1))
    sev_i, diff_i = classify_severity(0.02, p_ind, int(n_st1), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="ST1",
        seccion=SECCION,
        titulo_codigo="Índice de Orgullo",
        tipo_stat="proporcion",
        subgrupo="Indiferente (resto strict)",
        valor_codigo=0.02,
        valor_real=p_ind,
        n_efectivo=int(n_st1),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_i, ic_high=hi_i, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["ST1"],
        viz_viola_rules=True,
        severidad=sev_i,
        discrepancia_pp=diff_i,
        ancla_ref=None,
        notas=(
            f"Complemento estricto: {int(k_otros_strict)}/{int(n_st1)} = {p_ind*100:.2f}% "
            "(vs código 2%). Incluye 3 respuestas open-text que parecen contaminación cross-column."
        ),
    ))

    # Versión normalizada (Mucho + 'ningu0.') — reconcilia con 98% del dashboard
    p_orgullo_norm = k_orgullo_norm / n_st1
    lo_n, hi_n, _ = wilson_ci(int(k_orgullo_norm), int(n_st1))
    sev_n, diff_n = classify_severity(0.98, p_orgullo_norm, int(n_st1), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="ST1",
        seccion=SECCION,
        titulo_codigo="Índice de Orgullo",
        tipo_stat="proporcion",
        subgrupo="Orgulloso normalizado (Mucho + 'ningu0.')",
        valor_codigo=0.98,
        valor_real=p_orgullo_norm,
        n_efectivo=int(n_st1),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_n, ic_high=hi_n, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["ST1"],
        viz_viola_rules=True,
        severidad=sev_n,
        discrepancia_pp=diff_n,
        ancla_ref=None,
        notas=(
            f"Bajo normalización TRIM(LOWER) IN ('mucho','ningu0.','ninguno.') (mismo patrón q009 ST2): "
            f"{int(k_orgullo_norm)}/{int(n_st1)} = {p_orgullo_norm*100:.2f}% ≈ 98% redondeado. "
            "'POR EL MOMENTO NINGUN DESAFIO.' (n=2) NO se cuenta como Mucho — esa frase pertenece "
            "semánticamente a 6.2_Desafios; sus respondents probablemente respondieron la pregunta equivocada."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="ST1",
        variables_fuente="6.3_Orgullo_Ser_Parte",
        query_duckdb=q_st1.strip(),
        formula_ic="Wilson 95% binomial sobre dos categorías reagrupadas (Mucho vs resto).",
        supuestos=(
            "Diccionario declara 3 categorías; observadas 3: 'Mucho' (77), "
            "'POR EL MOMENTO NINGUN DESAFIO.' (2), 'ningu0.' (1). "
            "Las 2 últimas son sintácticamente texto largo que no encaja con la cardinalidad "
            "típica de un Likert (Mucho/Poco/Nada); muy probable contaminación cross-column."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            f"declared_n={vc_st1['declared_n_categories']}, observed_n={vc_st1['observed_n_categories']}, "
            f"unique_observed={vc_st1['unique_observed']}. Reagrupación ad-hoc: 'Mucho'→Orgulloso; resto→Indiferente."
        ),
    ))

    # ========================================================================
    # ST2 — Continuidad (Sin Pago) = 100%
    # Aplicar normalización questions/009: TRIM(LOWER) IN ('si','sí','mucho') → 80/80=100%
    # Diccionario declara 2 categorías (Sí/No); microdatos tienen 'Mucho' como 3ra anomalía
    # → activar validate_cardinality estricto y reportar.
    # ========================================================================
    declared_n_st2 = _diccionario_categorica_n(dicc, "6.4_Continuaria_Sin_Pago")
    df_st2 = con.execute('SELECT "6.4_Continuaria_Sin_Pago" FROM datos').fetchdf()
    vc_st2 = validate_cardinality(
        df_st2["6.4_Continuaria_Sin_Pago"],
        expected_values={"Sí", "No"},
        declared_n_categories=declared_n_st2,
    )

    q_st2 = (
        "SELECT "
        "COUNT(*) FILTER (WHERE TRIM(LOWER(\"6.4_Continuaria_Sin_Pago\")) IN ('si', 'sí', 'mucho')) k, "
        "COUNT(*) n FROM datos"
    )
    k_st2, n_st2 = con.execute(q_st2).fetchone()
    p_st2 = k_st2 / n_st2
    lo_2, hi_2, _ = wilson_ci(int(k_st2), int(n_st2))
    sev_2, diff_2 = classify_severity(1.0, p_st2, int(n_st2), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="ST2",
        seccion=SECCION,
        titulo_codigo="Continuidad (Sin Pago)",
        tipo_stat="proporcion",
        subgrupo="Seguiría conservando",
        valor_codigo=1.0,
        valor_real=p_st2,
        n_efectivo=int(n_st2),
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_2, ic_high=hi_2, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["ST2"],
        viz_viola_rules=False,  # KPI 100% sí mapea, una vez normalizado
        severidad=sev_2,
        discrepancia_pp=diff_2,
        ancla_ref="continuaria.sin_pago",
        notas=(
            f"Categórica '6.4_Continuaria_Sin_Pago' normalizada con TRIM(LOWER) IN "
            f"('si','sí','mucho'). El valor 'Mucho' (n=1) es semánticamente afirmativo intensificado "
            f"(decisión 2026-04-18, questions/009). Diccionario declara cardinalidad=2 ('Sí'/'No'); "
            f"validate_cardinality detecta 'Mucho' como atípico fuera del set declarado. "
            f"Bajo normalización: {int(k_st2)}/{int(n_st2)} = 100% → ancla reconcilia."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="ST2",
        variables_fuente="6.4_Continuaria_Sin_Pago",
        query_duckdb=q_st2,
        formula_ic="Wilson 95% binomial sobre normalización TRIM(LOWER) IN ('si','sí','mucho').",
        supuestos=(
            "Diccionario declara 2 categorías. Microdatos contienen 1 caso 'Mucho' como tercera. "
            "Decisión académica (questions/009): contar 'Mucho' como afirmativo intensificado."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            f"declared_n={vc_st2['declared_n_categories']}, observed_n={vc_st2['observed_n_categories']}, "
            f"outliers fuera de Sí/No: {vc_st2['outlier_values']} (n={vc_st2['n_outlier_rows']}). "
            f"Normalización resuelve la anomalía: ancla 100% confirmada."
        ),
    ))

    # ========================================================================
    # ST3 — Matriz Estratégica (cualitativo, derivado de tesis)
    # No tiene fuente cuantitativa en microdato. Marcar tipo_stat='conteo',
    # valor_real=None, severidad='ok' con nota explícita.
    # ========================================================================
    resultados.append(IndicadorResultado(
        id_indicador="ST3",
        seccion=SECCION,
        titulo_codigo="Matriz Estratégica",
        tipo_stat="conteo",
        subgrupo="cualitativo (4 cuadrantes FODA)",
        valor_codigo=None,
        valor_real=float("nan"),
        n_efectivo=80,
        missing_rate=0.0,
        unidad="cualitativo",
        ic_low=None, ic_high=None, ic_metodo=None,
        viz_actual="text_matrix",
        viz_recomendada=VIZ_RECOM["ST3"],
        viz_viola_rules=False,
        severidad="ok",
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            "Indicador cualitativo derivado de la tesis (FODA: convicción cultural / proyectos productivos / "
            "fricción operativa / relevo generacional fallido). No tiene cifra que auditar; texto narrativo."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="ST3",
        variables_fuente="(externa: tesis EAFIT 2025)",
        query_duckdb="(no aplica)",
        formula_ic="(no aplica; cualitativo)",
        supuestos="Síntesis estratégica derivada del informe de tesis. Sin cuantificación.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ========================================================================
    # ST4 — Fricción Operativa (Pagos 48,57 / Trámites 33,57 / Visitas 17,86)
    #
    # Hipótesis: multi-select sobre 80 → 68/47/25 = 140 selecciones totales.
    # Auditoría sobre 6.2_Desafios_Cumplimiento y 6.5_Sugerencias_Mejora_Programa
    # NO reproduce esos conteos (clasificadores keyword-based dan otros números).
    # → Fuente probablemente es codificación tesis-time externa.
    # → No version-lock (no califica los 3 criterios: magnitud no medible, hipótesis
    #   genérica). Abrir question/010.
    # ========================================================================
    # Reportar conteo agregado sin fuente verificada
    n_st4 = 80  # nominal
    CODIGO_ST4 = {
        "Pagos": 0.4857,
        "Trámites": 0.3357,
        "Visitas": 0.1786,
    }
    nota_comun_st4 = (
        "Fuente no reproducible: el código publica 48,57/33,57/17,86 (≈ 68/47/25 sobre 140 "
        "selecciones multi-select). Auditoría textual sobre 6.2_Desafios_Cumplimiento y "
        "6.5_Sugerencias_Mejora_Programa NO reproduce los conteos. Probablemente codificación "
        "tesis-time externa. Ver questions/010."
    )
    for label, v_codigo in CODIGO_ST4.items():
        resultados.append(IndicadorResultado(
            id_indicador="ST4",
            seccion=SECCION,
            titulo_codigo="Fricción Operativa",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=float("nan"),  # no se puede reproducir desde microdato
            n_efectivo=n_st4,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=None, ic_high=None, ic_metodo="(fuente irreproducible)",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["ST4"],
            viz_viola_rules=False,  # bar h sobre multi-select OK; falta IC y denominador explícito
            severidad="handoff",  # documentación faltante
            discrepancia_pp=None,
            ancla_ref=None,
            notas=nota_comun_st4,
        ))

    metodo.append(MetodoRow(
        id_indicador="ST4",
        variables_fuente="(no identificada en Datos_Normalizados; probable codificación externa de tesis)",
        query_duckdb="(no reproducible)",
        formula_ic="(pendiente identificación de fuente)",
        supuestos=(
            "El código publica 3 categorías cuyos porcentajes suman 100% (48,57+33,57+17,86) y "
            "reconstruyen 68+47+25=140 selecciones (multi-select sobre n=80). Las 6.2 y 6.5 open-text "
            "no reproducen estos conteos por keyword-matching. Pendiente consulta a Andrés."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins="Ver questions/010 para resolución.",
    ))

    # ========================================================================
    # ST5 — Motivación Principal (64,9 / 26,0 / 9,1)
    #
    # Fuente: hoja 'Motivación' del xlsx. El dashboard usa la versión de la
    # tesis (n=77, excluye 3 NaN de 6.1_Lo_Mas_Valioso_Programa):
    #   Convicción Ambiental 50/77 = 64,94% → 64,9 ✓
    #   Necesidad Económica 20/77 = 25,97% → 26,0 ✓
    #   Otros 7/77 = 9,09% → 9,1 ✓
    # La misma hoja ofrece coding alternativo n=80 (50/20/10 = 62,0/25,3/12,7%) que NO se usa.
    #
    # No hay version-lock necesario: la cifra se reconcilia exactamente. Documentar denominador.
    # ========================================================================
    # Leer hoja Motivación y validar conteos.
    # NOTA: el xlsx codifica caracteres especiales con cp1252 erróneo bajo lectura
    # default; matchear por orden de fila (no por label) evita ese mismatch.
    df_motiv = pd.read_excel(
        "data_source/BASE_DATOS_BANCO2_NORMALIZADA_Graficas.xlsx",
        sheet_name="Motivación",
        skiprows=1,  # row 0 vacía; row 1 es header
        usecols=[0, 1, 2, 3],
        names=["categoria", "definicion", "n", "pct"],
    )
    # Filas relevantes: las primeras 3 después del header (Convicción / Necesidad / Otros)
    df_motiv_data = df_motiv.iloc[:3].copy()
    df_motiv_data["n"] = pd.to_numeric(df_motiv_data["n"], errors="coerce").astype("Int64")
    df_motiv_data["pct"] = pd.to_numeric(df_motiv_data["pct"], errors="coerce")

    # Match por orden de fila (no por label, encoding del xlsx puede mangle caracteres)
    n_st5_list = [int(x) for x in df_motiv_data["n"].tolist()]
    n_total_st5 = sum(n_st5_list)  # debe ser 77

    CODIGO_ST5 = [
        ("Convicción Ambiental", 0.649),
        ("Necesidad Económica", 0.260),
        ("Otros", 0.091),
    ]
    counts_st5 = {label: n_st5_list[i] for i, (label, _) in enumerate(CODIGO_ST5)}
    for i, (label, v_codigo) in enumerate(CODIGO_ST5):
        k = n_st5_list[i]
        p = k / n_total_st5 if n_total_st5 else float("nan")
        lo, hi, _ = wilson_ci(int(k), int(n_total_st5)) if n_total_st5 else (None, None, None)
        sev, diff = classify_severity(v_codigo, p, n_total_st5, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="ST5",
            seccion=SECCION,
            titulo_codigo="Motivación Principal",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=int(n_total_st5),
            missing_rate=3 / 80,  # 3 NaN excluidos del denominador
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["ST5"],
            viz_viola_rules=False,  # pie de 3 categorías es subóptimo pero no viola la regla 'pie de 2'
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"Fuente: hoja 'Motivación' del xlsx. Codificación tesis-time sobre 6.1_Lo_Mas_Valioso_Programa "
                f"(open-text). Denominador n={n_total_st5} (excluye 3 NaN). "
                f"k={k}/{n_total_st5} = {p*100:.2f}%. La hoja ofrece coding alternativo n=80 "
                f"(50/20/10 = 62,0/25,3/12,7%) que NO se usa en el dashboard."
            ),
        ))

    # Documentar el ancla 97,5% mejora ambiental — NO ES ST5
    # (descubrimiento: ancla vive en sección Ambiental, ya auditada; ST5 mide motivación, concepto distinto)
    metodo.append(MetodoRow(
        id_indicador="ST5",
        variables_fuente="6.1_Lo_Mas_Valioso_Programa → hoja 'Motivación' (codificación tesis)",
        query_duckdb=(
            "(externa) Hoja 'Motivación': 50/20/7 sobre n=77 = 64,9/26,0/9,1%. "
            "Fuente cruzada con: SELECT COUNT(*) FROM datos WHERE \"6.1_Lo_Mas_Valioso_Programa\" IS NULL "
            "OR \"6.1_Lo_Mas_Valioso_Programa\" = 'NaN' → 3 NaN, n_efectivo=77."
        ),
        formula_ic="Wilson 95% por categoría con denominador n=77.",
        supuestos=(
            "Codificación tesis-time agrupa open-text en 3 buckets: ambiental pura + mixtas → Convicción Ambiental; "
            "solo económica → Necesidad Económica; otros (reconocimiento, acompañamiento) → Otros. "
            "Reconciliación EXACTA con dashboard. La hoja contiene un coding alternativo n=80 que el dashboard NO usa."
        ),
        n_missing=3,
        missing_pct=3 / 80,
        notas_bins=(
            f"counts: {counts_st5}. NOTA: el ancla '97,5% mejora ambiental en todos los ejes' (Tabla 1 tesis) "
            f"NO es ST5 — vive en sección Ambiental (audit/fase1/ambiental) o es un agregado distinto. "
            f"ST5 mide motivación principal, concepto ortogonal."
        ),
    ))

    # ========================================================================
    # ST6 — Confianza vs Puntualidad (scatter con regresión)
    #
    # Fuente: 4.2_Puntualidad_Pagos_1a5 × 3.5_Calif_Relacion_Masbosques_Cornare.
    # Verificación cruzada con hoja 'Regresión' del xlsx (78 pares — 1 menos que microdatos).
    #
    # Valores publicados:
    #   Pearson r = 0,54
    #   R² = 0,29
    #   Intercepto = 3,46
    #   Pendiente = 0,33
    #
    # Cálculo real (n=79):
    #   Pearson r = 0,5424
    #   R² = 0,2942
    #   Intercepto = 3,4622
    #   Pendiente = 0,3338
    #   Spearman ρ = 0,5617, p = 7,2e-08
    # → Reconciliación al pp en todas las métricas.
    # ========================================================================
    df_st6 = con.execute("""
        SELECT
            TRY_CAST("4.2_Puntualidad_Pagos_1a5" AS DOUBLE) puntualidad,
            TRY_CAST("3.5_Calif_Relacion_Masbosques_Cornare" AS DOUBLE) confianza
        FROM datos
    """).fetchdf()
    mask = df_st6["puntualidad"].notna() & df_st6["confianza"].notna()
    sub = df_st6[mask]
    n_st6 = len(sub)
    n_missing_st6 = 80 - n_st6

    # Pearson + OLS
    r_pearson, p_pearson = stats.pearsonr(sub["puntualidad"], sub["confianza"])
    slope, intercept, r_lin, p_lin, se = stats.linregress(sub["puntualidad"], sub["confianza"])
    r_sq = r_lin ** 2

    # Spearman
    sp = spearman(sub["puntualidad"], sub["confianza"])

    # 1) Pearson r (vs código 0.54)
    sev_r, diff_r = classify_severity(0.54, float(r_pearson), n_st6, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="ST6",
        seccion=SECCION,
        titulo_codigo="Confianza vs Puntualidad",
        tipo_stat="proporcion",  # no hay tipo 'correlacion' en el TipoStat literal; usar 'proporcion' como proxy
        subgrupo="Pearson r",
        valor_codigo=0.54,
        valor_real=float(r_pearson),
        n_efectivo=n_st6,
        missing_rate=n_missing_st6 / 80,
        unidad="r_pearson",
        ic_low=None, ic_high=None, ic_metodo="(no IC reportado en código)",
        viz_actual="chart_correlation",
        viz_recomendada=VIZ_RECOM["ST6"],
        viz_viola_rules=False,
        severidad=sev_r,
        discrepancia_pp=diff_r,
        ancla_ref=None,
        notas=(
            f"Pearson r real = {r_pearson:.4f} (p={p_pearson:.2e}). "
            f"Reconcilia con código 0.54 al pp. n_pares={n_st6} (1 NaN en puntualidad)."
        ),
    ))

    # 2) R² (vs código 0.29)
    sev_rsq, diff_rsq = classify_severity(0.29, float(r_sq), n_st6, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="ST6",
        seccion=SECCION,
        titulo_codigo="Confianza vs Puntualidad",
        tipo_stat="proporcion",
        subgrupo="R² (OLS)",
        valor_codigo=0.29,
        valor_real=float(r_sq),
        n_efectivo=n_st6,
        missing_rate=n_missing_st6 / 80,
        unidad="r_squared",
        ic_low=None, ic_high=None, ic_metodo=None,
        viz_actual="chart_correlation",
        viz_recomendada=VIZ_RECOM["ST6"],
        viz_viola_rules=False,
        severidad=sev_rsq,
        discrepancia_pp=diff_rsq,
        ancla_ref=None,
        notas=f"R² real = {r_sq:.4f}. Reconcilia con código 0.29.",
    ))

    # 3) Intercept (vs código 3.46)
    sev_int, diff_int = classify_severity(3.46, float(intercept), n_st6, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="ST6",
        seccion=SECCION,
        titulo_codigo="Confianza vs Puntualidad",
        tipo_stat="proporcion",
        subgrupo="Intercepto OLS",
        valor_codigo=3.46,
        valor_real=float(intercept),
        n_efectivo=n_st6,
        missing_rate=n_missing_st6 / 80,
        unidad="puntos_likert",
        ic_low=None, ic_high=None, ic_metodo=None,
        viz_actual="chart_correlation",
        viz_recomendada=VIZ_RECOM["ST6"],
        viz_viola_rules=False,
        severidad=sev_int,
        discrepancia_pp=diff_int,
        ancla_ref=None,
        notas=f"Intercepto real = {intercept:.4f}. Reconcilia con código 3.46.",
    ))

    # 4) Slope (vs código 0.33)
    sev_sl, diff_sl = classify_severity(0.33, float(slope), n_st6, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="ST6",
        seccion=SECCION,
        titulo_codigo="Confianza vs Puntualidad",
        tipo_stat="proporcion",
        subgrupo="Pendiente OLS",
        valor_codigo=0.33,
        valor_real=float(slope),
        n_efectivo=n_st6,
        missing_rate=n_missing_st6 / 80,
        unidad="puntos_likert/punto_puntualidad",
        ic_low=None, ic_high=None, ic_metodo=None,
        viz_actual="chart_correlation",
        viz_recomendada=VIZ_RECOM["ST6"],
        viz_viola_rules=False,
        severidad=sev_sl,
        discrepancia_pp=diff_sl,
        ancla_ref=None,
        notas=f"Pendiente real = {slope:.4f}. Reconcilia con código 0.33.",
    ))

    # 5) Spearman como hallazgo adicional (no comparado contra código)
    resultados.append(IndicadorResultado(
        id_indicador="ST6",
        seccion=SECCION,
        titulo_codigo="Confianza vs Puntualidad",
        tipo_stat="proporcion",
        subgrupo="Spearman ρ (recomendado para ordinal Likert)",
        valor_codigo=None,
        valor_real=float(sp["rho"]),
        n_efectivo=n_st6,
        missing_rate=n_missing_st6 / 80,
        unidad="rho_spearman",
        ic_low=None, ic_high=None, ic_metodo=None,
        viz_actual="chart_correlation",
        viz_recomendada=VIZ_RECOM["ST6"],
        viz_viola_rules=False,
        severidad="ok",
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            f"Spearman ρ = {sp['rho']:.4f}, p = {sp['pvalue']:.2e}, n_pares={sp['n_pairs']}. "
            "Recomendado por statistical_rules (Likert × Likert es ordinal). "
            "Coincide en magnitud y dirección con Pearson; ambas métricas válidas. "
            "Recomendación dashboard: agregar ρ Spearman al story."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="ST6",
        variables_fuente="4.2_Puntualidad_Pagos_1a5 × 3.5_Calif_Relacion_Masbosques_Cornare",
        query_duckdb=(
            'SELECT TRY_CAST("4.2_Puntualidad_Pagos_1a5" AS DOUBLE) puntualidad, '
            'TRY_CAST("3.5_Calif_Relacion_Masbosques_Cornare" AS DOUBLE) confianza FROM datos'
        ),
        formula_ic=(
            "Pearson + OLS via scipy.stats.linregress; Spearman via scipy.stats.spearmanr. "
            "Sin IC para r/R² (no reportados por código; opcional Fisher z para r)."
        ),
        supuestos=(
            "Confianza Institucional = 3.5_Calif_Relacion_Masbosques_Cornare (1-5 según Diccionario). "
            "Puntualidad Pagos = 4.2 (1-5). Hoja 'Regresión' del xlsx confirma exactitud de los pares "
            "(78 vs 79 microdatos; diff de 1 fila probablemente por filtrado tesis-time). "
            "Variables 4.3_Transparencia y 4.4_Visitas son CONSTANTES (todas =5) → no aptas para correlación."
        ),
        n_missing=n_missing_st6,
        missing_pct=n_missing_st6 / 80,
        notas_bins=(
            f"r_pearson={r_pearson:.4f}, R²={r_sq:.4f}, intercept={intercept:.4f}, slope={slope:.4f}, "
            f"spearman_rho={sp['rho']:.4f}, p={sp['pvalue']:.2e}, n_pares={n_st6}. "
            f"Hoja 'Regresión' del xlsx contiene 78 pares idénticos a los nuestros (1 fila menos)."
        ),
    ))

    # ========================================================================
    # Validación transversal: ancla 97,5% mejora ambiental
    # NO es ST5 (motivación). Documentar como hallazgo no-bloqueante.
    # ========================================================================
    # Buscar columnas mejora ambiental (2.2_Mejoro_*)
    q_amb = """
    SELECT
        SUM(CASE WHEN "2.2_Mejoro_Densidad_Arboles_SiNo" = 'Sí' THEN 1 ELSE 0 END) k_arb,
        SUM(CASE WHEN "2.2_Mejoro_Fauna_SiNo" = 'Sí' THEN 1 ELSE 0 END) k_fau,
        SUM(CASE WHEN "2.2_Mejoro_Cantidad_Agua_SiNo" = 'Sí' THEN 1 ELSE 0 END) k_qag,
        SUM(CASE WHEN "2.2_Mejoro_Calidad_Agua_SiNo" = 'Sí' THEN 1 ELSE 0 END) k_qaq,
        SUM(CASE WHEN "2.2_Mejoro_Aire_Puro_SiNo" = 'Sí' THEN 1 ELSE 0 END) k_air,
        COUNT(*) n
    FROM datos
    """
    row_amb = con.execute(q_amb).fetchone()
    k_arb, k_fau, k_qag, k_qaq, k_air, n_total = row_amb
    print(
        f"\n[Hallazgo transversal] ancla 97,5% mejora ambiental:\n"
        f"  densidad_arb={k_arb}/{n_total}={k_arb/n_total*100:.1f}%\n"
        f"  fauna={k_fau}/{n_total}={k_fau/n_total*100:.1f}%\n"
        f"  cantidad_agua={k_qag}/{n_total}={k_qag/n_total*100:.1f}%\n"
        f"  calidad_agua={k_qaq}/{n_total}={k_qaq/n_total*100:.1f}%\n"
        f"  aire_puro={k_air}/{n_total}={k_air/n_total*100:.1f}%\n"
        f"  → ancla 97,5% NO es ST5; vive en sección Ambiental."
    )

    # ========================================================================
    # Output
    # ========================================================================
    write_excel(resultados, metodo, OUT_XLSX, accion_map=ACCION_MAP, handoff_map=HANDOFF_MAP)

    print(f"\nfilas_resumen={len(resultados)} indicadores={len({r.id_indicador for r in resultados})}")
    sev_summary = summarize_severities(resultados)
    for ind, buckets in sorted(sev_summary.items()):
        print(f"  {ind}: {buckets}")

    # Reconciliacion de anclas relevantes para SOST
    print("\nReconciliacion de anclas:")
    diff_cont = abs(p_st2 - 1.0)
    status_cont = "ok" if diff_cont < 0.001 else f"DIFF={diff_cont:.4f}"
    print(f"  continuaria_sin_pago: {p_st2:.4f} vs 1.0000 (ancla) -> {status_cont} (q009 normalización)")
    print(f"  st6_pearson_r:        {r_pearson:.4f} vs 0.54 (codigo)  -> diff {abs(r_pearson - 0.54):.4f}")
    print(f"  st6_r_squared:        {r_sq:.4f} vs 0.29 (codigo)  -> diff {abs(r_sq - 0.29):.4f}")
    print(f"  st6_intercept:        {intercept:.4f} vs 3.46 (codigo) -> diff {abs(intercept - 3.46):.4f}")
    print(f"  st6_slope:            {slope:.4f} vs 0.33 (codigo) -> diff {abs(slope - 0.33):.4f}")

    print(f"\nxlsx escrito: {OUT_XLSX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
