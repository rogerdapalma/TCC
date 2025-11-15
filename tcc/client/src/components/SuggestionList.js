import React from "react";

/* Por quê: fechar ao clicar fora; textos usam var(--text) (escuro => branco). */
export default function SuggestionList({ items, onSelect, maxHeight = 360, open = true, onRequestClose }) {
  if (!open || !items?.length) return null;

  const rootRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e) {
      const el = rootRef?.current;
      if (!el || el.contains(e.target)) return; // por quê: clique interno não fecha
      onRequestClose?.();
    }
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [open, onRequestClose]);

  return (
    <div
      ref={rootRef}
      role="listbox"
      style={{
        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,.08)", overflowY: "auto", maxHeight, zIndex: 60
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onSelect?.(it)}
          role="option"
          style={{
            display: "block", width: "100%", textAlign: "left", color: "var(--text)",
            padding: "10px 12px", cursor: "pointer", background: "transparent", border: "none",
            borderBottom: "1px solid #f2f4f7"
          }}
        >
          <div style={{ color: "var(--text)", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {it.description}
          </div>
          <div style={{ fontSize: 12, color: "var(--text)" }}>{it.category}</div>
        </button>
      ))}
    </div>
  );
}