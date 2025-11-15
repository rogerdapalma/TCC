import React from "react";
import { Platform } from "react-native";

/* Por quê: botão Pesquisar branco no escuro via var(--text). */
export default function SearchBar({ value, onChange, onSubmit, placeholder, onFocus }) {
  if (Platform.OS !== "web") return null;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => { if (e.key === "Enter") onSubmit?.(); }}
        placeholder={placeholder || "Pesquisar..."}
        style={{
          flex: 1, minWidth: 260, padding: 12,
          border: "1px solid var(--border)", borderRadius: 12,
          background: "var(--surface)", color: "var(--text)"
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          padding: "8px 14px",
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--card)",
          color: "var(--text)", // escuro => branco
          cursor: "pointer"
        }}
      >
        Pesquisar
      </button>
    </div>
  );
}
