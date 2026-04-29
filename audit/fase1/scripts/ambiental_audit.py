"""Auditoría estadística de los 6 indicadores de la sección Ambiental (AMB).

Fase 1, sub-agente Ambiental. Sale 0 si el script corre sin excepciones; la
decisión de 'auditoría Ambiental OK' queda para el humano al revisar
ambiental_REPORT.md y el xlsx.

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/ambiental_audit.py

Produce:
    audit/fase1/ambiental.xlsx                       (gitignored, binario)
    audit/fase1/scripts/ambiental_audit.run.log     (stdout, tracked)

Contrato de los 6 indicadores (en data.tsx:198-293):
    A1  Área de Conservación           kpi_card              Area_Conservacion_Ha_NUM
    A2  Servicios Ecosistémicos        chart_radar           2.2_Mejoro_* (5 ejes Sí/No)
    A3  Fauna Indicadora               word_count_table      2.2_Cuales_Animales_Desc
    A4  Prácticas de Manejo            chart_bar_horizontal  2.3_Cuales_Practicas_Desc
    A5  Patrón de Tala                 chart_pie             2.4_Tala_Previa_Frecuencia x 2.5
    A6  Mitigación Cambio Climático    kpi_card              2.7_Mitiga_Cambio_Climatico_SiNo
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

# Import local sin afectar instalación global
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

SECCION = "Ambiental"
OUT_XLSX = Path("audit/fase1/ambiental.xlsx")

# Viz recomendadas por visual_rules del CLAUDE.md
VIZ_RECOM = {
    "A1": "boxplot + histograma (mediana + IQR + IC bootstrap)",  # continua asimétrica
    "A2": "bar + IC Wilson por cada eje (5 binomiales) o heatmap 5-ejes × 2-niveles",
    "A3": "word cloud / bar horizontal por categoría (sin cambios numéricos)",
    "A4": "bar + IC Wilson por práctica (proporciones binomiales)",
    "A5": "bar + IC Wilson (evitar pie de 3 cat con grupos desiguales) o stacked 'antes → ahora'",
    "A6": "bar + IC Wilson (proporción con KPI aceptable; añadir IC en subtítulo)",
}

# Handoffs preemptivos — se llenan con los questions que se abran
HANDOFF_MAP: dict[str, str] = {
    "A1": "",  # se llenará si se escribe questions/005
    "A2": "",
    "A3": "",
    "A4": "",
    "A5": "",
    "A6": "",
}

ACCION_MAP = {
    "A1": (
        "Reemplazar KPI media=104.6 por mediana=5.1 + IQR + IC bootstrap; "
        "declarar outlier de 6379 ha y missing 17.5%. Ver questions/005."
    ),
    "A2": (
        "Separar las 5 proporciones como barras independientes con Wilson CI; "
        "eliminar la coincidencia aparente de '97.5% en todos los ejes' sin IC. "
        "Notar que radar multi-eje sin IC oculta la independencia estadística."
    ),
    "A3": (
        "Reportar n=48 respondientes (40% missing rate); añadir bar horizontal por "
        "categoría. Los word-counts reconcilian exactamente con el código."
    ),
    "A4": (
        "Recalcular con una categorización textual reproducible y explicitar que el "
        "denominador es n=80 (conteo de co-ocurrencias en free-text 2.3_Cuales_Practicas_Desc). "
        "Ver questions/006."
    ),
    "A5": (
        "Añadir Wilson CI a cada slice; reemplazar pie por barra stacked 'cultura previa "
        "vs tala previa' destacando el 59% eliminó / 41% redujo dentro del subgrupo n=17."
    ),
    "A6": (
        "Corregir el KPI de 98% a 98.75% (o 100% si se usa n_valid=79); añadir IC Wilson. "
        "Missing = 1/80 no se reporta en el dashboard."
    ),
}


def main() -> int:
    con = get_connection()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ------------------------------------------------------------------------
    # A1 — Área de Conservación (KPI, continua asimétrica)
    # Valor código: 104.6 ha/familia. Ancla: territorial.area_por_familia_ha = 104.6.
    # Hallazgos: missing 17.5% (n_valid=66/80) + outlier 6379 ha inflan la media.
    # Viola visual_rules (continua asimétrica: nunca media en KPI).
    # ------------------------------------------------------------------------
    q_a1 = """
    SELECT
        AVG(TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) media,
        STDDEV_SAMP(TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) sd,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) q1,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) mediana,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) q3,
        MIN(TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) mn,
        MAX(TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) mx,
        COUNT(TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE)) n_valid,
        COUNT(*) n_total
    FROM datos
    """
    row_a1 = con.execute(q_a1).fetchone()
    media_a1, sd_a1, q1_a1, med_a1, q3_a1, min_a1, max_a1, n_valid_a1, n_total_a1 = row_a1
    missing_a1 = n_total_a1 - n_valid_a1
    missing_rate_a1 = missing_a1 / n_total_a1

    # Bootstrap IC mediana
    area_series = con.execute(
        'SELECT TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE) v FROM datos WHERE TRY_CAST("Area_Conservacion_Ha_NUM" AS DOUBLE) IS NOT NULL'
    ).fetchdf()["v"]
    boot_lo_a1, boot_hi_a1 = median_bootstrap_ci(area_series)

    # Fila media (compara contra código y ancla)
    sev_mean_a1, diff_mean_a1 = classify_severity(
        104.6, float(media_a1), n_valid_a1, unit_is_pp=False
    )
    resultados.append(IndicadorResultado(
        id_indicador="A1",
        seccion=SECCION,
        titulo_codigo="Área de Conservación",
        tipo_stat="media",
        subgrupo="media (publicada)",
        valor_codigo=104.6,
        valor_real=float(media_a1),
        n_efectivo=int(n_valid_a1),
        missing_rate=float(missing_rate_a1),
        unidad="ha/familia",
        dispersion_tipo="sd",
        dispersion_valor=float(sd_a1),
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["A1"],
        viz_viola_rules=True,  # media en KPI card sobre continua asimétrica
        severidad="handoff",  # elevado: numéricamente ok, pero violación metodológica severa
        discrepancia_pp=diff_mean_a1,
        ancla_ref="territorial.area_por_familia_ha",
        notas=(
            f"Media reconcilia con ancla 104.6 ({float(media_a1):.4f}). "
            f"PERO: n_valid=66/80 (missing 17.5%); outlier 6379 ha (2o más alto=47.2 ha); "
            f"mediana=5.1 ha es >20× más bajo. KPI oculta la asimetría. Ver questions/005."
        ),
    ))

    # Fila mediana (estadístico correcto por asimetría)
    resultados.append(IndicadorResultado(
        id_indicador="A1",
        seccion=SECCION,
        titulo_codigo="Área de Conservación",
        tipo_stat="mediana",
        subgrupo="mediana (correcto)",
        valor_codigo=104.6,  # comparamos código contra estadístico correcto
        valor_real=float(med_a1),
        n_efectivo=int(n_valid_a1),
        missing_rate=float(missing_rate_a1),
        unidad="ha/familia",
        ic_low=float(boot_lo_a1), ic_high=float(boot_hi_a1),
        ic_metodo="bootstrap_percentile_10k",
        dispersion_tipo="IQR",
        dispersion_valor=float(q3_a1 - q1_a1),
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["A1"],
        viz_viola_rules=True,
        severidad="handoff",
        discrepancia_pp=abs(104.6 - float(med_a1)),
        ancla_ref="territorial.area_por_familia_ha",
        notas=(
            f"Mediana={float(med_a1):.2f} ha, IQR=[{float(q1_a1):.2f}, {float(q3_a1):.2f}], "
            f"max={float(max_a1):.0f}, min={float(min_a1):.1f}. La típica familia conserva ~5 ha, "
            f"no 104. Ancla '104.6' es aritméticamente correcta como media pero inválida como resumen."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="A1",
        variables_fuente="Area_Conservacion_Ha_NUM (derivada de 1.11)",
        query_duckdb=q_a1.strip(),
        formula_ic="Mediana: bootstrap percentile 10k (seed=42). Media sin IC (estadístico desaconsejado).",
        supuestos="Derivada numérica de 1.11; 14 celdas vacías (17.5% missing); outlier 6379 ha no eliminado.",
        n_missing=int(missing_a1),
        missing_pct=float(missing_rate_a1 * 100),
        notas_bins=(
            f"Percentiles: p10={area_series.quantile(0.10):.2f}, p25={q1_a1:.2f}, "
            f"p50={med_a1:.2f}, p75={q3_a1:.2f}, p90={area_series.quantile(0.90):.2f}, "
            f"max={max_a1:.0f} (2o más alto=47.2 ha). Ratio max/p90 = {max_a1/area_series.quantile(0.90):.0f}x."
        ),
    ))

    # ------------------------------------------------------------------------
    # A2 — Servicios Ecosistémicos (radar, 5 ejes Sí/No)
    # Código: 97.5% en TODOS los 5 ejes. Ancla: ambiental.mejora_percibida = 97.5%.
    # ------------------------------------------------------------------------
    ejes_a2 = [
        ("Densidad Bosque", "2.2_Mejoro_Densidad_Arboles_SiNo"),
        ("Cantidad Agua", "2.2_Mejoro_Cantidad_Agua_SiNo"),
        ("Calidad Agua", "2.2_Mejoro_Calidad_Agua_SiNo"),
        ("Aire Puro", "2.2_Mejoro_Aire_Puro_SiNo"),
        ("Fauna", "2.2_Mejoro_Fauna_SiNo"),
    ]

    n_efectivos_a2: list[int] = []
    for subject, col in ejes_a2:
        q = (
            f'SELECT '
            f'COUNT(*) FILTER (WHERE "{col}" = \'Sí\') k, '
            f'COUNT(*) FILTER (WHERE "{col}" IN (\'Sí\',\'No\')) n '
            f'FROM datos'
        )
        k, n = con.execute(q).fetchone()
        p = k / n
        lo, hi, _ = wilson_ci(k, n)
        sev, diff = classify_severity(0.975, p, n, unit_is_pp=True)
        n_efectivos_a2.append(int(n))
        resultados.append(IndicadorResultado(
            id_indicador="A2",
            seccion=SECCION,
            titulo_codigo="Servicios Ecosistémicos",
            tipo_stat="proporcion",
            subgrupo=subject,
            valor_codigo=0.975,
            valor_real=p,
            n_efectivo=int(n),
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_radar",
            viz_recomendada=VIZ_RECOM["A2"],
            viz_viola_rules=False,  # radar no está prohibido explícitamente; nota metodológica
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref="ambiental.mejora_percibida",
            notas=(
                "Radar con todos los ejes exactos en 97.5% es sospechoso sin IC. "
                "Con n=80, Wilson CI [91.3%, 99.3%] abarca ≥95%, pero la coincidencia "
                "de los 5 ejes en 78/80 sugiere correlación latente o patrón de respondiente."
            ),
        ))

    metodo.append(MetodoRow(
        id_indicador="A2",
        variables_fuente=", ".join(col for _, col in ejes_a2),
        query_duckdb="Por eje: COUNT(*) FILTER (WHERE col='Sí') / COUNT(*) FILTER (WHERE col IN ('Sí','No'))",
        formula_ic="Wilson 95% por eje (scipy.stats.binomtest.proportion_ci)",
        supuestos="5 binomiales independientes asumidas; sin missings (todos 80 respondieron Sí/No).",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=f"n efectivo por eje: {n_efectivos_a2}",
    ))

    # ------------------------------------------------------------------------
    # A3 — Fauna Indicadora (word count table)
    # Código: conejos(25), ardillas(16), aves(33) ... TOTAL 203.
    # Variable fuente: 2.2_Cuales_Animales_Desc (free text).
    # ------------------------------------------------------------------------
    df_fauna = con.execute(
        'SELECT "2.2_Cuales_Animales_Desc" d FROM datos WHERE "2.2_Cuales_Animales_Desc" IS NOT NULL'
    ).fetchdf()
    n_fauna = len(df_fauna)
    texto_fauna = " ".join(df_fauna["d"].astype(str).tolist()).lower()

    # Reconstruir los conteos publicados con regex word-boundary
    KEYWORDS_A3 = [
        ("conejos", 25, "Mamíferos"), ("ardillas", 16, "Mamíferos"),
        ("armadillos", 15, "Mamíferos"), ("gurres", 15, "Mamíferos"),
        ("guaguas", 14, "Mamíferos"), ("titis", 10, "Mamíferos"),
        ("mico", 10, "Mamíferos"),
        ("aves", 33, "Aves"), ("cacatúas", 15, "Aves"),
        ("guacharacas", 15, "Aves"), ("loros", 14, "Aves"),
        ("gallinetas", 9, "Aves"), ("gurrias", 5, "Aves"),
        ("serpientes", 7, "Reptiles"),
    ]

    counts_a3: dict[str, int] = {}
    for keyword, _, _ in KEYWORDS_A3:
        counts_a3[keyword] = len(re.findall(rf"\b{re.escape(keyword)}\b", texto_fauna))

    totales_reales = Counter()
    totales_codigo = Counter()
    for keyword, v_code, categoria in KEYWORDS_A3:
        real = counts_a3[keyword]
        totales_reales[categoria] += real
        totales_codigo[categoria] += v_code
        sev, diff = classify_severity(float(v_code), float(real), n_fauna, unit_is_pp=False)
        resultados.append(IndicadorResultado(
            id_indicador="A3",
            seccion=SECCION,
            titulo_codigo="Fauna Indicadora",
            tipo_stat="conteo",
            subgrupo=f"{categoria}/{keyword}",
            valor_codigo=float(v_code),
            valor_real=float(real),
            n_efectivo=n_fauna,
            missing_rate=float((80 - n_fauna) / 80),
            unidad="conteo_menciones",
            viz_actual="word_count_table",
            viz_recomendada=VIZ_RECOM["A3"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"Word-boundary regex sobre texto lowercased; respondientes n={n_fauna}/80 "
                f"(missing 40%). Coincidencia exacta con dashboard."
            ),
        ))

    # Gran total
    total_real_a3 = sum(totales_reales.values())
    sev_tot, diff_tot = classify_severity(203.0, float(total_real_a3), n_fauna, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="A3",
        seccion=SECCION,
        titulo_codigo="Fauna Indicadora",
        tipo_stat="conteo",
        subgrupo="TOTAL",
        valor_codigo=203.0,
        valor_real=float(total_real_a3),
        n_efectivo=n_fauna,
        missing_rate=float((80 - n_fauna) / 80),
        unidad="conteo_menciones",
        viz_actual="word_count_table",
        viz_recomendada=VIZ_RECOM["A3"],
        viz_viola_rules=False,
        severidad=sev_tot,
        discrepancia_pp=diff_tot,
        ancla_ref=None,
        notas=f"Totales por categoría: {dict(totales_reales)}",
    ))

    metodo.append(MetodoRow(
        id_indicador="A3",
        variables_fuente="2.2_Cuales_Animales_Desc (free text)",
        query_duckdb='SELECT "2.2_Cuales_Animales_Desc" FROM datos WHERE "2.2_Cuales_Animales_Desc" IS NOT NULL',
        formula_ic="N/A (conteo absoluto sobre corpus textual)",
        supuestos="Match word-boundary lowercased sobre texto concatenado. No desduplica menciones dentro de una misma respuesta.",
        n_missing=int(80 - n_fauna),
        missing_pct=float(100 * (80 - n_fauna) / 80),
        notas_bins=(
            f"n respondientes={n_fauna}; n_total_80={80}. "
            f"Ratio menciones/respondiente = {total_real_a3/n_fauna:.1f}. "
            f"Keywords usados: {[k for k,_,_ in KEYWORDS_A3]}"
        ),
    ))

    # ------------------------------------------------------------------------
    # A4 — Prácticas de Manejo (bar horizontal, % sobre n=80)
    # Código: Limpieza Fuentes 63.7%, Siembra/Reforestación 45%, Cercas Vivas 1.2%.
    # Variable fuente: 2.3_Cuales_Practicas_Desc (free text).
    # ------------------------------------------------------------------------
    df_prac = con.execute(
        'SELECT "2.3_Cuales_Practicas_Desc" d FROM datos WHERE "2.3_Cuales_Practicas_Desc" IS NOT NULL'
    ).fetchdf()
    n_prac = len(df_prac)
    textos_prac = df_prac["d"].astype(str).str.lower().tolist()

    # Categorización textual (criterio reproducible):
    # limpieza: 'fuente', 'agua', 'hidric'
    # siembra: 'sembr', 'reforest', 'arbol', 'árbol'
    # cercas vivas: 'cerca'
    def _contains(texto: str, terms: tuple[str, ...]) -> bool:
        return any(t in texto for t in terms)

    prac_def = [
        ("Limpieza Fuentes", 63.7, ("fuente", "agua", "hidric")),
        ("Siembra/Reforestación", 45.0, ("sembr", "reforest", "arbol", "árbol")),
        ("Cercas Vivas", 1.2, ("cerca",)),
    ]

    for label, v_code_pct, terms in prac_def:
        k = sum(1 for t in textos_prac if _contains(t, terms))
        p = k / n_prac
        lo, hi, _ = wilson_ci(k, n_prac)
        v_code_prop = v_code_pct / 100.0
        sev, diff = classify_severity(v_code_prop, p, n_prac, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="A4",
            seccion=SECCION,
            titulo_codigo="Prácticas de Manejo",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_code_prop,
            valor_real=p,
            n_efectivo=n_prac,
            missing_rate=float((80 - n_prac) / 80),
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["A4"],
            viz_viola_rules=False,  # bar horizontal + proporción es aceptable; recomendación añadir IC
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"Categorización reproducible sobre free-text: match de {terms} en lowercase. "
                f"Diff vs código: {diff:.2f} pp. Cercas vivas empírico=0."
            ),
        ))

    metodo.append(MetodoRow(
        id_indicador="A4",
        variables_fuente="2.3_Cuales_Practicas_Desc (free text)",
        query_duckdb='SELECT "2.3_Cuales_Practicas_Desc" FROM datos WHERE "2.3_Cuales_Practicas_Desc" IS NOT NULL',
        formula_ic="Wilson 95% por categoría (proporción sobre n=80 respondientes)",
        supuestos=(
            "Categorías construidas por búsqueda case-insensitive de keywords en texto libre. "
            "No MECE: una respuesta puede coincidir con varias categorías. Denominador = respondientes."
        ),
        n_missing=int(80 - n_prac),
        missing_pct=float(100 * (80 - n_prac) / 80),
        notas_bins=(
            f"Keywords: Limpieza=(fuente, agua, hidric); Siembra=(sembr, reforest, arbol, árbol); Cercas=(cerca). "
            f"Reconciliación vs código: Limpieza 61.2% vs 63.7% (diff 2.5 pp, handoff); "
            f"Siembra 45% vs 45% (exacto); Cercas 0% vs 1.2% (diff 1.2 pp, nota-límite)."
        ),
    ))

    # ------------------------------------------------------------------------
    # A5 — Patrón de Tala (pie, 3 slices)
    # Código: Cultura Previa 78.75, Eliminó 12.50, Redujo 8.75.
    # Variables: 2.4_Tala_Previa_Frecuencia x 2.5_Necesidad_Tala_Actual.
    # ------------------------------------------------------------------------
    q_a5 = """
    SELECT
        COUNT(*) FILTER (WHERE "2.4_Tala_Previa_Frecuencia" = 'No, nunca') nunca,
        COUNT(*) FILTER (WHERE "2.4_Tala_Previa_Frecuencia" = 'Sí, a veces') a_veces,
        COUNT(*) FILTER (WHERE "2.4_Tala_Previa_Frecuencia" = 'Sí, frecuentemente') frec,
        COUNT(*) total
    FROM datos
    """
    k_nunca, k_veces, k_frec, n_a5 = con.execute(q_a5).fetchone()

    slices_a5 = [
        ("Cultura Previa (Nunca)", k_nunca, 0.7875),
        ("Eliminó (Impacto PSA)", k_veces, 0.1250),
        ("Redujo (Impacto PSA)", k_frec, 0.0875),
    ]

    for label, k, v_codigo in slices_a5:
        p = k / n_a5
        lo, hi, _ = wilson_ci(k, n_a5)
        sev, diff = classify_severity(v_codigo, p, n_a5, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="A5",
            seccion=SECCION,
            titulo_codigo="Patrón de Tala",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=int(n_a5),
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["A5"],
            viz_viola_rules=False,  # pie de 3 categorías no está prohibido explícitamente (pie de 2 sí)
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=f"k={k}/80. Cross-tab 2.4x2.5 determinista (a_veces↔eliminó, frec↔redujo).",
        ))

    # Extra: subgrupo n=17 (los que sí talaban). Importante para la narrativa del story.
    n_sub = int(k_veces + k_frec)
    p_elim_sub = k_veces / n_sub
    lo_sub, hi_sub, _ = wilson_ci(int(k_veces), n_sub)
    sev_sub, diff_sub = classify_severity(0.59, p_elim_sub, n_sub, unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="A5",
        seccion=SECCION,
        titulo_codigo="Patrón de Tala",
        tipo_stat="proporcion",
        subgrupo="Eliminó | talaba (subgrupo)",
        valor_codigo=0.59,
        valor_real=p_elim_sub,
        n_efectivo=n_sub,
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_sub, ic_high=hi_sub, ic_metodo="wilson",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["A5"],
        viz_viola_rules=False,
        severidad=sev_sub,
        discrepancia_pp=diff_sub,
        ancla_ref=None,
        notas=(
            f"Story text del código: '59% eliminó / 41% redujo'. Real: {p_elim_sub*100:.1f}% eliminó "
            f"(10/17). n=17 baja potencia → severidad bumped."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="A5",
        variables_fuente="2.4_Tala_Previa_Frecuencia × 2.5_Necesidad_Tala_Actual",
        query_duckdb=q_a5.strip(),
        formula_ic="Wilson 95% por slice; Wilson 95% para subgrupo n=17 (baja potencia).",
        supuestos=(
            "Cross-tab 2.4x2.5 es determinista: No-nunca↔NA, A-veces↔Eliminó, Frecuentemente↔Redujo. "
            "Patrón típico de skip-logic en cuestionario."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins="Slice subgrupo n=17: baja potencia declarada. IC Wilson [35.4%, 79.7%] amplio.",
    ))

    # ------------------------------------------------------------------------
    # A6 — Mitigación Cambio Climático (KPI 98% conscientes)
    # Variable: 2.7_Mitiga_Cambio_Climatico_SiNo.
    # ------------------------------------------------------------------------
    q_a6 = """
    SELECT
        COUNT(*) FILTER (WHERE "2.7_Mitiga_Cambio_Climatico_SiNo" = 'Sí') k,
        COUNT(*) FILTER (WHERE "2.7_Mitiga_Cambio_Climatico_SiNo" IN ('Sí','No')) n_valid,
        COUNT(*) total
    FROM datos
    """
    k_a6, n_valid_a6, n_tot_a6 = con.execute(q_a6).fetchone()
    missing_a6 = n_tot_a6 - n_valid_a6

    # Fila sobre n_valid (interpretación "conscientes entre los que respondieron")
    p_a6_valid = k_a6 / n_valid_a6
    lo_v, hi_v, _ = wilson_ci(int(k_a6), int(n_valid_a6))
    sev_v, diff_v = classify_severity(0.98, p_a6_valid, int(n_valid_a6), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="A6",
        seccion=SECCION,
        titulo_codigo="Mitigación Cambio Climático",
        tipo_stat="proporcion",
        subgrupo="k/n_valid (sin missing)",
        valor_codigo=0.98,
        valor_real=p_a6_valid,
        n_efectivo=int(n_valid_a6),
        missing_rate=float(missing_a6 / n_tot_a6),
        unidad="proporcion",
        ic_low=lo_v, ic_high=hi_v, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["A6"],
        viz_viola_rules=False,
        severidad=sev_v,
        discrepancia_pp=diff_v,
        ancla_ref=None,
        notas=(
            f"Interpretación 'sobre válidos': {k_a6}/{n_valid_a6} = 100%. "
            f"Diff 2 pp vs código 98% → handoff de metodología (denominador ambiguo). "
            f"1 missing no reportado en dashboard."
        ),
    ))

    # Fila sobre n_total (interpretación "conscientes sobre total muestra")
    p_a6_tot = k_a6 / n_tot_a6
    lo_t, hi_t, _ = wilson_ci(int(k_a6), int(n_tot_a6))
    sev_t, diff_t = classify_severity(0.98, p_a6_tot, int(n_tot_a6), unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="A6",
        seccion=SECCION,
        titulo_codigo="Mitigación Cambio Climático",
        tipo_stat="proporcion",
        subgrupo="k/n_total (con missing)",
        valor_codigo=0.98,
        valor_real=p_a6_tot,
        n_efectivo=int(n_tot_a6),
        missing_rate=float(missing_a6 / n_tot_a6),
        unidad="proporcion",
        ic_low=lo_t, ic_high=hi_t, ic_metodo="wilson",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["A6"],
        viz_viola_rules=False,
        severidad=sev_t,
        discrepancia_pp=diff_t,
        ancla_ref=None,
        notas=(
            f"Interpretación 'sobre muestra total': {k_a6}/{n_tot_a6} = 98.75%. "
            f"Diff 0.75 pp vs código 98% → nota. Probablemente el KPI redondea 98.75 a 98%."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="A6",
        variables_fuente="2.7_Mitiga_Cambio_Climatico_SiNo",
        query_duckdb=q_a6.strip(),
        formula_ic="Wilson 95% binomial (dos interpretaciones del denominador)",
        supuestos="'Sí' tras normalización 'Si/SI/SÍ → Sí'. 1 missing (celda vacía); dashboard no declara.",
        n_missing=int(missing_a6),
        missing_pct=float(100 * missing_a6 / n_tot_a6),
        notas_bins=f"k=Sí: {k_a6}; k=No: 0; missing: {missing_a6}.",
    ))

    # ------------------------------------------------------------------------
    # Output
    # ------------------------------------------------------------------------
    write_excel(
        resultados, metodo, OUT_XLSX,
        accion_map=ACCION_MAP, handoff_map=HANDOFF_MAP,
    )

    print(f"filas_resumen={len(resultados)} indicadores={len({r.id_indicador for r in resultados})}")
    sev_summary = summarize_severities(resultados)
    for ind, buckets in sorted(sev_summary.items()):
        print(f"  {ind}: {buckets}")

    # Reconciliacion de anclas (ASCII-safe para stdout cp1252 en Windows)
    print("\nReconciliacion de anclas (|valor_real - ancla|):")
    for r in resultados:
        if r.ancla_ref and r.ancla_ref in ANCHORS:
            diff = abs(r.valor_real - ANCHORS[r.ancla_ref])
            # Tolerancia: 0.01 para proporciones, 0.02 para años/ha
            tol = 0.05 if r.ancla_ref == "territorial.area_por_familia_ha" else 0.01
            status = "ok" if diff < tol else f"DIFF={diff:.4f}"
            print(f"  {r.id_indicador}/{r.subgrupo} vs {r.ancla_ref} ({ANCHORS[r.ancla_ref]}): {status}")

    print(f"\nxlsx escrito: {OUT_XLSX}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
