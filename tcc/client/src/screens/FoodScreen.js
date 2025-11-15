import React, { useEffect } from "react";
import { Platform } from "react-native";
import NutrientGrid from "../components/NutrientGrid";
import styles from "./styles/FoodScreen.styles";

export default function FoodScreen({
  selectedFoodDetails, allColumns, displayColumns, checkedCols, toggleCol,
  k, setK, metric, setMetric, sameCategory, setSameCategory, calcularSimilar, isCalculating, onBack
}) {
  const titleLine = `${selectedFoodDetails?.description ?? ""}${selectedFoodDetails?.category ? ` — ${selectedFoodDetails.category}` : ""}`;

  // Por que: garantir métrica "euclidean" sempre que a tela montar.
  useEffect(() => {
    if (typeof setMetric === "function") setMetric("euclidean");
  }, [setMetric]);

  return (
    <>
      <div style={styles.pagePad}>
        <button onClick={onBack} style={styles.backBtn}>← Voltar</button>
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          <div style={styles.card}>
            <div style={styles.cardRow}>
              <div style={styles.title}>{titleLine}</div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Tabela nutricional</div>
            <NutrientGrid
              item={selectedFoodDetails}
              allColumns={displayColumns}
              selectable
              selectedCols={checkedCols}
              onToggle={toggleCol}
            />
          </div>
        </div>
      </div>

      {Platform.OS === "web" && (
        <div style={styles.sticky}>
          <div style={styles.stickyInner}>
            <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Escolha quantos alimentos similares deseja ver : </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span></span>
              <input value={k} onChange={(e) => setK(e.target.value)} inputMode="numeric" style={styles.input} />
            </div>

            {/* Botões invisíveis; métrica segue travada em 'euclidean' via useEffect acima */}
            <div style={{ display: "none" }}>
              <button key="cosine" disabled aria-hidden="true" tabIndex={-1} style={{ display: "none" }}>cosine</button>
              <button key="euclidean" disabled aria-hidden="true" tabIndex={-1} style={{ display: "none" }}>euclidean</button>
            </div>
            {/*
              BLOCO ORIGINAL (comentado). Remova os comentários para reativar a escolha manual:
              {["cosine", "euclidean"].map(m => (
                <button key={m} onClick={() => setMetric(m)} style={styles.metricBtn(metric === m)} disabled={isCalculating}>{m}</button>
              ))}
            */}

            <button onClick={() => setSameCategory(v => !v)} style={styles.pillToggle(sameCategory)} disabled={isCalculating}>
              Mesma categoria: <b>{sameCategory ? "sim" : "não"}</b>
            </button>
            <div style={styles.rightInfo}>
              <span style={{ color: "var(--subtext)", fontSize: 12 }}>
                Nutrientes selecionados: <b>{checkedCols.length}</b>
              </span>
              <button
                onClick={calcularSimilar}
                style={{ ...styles.cta, opacity: isCalculating ? 0.7 : 1, pointerEvents: isCalculating ? "none" : "auto" }}
                aria-busy={isCalculating}
              >
                {isCalculating ? "Calculando…" : "Calcular similaridade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}