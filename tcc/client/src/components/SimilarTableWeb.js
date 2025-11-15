import React from "react";
import { pt, fmt } from "../utils/i18n";
import { getVal } from "../utils/aliases";
import NutrientGrid from "./NutrientGrid";

export default function SimilarTableWeb({
  rows,
  selectedCols,
  allCols,
  onPickCandidate,
  expandedId,
  setExpandedId,
  loading = false
}) {
  // Cabeçalho e célula usam tokens; no escuro a cor do texto é branca.
  const th = {
    padding: 12,
    textAlign: "left",
    borderBottom: "1px solid var(--border)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: "var(--surface)",
    color: "var(--text)"
  };
  const td = {
    padding: 12,
    borderBottom: "1px solid var(--border)",
    color: "var(--text)"
  };

  const cols = [
    { key: "description", title: "Descrição" },
    { key: "category", title: "Categoria" },
    ...selectedCols.map(k => ({ key: k, title: pt(k) })),
    { key: "score", title: "Pontuação" }
  ];
  
  const showEmpty = !loading && rows.length === 0;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--card)",
        overflowX: "auto",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)"
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "var(--text)" }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={th}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td style={td} colSpan={cols.length}>Carregando similares…</td></tr>
          )}
          {!loading && rows.map((r, i) => (
            <React.Fragment key={r.id ?? i}>
              <tr
                // Zebra usa as cores pedidas no tema escuro
                style={{ background: i % 2 ? "var(--sim-row-2)" : "var(--sim-row-1)", cursor: "pointer" }}
                onClick={() => { setExpandedId(expandedId === r.id ? null : r.id); onPickCandidate(r); }}
              >
                <td style={td}>{r.description}</td>
                <td style={td}>{r.category}</td>
                {selectedCols.map(k => (
                  <td key={k} style={td}>{fmt(getVal(r, k))}</td>
                ))}
                <td style={{ ...td, fontWeight: 700 }}>{r.score?.toFixed?.(2) ?? "-"}</td>
              </tr>

              {expandedId === r.id && (
                <tr>
                  <td style={td} colSpan={cols.length}>
                    <NutrientGrid item={r} allColumns={allCols} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {showEmpty && (
            <tr><td style={td} colSpan={cols.length}>Sem dados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}