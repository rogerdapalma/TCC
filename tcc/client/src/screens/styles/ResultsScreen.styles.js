export default {
  pagePad: { padding: 16, paddingBottom: 8 },
  backBtn: { border: "1px solid var(--border)", background: "var(--card)", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },
  box: { border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)", padding: 12 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  subtext: { color: "var(--subtext)" },
  chipsRow: { marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" },

  // --- novo: resumo dos nutrientes selecionados (label + valor)
  kvGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginTop: 10 },
  kvCard: { border: "1px solid var(--border)", borderRadius: 10, background: "var(--card)", padding: 10 },
  kvLabel: { fontSize: 12, color: "var(--subtext)" },
  kvValue: { fontWeight: 800 }
};
