import React from "react";

/** Chama handler quando o clique/touch ocorre fora de ref. */
export default function useClickOutside(ref, handler) {
  React.useEffect(() => {
    function onDown(e) {
      const el = ref?.current;
      if (!el || el.contains(e.target)) return; // por quê: cliques internos não fecham
      handler(e);
    }
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("touchstart", onDown, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("touchstart", onDown, true);
    };
  }, [ref, handler]);
}