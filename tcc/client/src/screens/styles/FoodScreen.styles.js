/* Por quê: backBtn branco no escuro; cosine/euclidean/Mesma categoria sempre verdes com texto branco. */
export default {
  pagePad: { padding: 16, paddingBottom: 24 },
  backBtn: { color: "var(--text)", border: "1px solid var(--border)", background: "var(--surface)", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },

  card: { border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)", padding: 16 },
  cardRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" },
  title: { fontSize: 22, fontWeight: 900 },
  subtitle: { color: "var(--subtext)" },

  sticky: {
    position: "sticky", bottom: 0, zIndex: 40,
    background: "color-mix(in srgb, var(--bg) 90%, transparent)",
    backdropFilter: "saturate(1.2) blur(8px)", borderTop: "1px solid var(--border)"
  },
  stickyInner: {
    display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
    maxWidth: 1200, margin: "0 auto", flexWrap: "wrap"
  },

  input: { width: 90, height: 36, padding: "0 8px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", color: "var(--text)" },

  metricBtn: (active) => ({
  padding: "6px 10px",
  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
  borderRadius: 8,
  background: active ? "var(--accent)" : "var(--card)",
  color: active ? "#ffffff" : "var(--text)",
  boxShadow: active ? "0 0 0 2px var(--chip-selected) inset" : "none",
  cursor: "pointer"
}),

pillToggle: (on) => ({
  padding: "6px 10px",
  border: on ? "1px solid var(--accent)" : "1px solid var(--border)",
  borderRadius: 8,
  background: on ? "var(--accent)" : "var(--card)",
  color: on ? "#ffffff" : "var(--text)",
  boxShadow: on ? "0 0 0 2px var(--chip-selected) inset" : "none",
  cursor: "pointer"
}),
  cta: { padding: "10px 16px", border: "1px solid var(--accent)", borderRadius: 10, background: "var(--accent)", color: "#fff", fontWeight: 800, cursor: "pointer" },
  rightInfo: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 },
  chipsRow: { marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { padding: "6px 10px", borderRadius: 999, background: "var(--pill)", border: "1px solid #c7d2fe" }
};