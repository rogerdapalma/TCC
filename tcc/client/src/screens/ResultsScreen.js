import React from "react";
import { Text } from "react-native";
import NutrientGrid from "../components/NutrientGrid";
import SimilarTableWeb from "../components/SimilarTableWeb";
import { pt, fmt } from "../utils/i18n";
import { getVal } from "../utils/aliases";
import styles from "./styles/ResultsScreen.styles";

export default function ResultsScreen({
  onBack,
  selectedFoodDetails,
  checkedCols,
  allColumns,
  displayColumns,
  similar,
  expandedId,
  setExpandedId,
  onPickCandidateRow,
  isCalculating
}) {
  const hasSelection = checkedCols && checkedCols.length > 0;

  return (
    <>
      <div style={styles.pagePad}>
        <button onClick={onBack} style={styles.backBtn}>← Voltar</button>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>

          <div style={styles.box}>
            <div
              onClick={() => setExpandedId(expandedId === selectedFoodDetails?.id ? null : selectedFoodDetails?.id)}
              style={styles.row}
            >
              <div style={{ fontWeight: 900 }}>
                {selectedFoodDetails?.description}
                {selectedFoodDetails?.category ? ` — ${selectedFoodDetails.category}` : ""}
              </div>
              <div style={styles.subtext}>
                {isCalculating ? "Calculando…" : (expandedId === selectedFoodDetails?.id ? "Ocultar tabela" : "Exibir tabela completa")}
              </div>
            </div>

            {hasSelection && (
              <div style={styles.kvGrid}>
                {checkedCols.map((c) => (
                  <div key={c} style={styles.kvCard}>
                    <div style={styles.kvLabel}>{pt(c)}</div>
                    <div style={styles.kvValue}>{fmt(getVal(selectedFoodDetails, c))}</div>
                  </div>
                ))}
              </div>
            )}

            {expandedId === selectedFoodDetails?.id && (
              <div style={{ marginTop: 12 }}>
                <NutrientGrid item={selectedFoodDetails} allColumns={displayColumns} />
              </div>
            )}
          </div>

          <div>
            <Text style={{ fontWeight: "700"  }}>Valores nutricionais com base em 100g do alimento dos similares.</Text>
            <div style={{ marginTop: 8 }}>
              <SimilarTableWeb
                rows={similar}
                selectedCols={checkedCols}
                allCols={displayColumns}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                onPickCandidate={onPickCandidateRow}
                loading={isCalculating}
              />
            </div>
          </div>

        </div>
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}