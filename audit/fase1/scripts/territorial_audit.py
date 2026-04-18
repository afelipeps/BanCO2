"""Auditoría estadística de los 6 indicadores de la sección Territorial (Geografía).

Segunda sección de la Fase 1 (Tiempo 2, paralela a Ambiental/Social/Gobernanza).
Replica el esqueleto del piloto `population_audit.py`. Sale 0 si el script
corre sin excepciones; la decisión de "OK" queda para el humano al revisar
`territorial_REPORT.md` y el xlsx.

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/territorial_audit.py

Produce:
    audit/fase1/territorial.xlsx                        (gitignored)
    audit/fase1/scripts/territorial_audit.run.log       (stdout, tracked)

Contrato de los 6 indicadores (en data.tsx:12-112):
    G1  Distribución Regional       chart_bar_horizontal  1.3_Municipio
    G2  Índice de Conservación ICE  chart_scatter         Area_Total_Ha_NUM × Area_Conservacion_Ha_NUM
    G3  Perfil de Tenencia          chart_bar_horizontal  Area_Total_Ha_NUM (bins del código)
    G4  Madurez en el Proyecto      chart_bar_horizontal  1.9_Año_Ingreso (bins fase A/B/C/D)
    G5  Pisos Térmicos              chart_pie             1.3_Municipio → mapping deductivo zona
    G6  Cobertura Veredal           kpi_card              1.4_Vereda (DISTINCT)
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

SECCION = "Territorial"
OUT_XLSX = Path("audit/fase1/territorial.xlsx")

# Viz recomendadas según <visual_rules> del CLAUDE.md
VIZ_RECOM = {
    "G1": "chart_bar_horizontal + Wilson CI por barra",
    "G2": "boxplot por Clasificacion_Predio + scatter real (area_total × area_cons) con n=63",
    "G3": "chart_bar_horizontal + Wilson CI; reportar denom (n=69 no n=80)",
    "G4": "chart_bar_horizontal + Wilson CI; renombrar label fase D a '2022-2025'",
    "G5": "chart_bar_horizontal + Wilson CI (no pie de 3 categorías)",
    "G6": "kpi_card + nota de universo (52 de 155 familias censadas)",
}

# Handoffs preemptivos (los que sean, si abrimos questions/NNN)
HANDOFF_MAP = {
    "G1": "",
    "G2": "questions/005_g2_scatter_sintetico.md",
    "G3": "",
    "G4": "questions/006_g4_labels_fase_d.md",
    "G5": "questions/007_g5_mapping_pisos_termicos.md",
    "G6": "",
}

ACCION_MAP = {
    "G1": "Mantener bar; agregar IC95 Wilson; aclarar que n_municipios muestra=11 (no 15, que es universo programa).",
    "G2": "Reemplazar scatter sintético por scatter real n=63; migrar a boxplot por Clasificacion_Predio. Investigar ancla 104.6 (ver q005).",
    "G3": "Conservar bins; declarar denom n=69 y missings n=11 en subtítulo; añadir IC95 Wilson.",
    "G4": "Renombrar label fase D a '2022-2025'; añadir IC95 Wilson; reescribir copy 'fases más recientes 2021-2024' → '2020-2025'.",
    "G5": "Migrar pie → bar con Wilson CI; documentar mapping municipio→piso térmico en el script (trazabilidad).",
    "G6": "KPI OK; agregar contexto universo (52/155 familias). No cambiar viz.",
}

# Mapping deductivo municipio → piso térmico (Oriente Antioqueño).
# Reconcilia exactamente los valores del código (36/29/15 = 45%/36.25%/18.75%).
# Trazabilidad: ver questions/007_g5_mapping_pisos_termicos.md para justificación.
PISO_TERMICO_MAP: dict[str, str] = {
    "PUERTO TRIUNFO": "Cálido",
    "SAN RAFAEL": "Templado",
    "SAN CARLOS": "Templado",
    "LA CEJA": "Frío",
    "SAN LUIS": "Templado",
    "GRANADA": "Frío",
    "EL PEÑOL": "Frío",
    "GUARNE": "Frío",
    "GUATAPÉ": "Frío",
    "COCORNA": "Templado",
    "SAN FRANCISCO": "Templado",
}


def main() -> int:
    con = get_connection()
    resultados: list[IndicadorResultado] = []
    metodo: list[MetodoRow] = []

    # ------------------------------------------------------------------------
    # G1 — Distribución Regional (muestra n=80, 11 municipios observados)
    # Código: Puerto Triunfo 18.8, San Rafael 18.8, San Carlos 13.8, La Ceja 12.5, Otros (7) 36.1
    # ------------------------------------------------------------------------
    q1 = 'SELECT "1.3_Municipio" municipio, COUNT(*) n FROM datos GROUP BY 1 ORDER BY n DESC'
    df1 = con.execute(q1).fetchdf()
    total_g1 = int(df1["n"].sum())

    # Valores del código (reducidos a proporción):
    CODE_G1 = {
        "PUERTO TRIUNFO": 0.188,
        "SAN RAFAEL": 0.188,
        "SAN CARLOS": 0.138,
        "LA CEJA": 0.125,
        "Otros (7)": 0.361,
    }

    # Observados:
    counts_g1 = dict(zip(df1["municipio"], df1["n"].astype(int)))
    top4 = ["PUERTO TRIUNFO", "SAN RAFAEL", "SAN CARLOS", "LA CEJA"]
    otros_n = total_g1 - sum(counts_g1.get(m, 0) for m in top4)

    for muni in top4:
        k = counts_g1.get(muni, 0)
        p = k / total_g1
        lo, hi, _ = wilson_ci(k, total_g1)
        sev, diff = classify_severity(CODE_G1[muni], p, total_g1, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="G1",
            seccion=SECCION,
            titulo_codigo="Distribución Regional",
            tipo_stat="proporcion",
            subgrupo=muni,
            valor_codigo=CODE_G1[muni],
            valor_real=p,
            n_efectivo=total_g1,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["G1"],
            viz_viola_rules=False,  # barra horizontal con proporción es aceptable
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"Conteo observado {k}/{total_g1}. Código redondea a 1 decimal "
                f"(ej. 18.8% = 15/80 = 18.75%)."
            ),
        ))

    # Fila "Otros (7)" — agregado
    p_otros = otros_n / total_g1
    lo_o, hi_o, _ = wilson_ci(otros_n, total_g1)
    sev_o, diff_o = classify_severity(CODE_G1["Otros (7)"], p_otros, total_g1, unit_is_pp=True)
    resultados.append(IndicadorResultado(
        id_indicador="G1",
        seccion=SECCION,
        titulo_codigo="Distribución Regional",
        tipo_stat="proporcion",
        subgrupo="Otros (7)",
        valor_codigo=CODE_G1["Otros (7)"],
        valor_real=p_otros,
        n_efectivo=total_g1,
        missing_rate=0.0,
        unidad="proporcion",
        ic_low=lo_o, ic_high=hi_o, ic_metodo="wilson",
        viz_actual="chart_bar_horizontal",
        viz_recomendada=VIZ_RECOM["G1"],
        viz_viola_rules=False,
        severidad=sev_o,
        discrepancia_pp=diff_o,
        ancla_ref=None,
        notas=(
            f"Agregado de 7 municipios ({otros_n}/{total_g1}): "
            "San Luis, Granada, El Peñol, Guarne, Guatapé, Cocorná, San Francisco."
        ),
    ))

    # Fila diagnóstica: conteo de municipios distintos en la muestra vs <product>=15
    n_muni_muestra = len(df1)
    resultados.append(IndicadorResultado(
        id_indicador="G1",
        seccion=SECCION,
        titulo_codigo="Distribución Regional",
        tipo_stat="conteo",
        subgrupo="municipios_distintos_muestra",
        valor_codigo=None,
        valor_real=float(n_muni_muestra),
        n_efectivo=total_g1,
        missing_rate=0.0,
        unidad="conteo",
        viz_actual="chart_bar_horizontal",
        viz_recomendada=VIZ_RECOM["G1"],
        viz_viola_rules=False,
        severidad="nota",
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            f"Muestra cubre {n_muni_muestra} municipios; el universo programa "
            "reporta 15 municipios (<product>). Diferencia no es discrepancia "
            "numérica: universo ≠ muestra; subtítulo del dashboard debería aclararlo."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="G1",
        variables_fuente="1.3_Municipio",
        query_duckdb=q1.strip(),
        formula_ic="Wilson 95% por municipio (top 4 + agregado 'Otros (7)')",
        supuestos="Sin missings en 1.3_Municipio; n=80 completo. Municipios normalizados a MAYÚSCULAS.",
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            f"Muestra = {n_muni_muestra} municipios con casos observados. "
            "Universo del programa: 15 municipios según <product> del CLAUDE.md."
        ),
    ))

    # ------------------------------------------------------------------------
    # G2 — Índice de Conservación (ICE)
    # Código: 5 puntos sintéticos (Minifundios/Pequeños/Medianos/Latifundios/Grandes Reservas)
    # con valores y=x*0.8 (aprox 80% conservación).
    # Hallazgo: los 5 puntos NO corresponden a la distribución real.
    # ------------------------------------------------------------------------
    q2 = """
    SELECT
        CAST(Area_Total_Ha_NUM AS DOUBLE) a_tot,
        CAST(Area_Conservacion_Ha_NUM AS DOUBLE) a_con,
        CAST(Porcentaje_Conservacion AS DOUBLE) pct,
        Clasificacion_Predio clas
    FROM datos
    WHERE Area_Total_Ha_NUM IS NOT NULL
      AND Area_Conservacion_Ha_NUM IS NOT NULL
    """
    df2 = con.execute(q2).fetchdf()
    n2 = len(df2)
    missing_g2 = 80 - n2

    # Estadísticos reales de %conservación
    mi_pct = median_iqr(df2["pct"].dropna())
    boot_lo, boot_hi = median_bootstrap_ci(df2["pct"].dropna())

    # Comparación contra el "70-80%" del story
    resultados.append(IndicadorResultado(
        id_indicador="G2",
        seccion=SECCION,
        titulo_codigo="Índice de Conservación (ICE)",
        tipo_stat="mediana",
        subgrupo="porcentaje_conservacion",
        valor_codigo=0.75,  # "70-80%" textual → tomamos el punto medio 75%
        valor_real=float(mi_pct["median"]) / 100,
        n_efectivo=int(mi_pct["n"]),
        missing_rate=(80 - int(mi_pct["n"])) / 80,
        unidad="proporcion",
        ic_low=boot_lo / 100, ic_high=boot_hi / 100,
        ic_metodo="bootstrap_percentile_10k",
        dispersion_tipo="IQR",
        dispersion_valor=float(mi_pct["iqr"]) / 100,
        viz_actual="chart_scatter",
        viz_recomendada=VIZ_RECOM["G2"],
        viz_viola_rules=True,  # los 5 puntos son sintéticos; no reflejan distribución
        severidad="handoff",  # narrativa "70-80%" no coincide; ver q005
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            f"%conservación observada mediana={mi_pct['median']:.2f}%, "
            f"IQR=[{mi_pct['q1']:.2f}, {mi_pct['q3']:.2f}]. "
            "Story dice '70-80%' pero mediana real es 95% (n=62). "
            "Scatter del código es sintético: 5 puntos fijos no reflejan los 63 casos reales."
        ),
    ))

    # Ancla 104.6 ha/familia — reconciliación
    # CLAUDE.md dice territorial.area_por_familia_ha = 104.6
    # Es la media muestral de Area_Conservacion_Ha_NUM (n=66, incluyendo outlier 6379)
    q2b = (
        'SELECT CAST(Area_Conservacion_Ha_NUM AS DOUBLE) a_con FROM datos '
        'WHERE Area_Conservacion_Ha_NUM IS NOT NULL'
    )
    df2b = con.execute(q2b).fetchdf()
    media_ac = float(df2b["a_con"].mean())
    mediana_ac = float(df2b["a_con"].median())
    sd_ac = float(df2b["a_con"].std())

    sev_m, diff_m = classify_severity(
        ANCHORS["territorial.area_por_familia_ha"], media_ac, len(df2b),
        unit_is_pp=False,
    )
    resultados.append(IndicadorResultado(
        id_indicador="G2",
        seccion=SECCION,
        titulo_codigo="Índice de Conservación (ICE)",
        tipo_stat="media",
        subgrupo="area_conservacion_media_ha",
        valor_codigo=ANCHORS["territorial.area_por_familia_ha"],
        valor_real=media_ac,
        n_efectivo=len(df2b),
        missing_rate=(80 - len(df2b)) / 80,
        unidad="hectareas",
        dispersion_tipo="sd",
        dispersion_valor=sd_ac,
        viz_actual="chart_scatter",
        viz_recomendada=VIZ_RECOM["G2"],
        viz_viola_rules=True,
        severidad=sev_m,
        discrepancia_pp=diff_m,
        ancla_ref="territorial.area_por_familia_ha",
        notas=(
            f"Media área conservación = {media_ac:.4f} ha (n={len(df2b)}). "
            f"Reconcilia ancla 104.6. Pero mediana = {mediana_ac:.2f} ha; "
            f"sd={sd_ac:.2f} evidencia asimetría brutal (outlier declarado implícito: 6379 ha). "
            "La media muestral es engañosa como 'hectáreas por familia'."
        ),
    ))

    # Fila mediana (estadístico recomendado por <visual_rules>)
    mi_ac = median_iqr(df2b["a_con"])
    boot_lo_ac, boot_hi_ac = median_bootstrap_ci(df2b["a_con"])
    resultados.append(IndicadorResultado(
        id_indicador="G2",
        seccion=SECCION,
        titulo_codigo="Índice de Conservación (ICE)",
        tipo_stat="mediana",
        subgrupo="area_conservacion_mediana_ha",
        valor_codigo=None,
        valor_real=float(mi_ac["median"]),
        n_efectivo=int(mi_ac["n"]),
        missing_rate=(80 - int(mi_ac["n"])) / 80,
        unidad="hectareas",
        ic_low=boot_lo_ac, ic_high=boot_hi_ac,
        ic_metodo="bootstrap_percentile_10k",
        dispersion_tipo="IQR",
        dispersion_valor=float(mi_ac["iqr"]),
        viz_actual="chart_scatter",
        viz_recomendada=VIZ_RECOM["G2"],
        viz_viola_rules=True,
        severidad="nota",
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            f"Mediana área conservación = {mi_ac['median']:.2f} ha "
            f"(IQR [{mi_ac['q1']:.2f}, {mi_ac['q3']:.2f}]). "
            "Estadístico correcto por asimetría; debería reemplazar la media 104.6 "
            "en cualquier KPI o narrativa de 'tamaño típico del predio conservado'."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="G2",
        variables_fuente="Area_Total_Ha_NUM × Area_Conservacion_Ha_NUM × Porcentaje_Conservacion × Clasificacion_Predio",
        query_duckdb=f"(a) {q2.strip()}; (b) {q2b.strip()}",
        formula_ic="Mediana: bootstrap percentile 10k (seed=42); media sin IC.",
        supuestos=(
            "Distribución con fuerte asimetría (sd=784 con n=66; outlier 6379 ha). "
            "Subconjunto con ambas variables no nulas: n=63."
        ),
        n_missing=missing_g2,
        missing_pct=missing_g2 / 80,
        notas_bins=(
            "Ancla territorial.area_por_familia_ha=104.6 es la media muestral con n=66 "
            "(incl. outlier 6379). Sin outlier la media baja a ~8.08 ha y la mediana es ~5 ha. "
            "Ver questions/005 para decisión de publicar media vs mediana."
        ),
    ))

    # ------------------------------------------------------------------------
    # G3 — Perfil de Tenencia
    # Código: Minifundio 59.42%, Mediano 34.78%, Latifundio 5.80% (suma = 100.00%)
    # Denominador real = 69 (n con Area_Total_Ha_NUM no nulo)
    # ------------------------------------------------------------------------
    q3 = """
    SELECT
        CASE
            WHEN CAST(Area_Total_Ha_NUM AS DOUBLE) < 10 THEN 'Minifundio (<10Ha)'
            WHEN CAST(Area_Total_Ha_NUM AS DOUBLE) BETWEEN 10 AND 50 THEN 'Mediano (10-50Ha)'
            WHEN CAST(Area_Total_Ha_NUM AS DOUBLE) > 50 THEN 'Latifundio (>50Ha)'
            ELSE 'missing'
        END bin,
        COUNT(*) n
    FROM datos
    GROUP BY 1 ORDER BY 1
    """
    df3 = con.execute(q3).fetchdf()
    g3_counts = dict(zip(df3["bin"], df3["n"].astype(int)))
    n_missing_g3 = g3_counts.get("missing", 0)
    n_valid_g3 = 80 - n_missing_g3

    CODE_G3 = {
        "Minifundio (<10Ha)": 0.5942,
        "Mediano (10-50Ha)": 0.3478,
        "Latifundio (>50Ha)": 0.0580,
    }

    for label, v_codigo in CODE_G3.items():
        k = g3_counts.get(label, 0)
        p = k / n_valid_g3 if n_valid_g3 else 0.0
        lo, hi, _ = wilson_ci(k, n_valid_g3)
        sev, diff = classify_severity(v_codigo, p, n_valid_g3, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="G3",
            seccion=SECCION,
            titulo_codigo="Perfil de Tenencia",
            tipo_stat="proporcion",
            subgrupo=label,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=n_valid_g3,
            missing_rate=n_missing_g3 / 80,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["G3"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"{k}/{n_valid_g3} casos; el denominador correcto es n=69 "
                f"(no 80). Missings: {n_missing_g3} casos sin Area_Total_Ha."
            ),
        ))

    metodo.append(MetodoRow(
        id_indicador="G3",
        variables_fuente="Area_Total_Ha_NUM",
        query_duckdb=q3.strip(),
        formula_ic="Wilson 95% con denom=69 (casos con área no nula)",
        supuestos=(
            "Bins del código: <10 / [10,50] / >50. Derivados de Area_Total_Ha_NUM. "
            f"{n_missing_g3} casos con Area_Total_Ha_NUM NULL se excluyen del denominador."
        ),
        n_missing=n_missing_g3,
        missing_pct=n_missing_g3 / 80,
        notas_bins=(
            "Clasificacion_Predio del diccionario tiene 4 niveles "
            "(Microfundio<3, Minifundio 3-10, Pequeña 10-50, Mediana/Grande >50) "
            "pero el código usa 3 bins distintos. Reconciliación vía bin derivado."
        ),
    ))

    # ------------------------------------------------------------------------
    # G4 — Madurez en el Proyecto (fase A/B/C/D por año de ingreso)
    # Código: A 8.75%, B 20%, C 37.5%, D 33.75% (suma 100%)
    # Label de fase D en código dice '2023-2024' pero D cubre 2022-2025.
    # ------------------------------------------------------------------------
    q4 = """
    SELECT
        CASE
            WHEN CAST("1.9_Año_Ingreso" AS INT) <= 2017 THEN 'A (<=2017)'
            WHEN CAST("1.9_Año_Ingreso" AS INT) <= 2019 THEN 'B (2018-2019)'
            WHEN CAST("1.9_Año_Ingreso" AS INT) <= 2021 THEN 'C (2020-2021)'
            WHEN CAST("1.9_Año_Ingreso" AS INT) <= 2025 THEN 'D (2022-2025)'
            ELSE 'unk'
        END fase,
        COUNT(*) n
    FROM datos GROUP BY 1 ORDER BY 1
    """
    df4 = con.execute(q4).fetchdf()
    g4_counts = dict(zip(df4["fase"], df4["n"].astype(int)))
    total_g4 = sum(g4_counts.values())

    CODE_G4 = {
        "A (<=2017)": (0.0875, "Fase A (2017)"),
        "B (2018-2019)": (0.2000, "Fase A + B (2019)"),
        "C (2020-2021)": (0.3750, "Fase A + B + C (2021)"),
        "D (2022-2025)": (0.3375, "Fase A + B + C + D (2023-2024)"),
    }

    for fase, (v_codigo, label_codigo) in CODE_G4.items():
        k = g4_counts.get(fase, 0)
        p = k / total_g4 if total_g4 else 0.0
        lo, hi, _ = wilson_ci(k, total_g4)
        sev, diff = classify_severity(v_codigo, p, total_g4, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="G4",
            seccion=SECCION,
            titulo_codigo="Madurez en el Proyecto",
            tipo_stat="proporcion",
            subgrupo=fase,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=total_g4,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_bar_horizontal",
            viz_recomendada=VIZ_RECOM["G4"],
            viz_viola_rules=False,
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"{k}/{total_g4} casos. Label del código = '{label_codigo}'. "
                "Bins A/B/C/D del código son cumulativos en la etiqueta pero se "
                "grafican como mutuamente excluyentes; reconcilian como bins disjuntos "
                "de año de ingreso."
            ),
        ))

    # Fila diagnóstica sobre el label engañoso
    d_count = g4_counts.get("D (2022-2025)", 0)
    d_pct_real = d_count / total_g4
    resultados.append(IndicadorResultado(
        id_indicador="G4",
        seccion=SECCION,
        titulo_codigo="Madurez en el Proyecto",
        tipo_stat="conteo",
        subgrupo="label_fase_D_discrepante",
        valor_codigo=None,
        valor_real=float(d_count),
        n_efectivo=total_g4,
        missing_rate=0.0,
        unidad="conteo",
        viz_actual="chart_bar_horizontal",
        viz_recomendada=VIZ_RECOM["G4"],
        viz_viola_rules=False,
        severidad="handoff",  # afecta narrativa "71.25% en fases recientes 2021-2024"
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            f"Fase D contiene {d_count} casos de año ingreso 2022-2025; "
            "el label del código dice '2023-2024'. Además la story afirma "
            "'71.25% se vinculó en 2021-2024', pero C+D real cubre 2020-2025 "
            "(=30+27=57; 57/80=71.25%). Los rangos del copy son inconsistentes. "
            "Ver questions/006."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="G4",
        variables_fuente="1.9_Año_Ingreso",
        query_duckdb=q4.strip(),
        formula_ic="Wilson 95% por fase (denom = 80, todos los casos tienen año)",
        supuestos=(
            "Bins A: ≤2017; B: 2018-2019; C: 2020-2021; D: 2022-2025. "
            "Reconstruidos empíricamente para reproducir 7/16/30/27 del código."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            "Años observados: 2009(1), 2017(6), 2018(8), 2019(8), 2020(14), "
            "2021(16), 2022(10), 2023(7), 2024(5), 2025(5). "
            "Label 'Fase A + B + C + D (2023-2024)' del código es impreciso: "
            "D cubre 2022-2025 (27 casos)."
        ),
    ))

    # ------------------------------------------------------------------------
    # G5 — Pisos Térmicos
    # Código: Templado 45.00, Frío 36.25, Cálido 18.75 (suma 100.00)
    # Variable fuente NO directa en diccionario → derivación municipio → piso.
    # Ver PISO_TERMICO_MAP y questions/007.
    # ------------------------------------------------------------------------
    counts_piso: dict[str, int] = {"Templado": 0, "Frío": 0, "Cálido": 0}
    for muni, n in counts_g1.items():
        piso = PISO_TERMICO_MAP.get(muni)
        if piso:
            counts_piso[piso] += n
    total_g5 = sum(counts_piso.values())

    CODE_G5 = {
        "Templado": 0.4500,
        "Frío": 0.3625,
        "Cálido": 0.1875,
    }

    for piso, v_codigo in CODE_G5.items():
        k = counts_piso[piso]
        p = k / total_g5 if total_g5 else 0.0
        lo, hi, _ = wilson_ci(k, total_g5)
        sev, diff = classify_severity(v_codigo, p, total_g5, unit_is_pp=True)
        resultados.append(IndicadorResultado(
            id_indicador="G5",
            seccion=SECCION,
            titulo_codigo="Pisos Térmicos",
            tipo_stat="proporcion",
            subgrupo=piso,
            valor_codigo=v_codigo,
            valor_real=p,
            n_efectivo=total_g5,
            missing_rate=0.0,
            unidad="proporcion",
            ic_low=lo, ic_high=hi, ic_metodo="wilson",
            viz_actual="chart_pie",
            viz_recomendada=VIZ_RECOM["G5"],
            viz_viola_rules=True,  # pie con 3 categorías; visual_rules sugiere bar con Wilson
            severidad=sev,
            discrepancia_pp=diff,
            ancla_ref=None,
            notas=(
                f"{k}/{total_g5} casos bajo mapping deductivo municipio→piso. "
                "Reconcilia valores del código al pp."
            ),
        ))

    # Fila diagnóstica: trazabilidad del mapping
    resultados.append(IndicadorResultado(
        id_indicador="G5",
        seccion=SECCION,
        titulo_codigo="Pisos Térmicos",
        tipo_stat="conteo",
        subgrupo="mapping_municipio_piso",
        valor_codigo=None,
        valor_real=float(len(PISO_TERMICO_MAP)),
        n_efectivo=total_g5,
        missing_rate=0.0,
        unidad="conteo",
        viz_actual="chart_pie",
        viz_recomendada=VIZ_RECOM["G5"],
        viz_viola_rules=True,
        severidad="handoff",  # categorización no trazable en microdatos; ver q007
        discrepancia_pp=None,
        ancla_ref=None,
        notas=(
            "El indicador G5 no tiene variable fuente directa en Diccionario_Datos. "
            "Se deriva desde 1.3_Municipio con el mapping documentado en el script "
            "(PISO_TERMICO_MAP). Reconcilia los valores del código al pp, pero la "
            "categorización debería quedar trazable en el xlsx normalizado. Ver questions/007."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="G5",
        variables_fuente="1.3_Municipio (derivación externa via PISO_TERMICO_MAP)",
        query_duckdb="mapping in-memory; conteo a partir de df1",
        formula_ic="Wilson 95% por piso",
        supuestos=(
            "Mapping deductivo: Cálido={PT}; Templado={San Rafael, San Carlos, "
            "Cocorná, San Luis, San Francisco}; Frío={La Ceja, Granada, El Peñol, "
            "Guarne, Guatapé}. Reconcilia los conteos 36/29/15 del código."
        ),
        n_missing=0,
        missing_pct=0.0,
        notas_bins=(
            "No hay columna 'Piso_Térmico' en Diccionario_Datos. El mapping se "
            "construyó empíricamente ajustando a los valores publicados (36/29/15) "
            "sobre la distribución municipal (PT=15 → Cálido; etc.). "
            "Handoff q007 propone añadir la columna derivada al xlsx normalizado."
        ),
    ))

    # ------------------------------------------------------------------------
    # G6 — Cobertura Veredal
    # Código: 52 veredas únicas. Ancla: poblacion.muestra.veredas = 52.
    # ------------------------------------------------------------------------
    q6 = 'SELECT COUNT(DISTINCT "1.4_Vereda") n_veredas FROM datos'
    n6 = int(con.execute(q6).fetchone()[0])
    sev6, diff6 = classify_severity(52.0, float(n6), 80, unit_is_pp=False)
    resultados.append(IndicadorResultado(
        id_indicador="G6",
        seccion=SECCION,
        titulo_codigo="Cobertura Veredal",
        tipo_stat="conteo",
        subgrupo="veredas_distintas",
        valor_codigo=52.0,
        valor_real=float(n6),
        n_efectivo=80,
        missing_rate=0.0,
        unidad="conteo",
        viz_actual="kpi_card",
        viz_recomendada=VIZ_RECOM["G6"],
        viz_viola_rules=False,  # KPI para conteo entero es aceptable
        severidad=sev6,
        discrepancia_pp=diff6,
        ancla_ref="poblacion.muestra.veredas",
        notas=(
            f"COUNT(DISTINCT 1.4_Vereda) = {n6}. Reconcilia ancla. "
            "Recomendación narrativa: aclarar que son 52 veredas con familias "
            "encuestadas (muestra), no 52 veredas del universo del programa."
        ),
    ))

    metodo.append(MetodoRow(
        id_indicador="G6",
        variables_fuente="1.4_Vereda",
        query_duckdb=q6.strip(),
        formula_ic="Conteo distinto; sin IC (punto estimado sobre universo de la muestra)",
        supuestos="Texto libre; asumimos normalización previa suficiente para DISTINCT.",
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

    # Reconciliacion de anclas (ASCII-safe)
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
