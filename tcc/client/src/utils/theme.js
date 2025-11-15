import React, { useEffect } from "react";
import { Platform } from "react-native";

/* Por quê: tokens de tema consistentes; textos pretos no claro; verde unificado. */
export function ThemeStyles({ theme }) {
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el = document.documentElement;
    el.setAttribute("data-theme", theme);
    document.body.style.backgroundColor = theme === "dark" ? "#212121" : "#f6f7fb";
    document.body.style.color = theme === "dark" ? "#ffffff" : "#000000";
  }, [theme]);

  if (Platform.OS !== "web") return null;

  return (
    <style>{`
      :root {
        --bg: #f6f7fb;
        --surface: #ffffff;
        --card: var(--surface);
        --text: #111827;
        --subtext: #6b7280;
        --muted: #9ca3af;
        --border: #e5e7eb;
        --accent: #22c55e;                  /* verde padrão */
        --chip-selected: var(--accent);
        --pill: color-mix(in srgb, #ffffff 94%, var(--accent) 6%);
        --sim-row-1: #ffffff;
        --sim-row-2: #fbfbfd;
      }

      [data-theme="light"] {
        --text: #000000;                     /* tudo preto */
        --subtext: #000000;
        --muted: #000000ff;
        --link: #000000;

        --bg: #ffffffff;
        --surface: #ffffffff;
        --card: var(--surface);
        --border: #00000034;

        --accent: #22c55e;                  /* mesmo verde */
        --chip-selected: var(--accent);

        --pill: color-mix(in srgb, #ffffff 94%, var(--accent) 6%);
        --sim-row-1: #ffffff;
        --sim-row-2: #fbfbfd;
      }

      [data-theme="dark"] {
        --bg: #212121;
        --surface: #171717;
        --card: var(--surface);
        --text: #ffffff;                     /* textos brancos */
        --subtext: #d1d5db;
        --muted: #d1d5db;
        --border: #2a2a2a;
        --accent: #22c55e;                  /* mesmo verde */
        --chip-selected: var(--accent);
        --pill: color-mix(in srgb, #0f172a 80%, var(--accent) 20%);
        --sim-row-1: #1a1a1a;
        --sim-row-2: #121212;
      }

      html, body, #root { height: 100%; }
      body {
        background: var(--bg);
        color: var(--text);
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
        line-height: 1.4;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      [data-surface] { background: var(--surface); color: var(--text); border-color: var(--border); }
      [data-card]    { background: var(--card);    border-color: var(--border); color: var(--text); }

      a { color: var(--link); text-decoration: none; }
      .is-sub { color: var(--subtext); }

      .pill, .chip, .nutrient-chip { background: var(--pill); border: 1px solid var(--border); color: var(--text); }
      .nutrient-chip.is-selected, .is-active { box-shadow: 0 0 0 2px var(--chip-selected) inset !important; }

      input, select, textarea { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
      .calc-primary { background: var(--accent) !important; color: #fff !important; }

      /* Por quê: garantir texto dos botões herda a cor do tema (ex.: Voltar/Pesquisar) */
      button { color: var(--text); }
    `}</style>
  );
}

export const surfaceProps = { "data-surface": true };
const themeTokens = { pagePad: { padding: 16, paddingBottom: 8 } };
export default themeTokens;

