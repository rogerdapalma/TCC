import React from "react";
import styles from "./styles/AboutScreen.styles";

export default function AboutScreen({ onBack }) {
  return (
    <div style={styles.pagePad}>
      <button onClick={onBack} style={styles.backBtn}>← Voltar</button>
      <div style={styles.card}>
        <div style={styles.title}>Saiba mais</div>
        <div style={styles.subtitle}>
          Explore grupos, detalhe de nutrientes (selecionáveis) e itens similares .
        </div>
        <div style={styles.subtitle}>
          Para mais informações Email: rogerdapalma@gmail.com.
        </div>
      </div>
    </div>
  );
}
