import React from "react";
import { Platform } from "react-native";

/* Por quê: categorias brancas no escuro via var(--text). */
export default function CategoryBlocks({
  categories,
  onSelect,
  columns = 4,
  itemHeight = 120,
  gap = 16,
  maxWidth = 1200
}) {
  if (Platform.OS !== "web") return null;

  const grid = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap,
    maxWidth,
    margin: "0 auto",
  };
  const card = {
    height: itemHeight,
    padding: 12,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    cursor: "pointer",
  };
  const title = { color: "var(--text)", fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  const sub   = { color: "var(--subtext)", fontSize: 12 };

  return (
    <div style={grid}>
      {categories.map((c) => (
        <button key={c} onClick={() => onSelect(c)} style={card}>
          <div style={title}>{c}</div>
          <div style={sub}>Ver {c}</div>
        </button>
      ))}
    </div>
  );
}
