import React from "react";
import { pt, fmt } from "../utils/i18n";
import { getVal } from "../utils/aliases";

export default function NutrientGrid({ item, allColumns, selectable = false, selectedCols = [], onToggle }) {
  if (!item) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
      {allColumns.map((k) => {
        const isSel = selectable && selectedCols.includes(k);
        return (
          <div
            key={k}
            onClick={selectable ? () => onToggle(k) : undefined}
            style={{
              border: "1px solid var(--border)",
              boxShadow: isSel ? "0 0 0 2px var(--chip-selected) inset" : "none", // por quê: stroke consistente
              borderRadius: 12, background: "var(--card)", padding: 12,
              cursor: selectable ? "pointer" : "default"
            }}
          >
            <div style={{ fontSize: 12, color: "var(--subtext)" }}>{pt(k)}</div>
            <div style={{ fontWeight: 800 }}>{fmt(getVal(item, k))}</div>
          </div>
        );
      })}
    </div>
  );
}

