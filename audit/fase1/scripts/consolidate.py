"""Consolidación cross-sección de Fase 1.

Lee los xlsx producidos por los 5 auditores de sección (piloto Población +
Territorial + Ambiental + Social + Gobernanza) y produce un único xlsx
global con Resumen/Críticos/Método concatenados, más una hoja de índice por
sección.

Uso:
    .venv/Scripts/python.exe audit/fase1/scripts/consolidate.py

Produce:
    audit/fase1/auditoria_estadistica.xlsx  (gitignored, binario)
    audit/fase1/scripts/consolidate.run.log (stdout, tracked)
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import common  # aplica reconfigure utf-8 en Windows

import pandas as pd

SECCIONES = [
    ("poblacion", "audit/fase1/piloto_poblacion.xlsx"),
    ("territorial", "audit/fase1/territorial.xlsx"),
    ("ambiental", "audit/fase1/ambiental.xlsx"),
    ("social", "audit/fase1/social.xlsx"),
    ("gobernanza", "audit/fase1/gobernanza.xlsx"),
    ("economica", "audit/fase1/economica.xlsx"),
    ("sostenibilidad", "audit/fase1/sostenibilidad.xlsx"),
]

OUT = Path("audit/fase1/auditoria_estadistica.xlsx")


def main() -> int:
    resumen_rows = []
    criticos_rows = []
    metodo_rows = []
    indice_rows = []

    for seccion, path in SECCIONES:
        p = Path(path)
        if not p.exists():
            print(f"WARN: no existe {path} — saltando")
            continue
        res = pd.read_excel(p, sheet_name="Resumen")
        cri = pd.read_excel(p, sheet_name="Críticos")
        met = pd.read_excel(p, sheet_name="Método")
        if "seccion" not in res.columns:
            res.insert(0, "seccion", seccion)
        if "seccion" not in cri.columns:
            cri.insert(0, "seccion", seccion)
        if "seccion" not in met.columns:
            met.insert(0, "seccion", seccion)
        resumen_rows.append(res)
        criticos_rows.append(cri)
        metodo_rows.append(met)

        # Índice
        sev_counts = res["severidad"].value_counts().to_dict() if "severidad" in res.columns else {}
        indice_rows.append({
            "seccion": seccion,
            "n_indicadores": res["id_indicador"].nunique(),
            "n_filas_resumen": len(res),
            "n_criticos": len(cri),
            "ok": int(sev_counts.get("ok", 0)),
            "nota": int(sev_counts.get("nota", 0)),
            "handoff": int(sev_counts.get("handoff", 0)),
            "bloqueo": int(sev_counts.get("bloqueo", 0)),
            "viola_viz_rules": int(res["viz_viola_rules"].sum()) if "viz_viola_rules" in res.columns else 0,
        })

    resumen_all = pd.concat(resumen_rows, ignore_index=True)
    criticos_all = pd.concat(criticos_rows, ignore_index=True)
    metodo_all = pd.concat(metodo_rows, ignore_index=True)
    indice_df = pd.DataFrame(indice_rows)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(OUT, engine="openpyxl") as xw:
        indice_df.to_excel(xw, sheet_name="Indice", index=False)
        resumen_all.to_excel(xw, sheet_name="Resumen_global", index=False)
        criticos_all.to_excel(xw, sheet_name="Criticos_global", index=False)
        metodo_all.to_excel(xw, sheet_name="Metodo_global", index=False)

    print(f"Consolidado escrito: {OUT}")
    print("\n=== INDICE ===")
    print(indice_df.to_string(index=False))
    print(f"\n=== TOTALES ===")
    print(f"  n_indicadores_total = {int(indice_df['n_indicadores'].sum())}")
    print(f"  n_filas_resumen_total = {int(indice_df['n_filas_resumen'].sum())}")
    print(f"  ok total = {int(indice_df['ok'].sum())}")
    print(f"  nota total = {int(indice_df['nota'].sum())}")
    print(f"  handoff total = {int(indice_df['handoff'].sum())}")
    print(f"  bloqueo total = {int(indice_df['bloqueo'].sum())}")
    print(f"  viola_viz_rules total = {int(indice_df['viola_viz_rules'].sum())}")

    # Questions abiertas y cerradas
    questions_dir = Path("questions")
    closed_dir = questions_dir / "closed"
    q_open = sorted(q for q in questions_dir.glob("[0-9][0-9][0-9]_*.md"))
    q_closed = sorted(q for q in closed_dir.glob("[0-9][0-9][0-9]_*.md")) if closed_dir.exists() else []
    print(f"\n=== QUESTIONS abiertas ({len(q_open)}) ===")
    for q in q_open:
        print(f"  {q.name}")
    print(f"\n=== QUESTIONS cerradas ({len(q_closed)}) ===")
    for q in q_closed:
        print(f"  closed/{q.name}")
    print(f"\n=== TOTAL questions tracked: {len(q_open) + len(q_closed)} ===")

    return 0


if __name__ == "__main__":
    sys.exit(main())
