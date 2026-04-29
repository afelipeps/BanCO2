"""Auditoria estadistica de los 8 indicadores de la seccion Gobernanza.

Fase 1 — sub-agente Gobernanza. Sale 0 si el script corre sin excepciones; la
decision de "revision OK" queda para el humano al revisar gobernanza_REPORT.md
y el xlsx.

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/gobernanza_audit.py

Produce:
    audit/fase1/gobernanza.xlsx                    (gitignored, binario)
    audit/fase1/scripts/gobernanza_audit.run.log   (stdout, tracked)

Contrato de los 8 indicadores (data.tsx:578-687):
    GO1  Indice de Confianza         kpi_rating         3.5_Calif_Relacion_Masbosques_Cornare
    GO2  Cobertura Tecnica           chart_pie          2.6_Recibe_Acompa0miento_Tecnico_SiNo
    GO3  Frecuencia de Visitas       chart_bar_vertical 2.6_Frecuencia_Acompanamiento
    GO4  Calidad Visita              kpi_rating         4.4_Visitas_Tecnicas_1a5
    GO5  Convivencia Vecinal         chart_pie          4.6_Fortalecio_Relacion_Vecinos
    GO6  Puntualidad Pagos           kpi_rating         4.2_Puntualidad_Pagos_1a5
    GO7  Transparencia               kpi_rating         4.3_Transparencia_Proceso_1a5
    GO8  Participacion               chart_bar_vertical 4.1_Opinion_Tenida_En_Cuenta

Reglas (CLAUDE.md):
- Likert 1-5 -> mediana + IQR + distribucion (heatmap). Nunca barra simple.
- Proporcion binomial -> barra con Wilson CI. Nunca pie de 2 categorias.
- kpi_rating que publica MEDIA en Likert es violacion doble: (1) media ordinal;
  (2) KPI sin dispersion. Reportar media (reconciliar codigo) + mediana (correcto).
- Variables con varianza cero (GO4, GO7 =5 para n=80) levantan flag de artefacto
  de captura. No abrir question (no toca ancla ni narrativa protegida).
"""

from __future__ import annotations

import sys
from pathlib import Path

# Import local sin afectar instalacion global
sys.path.insert(0, str(Path(__file__).parent))

from common import (  # noqa: E402
    ANCHORS,
    IndicadorResultado,
    MetodoRow,
    classify_severity,
    get_connection,
    median_iqr,
    summarize_severities,
    wilson_ci,
    write_excel,
)

SECCION = "Gobernanza"
OUT_XLSX = Path("audit/fase1/gobernanza.xlsx")

# Viz recomendadas por visual_rules del CLAUDE.md
VIZ_RECOM = {
    "GO1": "likert_heatmap + mediana/IQR + diverging_bar",
    "GO2": "proporcion_wilson_bar",  # "Nunca pie de 2 categorias"
    "GO3": "bar_horizontal_proporciones + Wilson CI (nominal 3 categorias)",
    "GO4": "likert_heatmap + mediana/IQR + diverging_bar",
    "GO5": "proporcion_wilson_bar + diverging Likert 4 niveles",
    "GO6": "likert_heatmap + mediana/IQR + diverging_bar",
    "GO7": "likert_heatmap + mediana/IQR + diverging_bar",
    "GO8": "bar_horizontal_proporciones + Wilson CI (ordinal 2 categorias)",
}

HANDOFF_MAP = {
    "GO1": "",
    "GO2": "",
    "GO3": "",
    "GO4": "",
    "GO5": "",
    "GO6": "",
    "GO7": "",
    "GO8": "",
}

ACCION_MAP = {
    "GO1": "Reemplazar KPI media 4.72 por mediana 5 + IQR + distribucion. Declarar asimetria (57/80 dan 5).",
    "GO2": "Migrar pie a barra con IC95 Wilson. Brecha 51.2% vs 48.8% no es significativa vs 50/50 (IC Wilson cruza 0.5).",
    "GO3": "Re-etiquetar buckets con criterio inequivoco del texto libre; reportar n efectivo (37, no 80). Investigar 43 'NA' (no recibe visita) vs GO2 No=41.",
    "GO4": "Revisar instrumento: varianza cero (80/80 dan 5) sobre una poblacion donde 41/80 NO recibe visita ⇒ artefacto de captura (pregunta contestada por todos, no solo visitados).",
    "GO5": "Exponer la variable ordinal completa (No / No ha influido / Si algo / Si mucho) con diverging bar; el pie actual colapsa una escala Likert en 2 categorias.",
    "GO6": "Reemplazar KPI media 3.77 por mediana 4 + IQR [3,4] + distribucion. Es la variable con mas dispersion de la seccion (unica Likert con 3 niveles activos).",
    "GO7": "Idem GO4: varianza cero sobre n=80 ⇒ artefacto; recodificar como proporcion de '5' y declarar limitacion metodologica.",
    "GO8": "Cambiar barra vertical por horizontal con IC95 Wilson; la brecha 87.5/12.5 es narrativamente significativa, reportar IC.",
}


def _likert_stats(con, colname: str, code_mean: float, go_id: str) -> dict:
    """Calcula media, sd, mediana, IQR, IC Wilson por nivel, n efectivo, missing_rate.

    Retorna dict con todo lo necesario para construir los IndicadorResultado de un
    Likert 1-5. Convencion: la media publicada en el codigo se compara con la
    media real; adicionalmente se reporta la mediana con IQR como estadistico
    principal por <statistical_rules>.
    """
    q = f"""
    SELECT
        AVG(TRY_CAST("{colname}" AS INT)) media,
        STDDEV_SAMP(TRY_CAST("{colname}" AS INT)) sd,
        PERCENTILE_DISC(0.5) WITHIN GROUP (ORDER BY TRY_CAST("{colname}" AS INT)) mediana,
        PERCENTILE_DISC(0.25) WITHIN GROUP (ORDER BY TRY_CAST("{colname}" AS INT)) q1,
        PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY TRY_CAST("{colname}" AS INT)) q3,
        COUNT(TRY_CAST("{colname}" AS INT)) n_valid,
        COUNT(*) n_total
    FROM datos
    """
    row = con.execute(q).fetchone()
    media, sd, mediana, q1, q3, n_valid, n_total = row
    n_missing = n_total - n_valid
    missing_rate = n_missing / n_total if n_total else 0.0

    # Distribucion por nivel (para heatmap)
    dist_q = f"""
    SELECT TRY_CAST("{colname}" AS INT) nivel, COUNT(*) k
    FROM datos WHERE TRY_CAST("{colname}" AS INT) IS NOT NULL
    GROUP BY 1 ORDER BY 1
    """
    dist = con.execute(dist_q).df()
    dist_dict = {int(r.nivel): int(r.k) for r in dist.itertuples()}

    # IC Wilson del nivel "maximo" (=5) — proxy de adhesion alta
    k_top = dist_dict.get(5, 0)
    lo_top, hi_top, _ = wilson_ci(k_top, n_valid) if n_valid else (float("nan"),) * 3

    return {
        "media": float(media) if media is not None else float("nan"),
        "sd": float(sd) if sd is not None else float("nan"),
        "mediana": float(mediana) if mediana is not None else float("nan"),
        "q1": float(q1) if q1 is not None else float("nan"),
        "q3": float(q3) if q3 is not None else float("nan"),
        "iqr": float(q3 - q1) if q1 is not None and q3 is not None else float("nan"),
        "n_valid": int(n_valid),
        "n_missing": int(n_missing),
        "missing_rate": float(missing_rate),
        "dist": dist_dict,
        "k_top5": int(k_top),
        "prop_top5": k_top / n_valid if n_valid else float("nan"),
        "ic_top5_lo": lo_top,
        "ic_top5_hi": hi_top,
        "query": q.strip(),
        "dist_query": dist_q.strip(),
        "code_mean": code_mean,
        "go_id": go_id,
        "col": colname,
    }


def main() -> int:
    con = get_connection()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ------------------------------------------------------------------------
    # GO1 — Indice de Confianza (Likert 1-5)
    # Codigo: media 4.72. Variable: 3.5_Calif_Relacion_Masbosques_Cornare.
    # ------------------------------------------------------------------------
    s = _likert_stats(con, "3.5_Calif_Relacion_Masbosques_Cornare", 4.72, "GO1")

    # Fila media (reconciliacion con codigo publicado)
    sev_mean, diff_mean = classify_severity(s["code_mean"], s["media"], s["n_valid"], unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="GO1",
        seccion=SECCION,
        titulo_codigo="Indice de Confianza",
        tipo_stat="media",
        subgrupo="media_publicada",
        valor_codigo=s["code_mean"],
        valor_real=s["media"],
        n_efectivo=s["n_valid"],
        missing_rate=s["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="sd", dispersion_valor=s["sd"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO1"],
        viz_viola_rules=True,  # media en Likert ordinal + KPI sin dispersion
        severidad=sev_mean,
        discrepancia_pp=diff_mean,
        ancla_ref=None,
        notas=f"Distribucion: {s['dist']}. 57/79 (=72.2%) dan el maximo 5. Asimetria fuerte.",
    ))

    # Fila mediana (estadistico correcto por visual_rules + statistical_rules)
    resultados.append(IndicadorResultado(
        id_indicador="GO1",
        seccion=SECCION,
        titulo_codigo="Indice de Confianza",
        tipo_stat="mediana",
        subgrupo="mediana_correcta",
        valor_codigo=None,
        valor_real=s["mediana"],
        n_efectivo=s["n_valid"],
        missing_rate=s["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="IQR", dispersion_valor=s["iqr"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO1"],
        viz_viola_rules=True,
        severidad="nota",  # no discrepancia numerica; nota por viz_rules
        discrepancia_pp=None,
        ancla_ref=None,
        notas=f"Mediana=5, Q1={s['q1']}, Q3={s['q3']}. {s['k_top5']}/{s['n_valid']} ({s['prop_top5']:.1%}) dan 5. Wilson top5 [{s['ic_top5_lo']:.3f}, {s['ic_top5_hi']:.3f}].",
    ))

    metodo.append(MetodoRow(
        id_indicador="GO1",
        variables_fuente="3.5_Calif_Relacion_Masbosques_Cornare",
        query_duckdb=s["query"],
        formula_ic="Wilson 95% sobre k_top5/n_valid (proxy adhesion alta); mediana sin IC (ordinal con moda en extremo).",
        supuestos="Likert 1-5. Asimetria fuerte (72% en 5). TRY_CAST tolera 1 missing.",
        n_missing=s["n_missing"],
        missing_pct=s["missing_rate"] * 100,
        notas_bins=f"Distribucion por nivel: {s['dist']}",
    ))

    # ------------------------------------------------------------------------
    # GO2 — Cobertura Tecnica (proporcion binomial)
    # Codigo: Si 48.8%, No 51.2%. Variable: 2.6_Recibe_Acompa0miento_Tecnico_SiNo.
    # ------------------------------------------------------------------------
    q2 = 'SELECT "2.6_Recibe_Acompa0miento_Tecnico_SiNo" v, COUNT(*) n FROM datos GROUP BY 1 ORDER BY 1'
    df2 = con.execute(q2).df()
    counts2 = {str(r.v): int(r.n) for r in df2.itertuples()}
    n2 = sum(counts2.values())
    k_si = counts2.get("Si", 0)
    k_no = counts2.get("No", 0)

    for etiqueta, k, v_codigo in [
        ("Si Recibe", k_si, 0.488),
        ("No Recibe", k_no, 0.512),
    ]:
        p = k / n2 if n2 else float("nan")
        lo, hi, _ = wilson_ci(k, n2)
        sev, diff = classify_severity(v_codigo, p, n2, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="GO2",
            seccion=SECCION,
            titulo_codigo="Cobertura Tecnica",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n2,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["GO2"],
            viz_viola_rules=True,  # "Nunca pie de 2 categorias"
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=f"Valores Si/No literales del xlsx. Codigo redondea a 1 decimal. IC Wilson cruza 0.5 ⇒ no hay asimetria significativa.",
        ))
    metodo.append(MetodoRow(
        id_indicador="GO2",
        variables_fuente="2.6_Recibe_Acompa0miento_Tecnico_SiNo",
        query_duckdb=q2.strip(),
        formula_ic="Wilson 95% binomial",
        supuestos="Categoria literal 'Si'/'No', sin missings (n=80).",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=None,
    ))

    # ------------------------------------------------------------------------
    # GO3 — Frecuencia de Visitas (nominal 3 categorias, denominador = 37)
    # Codigo: Anual 40.5, Semestral 35.2, 10-12m 24.3.
    # Reconciliacion: 15/37=40.5%, 13/37=35.1%, 9/37=24.3%.
    # El bucket "Semestral" del codigo es una agregacion ambigua (mezcla 'cada ano'
    # capitalizado y 'cada 6 meses' y 'por medio del PSA').
    # ------------------------------------------------------------------------
    q3 = """
    SELECT "2.6_Frecuencia_Acompanamiento" v, COUNT(*) n
    FROM datos WHERE "2.6_Frecuencia_Acompanamiento" NOT IN ('NA') AND "2.6_Frecuencia_Acompanamiento" IS NOT NULL
    GROUP BY 1 ORDER BY 2 DESC
    """
    df3 = con.execute(q3).df()
    rows3 = {str(r.v): int(r.n) for r in df3.itertuples()}
    n3 = sum(rows3.values())

    # Mapping reverse-engineered del codigo:
    # Anual (40.5%) = 15 "Apro1imadamente cada ano" (minusculas)
    # 10-12m (24.3%) = 9 "CADA 10 A 12 MESES"
    # Semestral (35.2%) = 13 = todo lo demas (6 APROX CADA ANO mayus + 1 CADA ANO + 4 APROX CADA 6 MESES + 2 PSA)
    ANUAL_KEY = "Apro1imadamente cada año"
    DIEZ_KEY = "CADA 10 A 12 MESES"
    k_anual = rows3.get(ANUAL_KEY, 0)
    k_10_12 = rows3.get(DIEZ_KEY, 0)
    k_semestral_bucket = n3 - k_anual - k_10_12  # lo que el codigo llama 'Semestral'

    # n_na = 80 - n3
    n_na = 80 - n3
    missing_rate3 = n_na / 80.0

    for etiqueta, k, v_codigo in [
        ("Anual", k_anual, 0.405),
        ("Semestral", k_semestral_bucket, 0.352),
        ("Cada 10-12 Meses", k_10_12, 0.243),
    ]:
        p = k / n3 if n3 else float("nan")
        lo, hi, _ = wilson_ci(k, n3)
        sev, diff = classify_severity(v_codigo, p, n3, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="GO3",
            seccion=SECCION,
            titulo_codigo="Frecuencia de Visitas",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n3,
            missing_rate=missing_rate3,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_vertical",
            viz_recomendada=VIZ_RECOM["GO3"],
            viz_viola_rules=False,  # barra vertical es aceptable para nominal 3 cat
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=f"n efectivo {n3} (sobre 80; 43 NA/sin visita). Categoria 'Semestral' agrega 4 respuestas 'cada 6 meses' + 6+1 'cada ano' mayus + 2 'PSA': recategorizacion ambigua.",
        ))
    metodo.append(MetodoRow(
        id_indicador="GO3",
        variables_fuente="2.6_Frecuencia_Acompanamiento",
        query_duckdb=q3.strip(),
        formula_ic="Wilson 95% por bucket (marginal) sobre n=37",
        supuestos=f"NA (43 casos) = no aplica (no recibe acompanamiento). Cruz con GO2: 41 'No Recibe' + 2 'Si Recibe sin frecuencia declarada'.",
        n_missing=n_na,
        missing_pct=missing_rate3 * 100,
        notas_bins=(
            f"Texto libre raw: {rows3}. Bucket codigo 'Anual'=15 (solo minusculas); "
            f"'10-12 Meses'=9; 'Semestral'=13 (agrega 6 APROX MAYUS + 1 CADA ANO + 4 APROX 6 MESES + 2 PSA). "
            f"Recomendado: separar 'Cada 6 meses' (4), 'Anual agregado' (22=15+6+1), 'Cada 10-12 meses' (9), 'Otro' (2)."
        ),
    ))

    # ------------------------------------------------------------------------
    # GO4 — Calidad Visita (Likert 1-5 con varianza cero)
    # Codigo: media 5.0. Variable: 4.4_Visitas_Tecnicas_1a5.
    # ARTEFACTO: 80/80 dan 5. Incluye a los 41 que NO reciben visita (GO2).
    # ------------------------------------------------------------------------
    s4 = _likert_stats(con, "4.4_Visitas_Tecnicas_1a5", 5.0, "GO4")
    sev_mean4, diff_mean4 = classify_severity(s4["code_mean"], s4["media"], s4["n_valid"], unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="GO4",
        seccion=SECCION,
        titulo_codigo="Calidad Visita",
        tipo_stat="media",
        subgrupo="media_publicada",
        valor_codigo=s4["code_mean"],
        valor_real=s4["media"],
        n_efectivo=s4["n_valid"],
        missing_rate=s4["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="sd", dispersion_valor=s4["sd"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO4"],
        viz_viola_rules=True,
        severidad="handoff",  # artefacto de captura: elevado manualmente
        discrepancia_pp=diff_mean4,
        ancla_ref=None,
        notas=(
            "VARIANZA CERO: 80/80 dan 5 (sd=0). 41/80 declaran no recibir visita (GO2) "
            "pero aun asi respondieron 5 a 'calidad visita'. Artefacto de captura: la "
            "pregunta se contesto por toda la muestra, no solo por los 39 visitados. "
            "Recomendacion: condicionar a GO2=Si y tratar como no informado."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="GO4",
        variables_fuente="4.4_Visitas_Tecnicas_1a5",
        query_duckdb=s4["query"],
        formula_ic="N/A: varianza cero",
        supuestos="Artefacto: la escala se aplico a los 80, no solo a quienes recibieron visita.",
        n_missing=s4["n_missing"],
        missing_pct=s4["missing_rate"] * 100,
        notas_bins=f"Distribucion: {s4['dist']} (todos en 5).",
    ))

    # ------------------------------------------------------------------------
    # GO5 — Convivencia Vecinal (Likert ordinal 4 niveles colapsado a binaria)
    # Codigo: No hubo mejora 68.75%, Hubo mejora 31.25%.
    # Variable: 4.6_Fortalecio_Relacion_Vecinos (4 categorias).
    # ------------------------------------------------------------------------
    q5 = 'SELECT "4.6_Fortalecio_Relacion_Vecinos" v, COUNT(*) n FROM datos GROUP BY 1 ORDER BY 2 DESC'
    df5 = con.execute(q5).df()
    rows5 = {str(r.v): int(r.n) for r in df5.itertuples()}
    n5 = sum(rows5.values())
    k_mejora = rows5.get("Sí, algo", 0) + rows5.get("Sí, mucho", 0)
    k_no_mejora = rows5.get("No ha influido", 0) + rows5.get("No", 0)

    for etiqueta, k, v_codigo in [
        ("Hubo mejora", k_mejora, 0.3125),
        ("No hubo mejora", k_no_mejora, 0.6875),
    ]:
        p = k / n5
        lo, hi, _ = wilson_ci(k, n5)
        sev, diff = classify_severity(v_codigo, p, n5, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="GO5",
            seccion=SECCION,
            titulo_codigo="Convivencia Vecinal",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n5,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["GO5"],
            viz_viola_rules=True,  # pie de 2 categorias + colapso ordinal
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=f"Colapso ordinal 4->2: 'Si algo'+'Si mucho' = {k_mejora}; 'No'+'No ha influido' = {k_no_mejora}. Se pierde informacion ordinal.",
        ))
    # Filas crudas de los 4 niveles (para diverging bar futura)
    for etiqueta_raw, k in rows5.items():
        p = k / n5
        lo, hi, _ = wilson_ci(k, n5)
        resultados.append(IndicadorResultado(
            id_indicador="GO5",
            seccion=SECCION,
            titulo_codigo="Convivencia Vecinal",
            tipo_stat="proporcion",
            subgrupo=f"raw_{etiqueta_raw}",
            valor_codigo=None,
            valor_real=p,
            n_efectivo=n5,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["GO5"],
            viz_viola_rules=True,
            severidad="ok",
            discrepancia_pp=None,
            ancla_ref=None,
            notas=f"Categoria raw pre-colapso. k={k}/{n5}.",
        ))
    metodo.append(MetodoRow(
        id_indicador="GO5",
        variables_fuente="4.6_Fortalecio_Relacion_Vecinos",
        query_duckdb=q5.strip(),
        formula_ic="Wilson 95% por colapso binario + Wilson por cada nivel raw",
        supuestos="Escala ordinal con 4 niveles; el codigo colapsa a 2. Sin missings (n=80).",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"Raw: {rows5}. Colapso: mejora={k_mejora}, no_mejora={k_no_mejora}.",
    ))

    # ------------------------------------------------------------------------
    # GO6 — Puntualidad Pagos (Likert 1-5, unica con dispersion real)
    # Codigo: media 3.77. Variable: 4.2_Puntualidad_Pagos_1a5.
    # ------------------------------------------------------------------------
    s6 = _likert_stats(con, "4.2_Puntualidad_Pagos_1a5", 3.77, "GO6")
    sev_mean6, diff_mean6 = classify_severity(s6["code_mean"], s6["media"], s6["n_valid"], unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="GO6",
        seccion=SECCION,
        titulo_codigo="Puntualidad Pagos",
        tipo_stat="media",
        subgrupo="media_publicada",
        valor_codigo=s6["code_mean"],
        valor_real=s6["media"],
        n_efectivo=s6["n_valid"],
        missing_rate=s6["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="sd", dispersion_valor=s6["sd"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO6"],
        viz_viola_rules=True,  # media en ordinal + KPI sin dispersion
        severidad=sev_mean6,
        discrepancia_pp=diff_mean6,
        ancla_ref=None,
        notas=f"Distribucion: {s6['dist']}. Unica Likert de la seccion con varianza real. Ver mediana (fila aparte).",
    ))
    resultados.append(IndicadorResultado(
        id_indicador="GO6",
        seccion=SECCION,
        titulo_codigo="Puntualidad Pagos",
        tipo_stat="mediana",
        subgrupo="mediana_correcta",
        valor_codigo=None,
        valor_real=s6["mediana"],
        n_efectivo=s6["n_valid"],
        missing_rate=s6["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="IQR", dispersion_valor=s6["iqr"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO6"],
        viz_viola_rules=True,
        severidad="nota",
        discrepancia_pp=None,
        ancla_ref=None,
        notas=f"Mediana=4, Q1={s6['q1']}, Q3={s6['q3']}. Narrativa 'punto de dolor' se sostiene: ningun 1 ni 2; moda en 4; solo 14/79 dan 5.",
    ))
    metodo.append(MetodoRow(
        id_indicador="GO6",
        variables_fuente="4.2_Puntualidad_Pagos_1a5",
        query_duckdb=s6["query"],
        formula_ic="Sin IC por mediana ordinal; dispersion con IQR.",
        supuestos="Likert 1-5. TRY_CAST tolera 1 missing. Nota diccionario: '45 -> 4' corregido (error digit.).",
        n_missing=s6["n_missing"],
        missing_pct=s6["missing_rate"] * 100,
        notas_bins=f"Distribucion por nivel: {s6['dist']}",
    ))

    # ------------------------------------------------------------------------
    # GO7 — Transparencia (Likert 1-5 con varianza cero)
    # Codigo: media 5.0. Variable: 4.3_Transparencia_Proceso_1a5.
    # ARTEFACTO similar a GO4: 80/80 dan 5.
    # ------------------------------------------------------------------------
    s7 = _likert_stats(con, "4.3_Transparencia_Proceso_1a5", 5.0, "GO7")
    sev_mean7, diff_mean7 = classify_severity(s7["code_mean"], s7["media"], s7["n_valid"], unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="GO7",
        seccion=SECCION,
        titulo_codigo="Transparencia",
        tipo_stat="media",
        subgrupo="media_publicada",
        valor_codigo=s7["code_mean"],
        valor_real=s7["media"],
        n_efectivo=s7["n_valid"],
        missing_rate=s7["missing_rate"],
        unidad="likert_1_5",
        ic_low=None, ic_high=None, ic_metodo=None,
        dispersion_tipo="sd", dispersion_valor=s7["sd"],
        viz_actual="kpi_rating",
        viz_recomendada=VIZ_RECOM["GO7"],
        viz_viola_rules=True,
        severidad="handoff",  # artefacto de captura: elevado manualmente
        discrepancia_pp=diff_mean7,
        ancla_ref=None,
        notas=(
            "VARIANZA CERO: 80/80 dan 5 (sd=0). Sospecha de sesgo de respuesta o de "
            "formulacion ('transparencia' como concepto positivo absoluto). La "
            "narrativa 'honestidad' del codigo se mantiene, pero declarar limitacion."
        ),
    ))
    metodo.append(MetodoRow(
        id_indicador="GO7",
        variables_fuente="4.3_Transparencia_Proceso_1a5",
        query_duckdb=s7["query"],
        formula_ic="N/A: varianza cero",
        supuestos="Likert 1-5 sin dispersion. Sin missings (n=80).",
        n_missing=s7["n_missing"],
        missing_pct=s7["missing_rate"] * 100,
        notas_bins=f"Distribucion: {s7['dist']} (todos en 5).",
    ))

    # ------------------------------------------------------------------------
    # GO8 — Participacion (ordinal 2 categorias, 'A veces' / 'Siempre')
    # Codigo: A veces 87.5%, Siempre 12.5%. Variable: 4.1_Opinion_Tenida_En_Cuenta.
    # Diccionario dice 3 categorias pero xlsx solo tiene 2 valores observados.
    # ------------------------------------------------------------------------
    q8 = 'SELECT "4.1_Opinion_Tenida_En_Cuenta" v, COUNT(*) n FROM datos GROUP BY 1 ORDER BY 2 DESC'
    df8 = con.execute(q8).df()
    rows8 = {str(r.v): int(r.n) for r in df8.itertuples()}
    n8 = sum(rows8.values())
    k_aveces = rows8.get("A veces", 0)
    k_siempre = rows8.get("Siempre", 0)

    for etiqueta, k, v_codigo in [
        ("A veces", k_aveces, 0.875),
        ("Siempre", k_siempre, 0.125),
    ]:
        p = k / n8
        lo, hi, _ = wilson_ci(k, n8)
        sev, diff = classify_severity(v_codigo, p, n8, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="GO8",
            seccion=SECCION,
            titulo_codigo="Participacion",
            tipo_stat="proporcion",
            subgrupo=etiqueta,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n8,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_vertical",
            viz_recomendada=VIZ_RECOM["GO8"],
            viz_viola_rules=False,  # barra vertical aceptable para ordinal 2 cat
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=f"Diccionario declara 3 categorias; xlsx tiene solo 'A veces' y 'Siempre' (Nunca ausente). Narrativa 'deficit democratico' se sostiene con IC Wilson: A veces [{lo:.3f}, {hi:.3f}].",
        ))
    metodo.append(MetodoRow(
        id_indicador="GO8",
        variables_fuente="4.1_Opinion_Tenida_En_Cuenta",
        query_duckdb=q8.strip(),
        formula_ic="Wilson 95% binomial",
        supuestos="Solo 2 de 3 categorias del diccionario presentes en datos. Sin missings.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"Raw: {rows8}. Categoria 'Nunca' del diccionario no observada en n=80.",
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
    # Gobernanza no tiene anclas numericas en <anchors> del CLAUDE.md.
    print("\nReconciliacion de anclas (Gobernanza no tiene anclas numericas en CLAUDE.md).")
    anchors_seccion = [r for r in resultados if r.ancla_ref and r.ancla_ref in ANCHORS]
    if anchors_seccion:
        for r in anchors_seccion:
            diff = abs(r.valor_real - ANCHORS[r.ancla_ref])
            status = "ok" if diff < 0.01 else f"DIFF={diff:.4f}"
            print(f"  {r.id_indicador}/{r.subgrupo} vs {r.ancla_ref} ({ANCHORS[r.ancla_ref]}): {status}")
    else:
        print("  (ninguna)")

    # Violaciones visuales
    viola = [r for r in resultados if r.viz_viola_rules]
    viola_ids = sorted({r.id_indicador for r in viola})
    print(f"\nviola_viz_rules (indicadores): {viola_ids} (filas: {len(viola)})")

    print(f"\nxlsx escrito: {OUT_XLSX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
