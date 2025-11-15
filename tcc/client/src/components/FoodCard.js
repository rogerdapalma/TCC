import React from "react";
import { getVal } from "../utils/aliases";
import { fmt } from "../utils/i18n";

/* Por quê: “Saiba mais” menor e semi-transparente; cores via tokens. */
export default function FoodCard({ item, getMini, ensureMini, onClick }) {
  const mini = getMini(item.id);

  React.useEffect(() => {
    const need =
      getVal(item, "energy_kcal") == null ||
      getVal(item, "carbohydrate_g") == null ||
      getVal(item, "protein_g") == null;
    if (need) ensureMini(item.id);
  }, [item?.id]);

  const v = (k) => getVal(mini ?? item, k);

  const infoBox = (label, value) => (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, color: "var(--subtext)" }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{fmt(value)}</div>
    </div>
  );

  return (
    <button
      onClick={() => onClick?.(item)}
      data-card
      style={{
        width: "100%", textAlign: "left", padding: 16, borderRadius: 12,
        border: "1px solid var(--border)", background: "var(--card)"
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>{item.description}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {infoBox("Energia (kcal)", v("energy_kcal"))}
        {infoBox("Carboidratos", v("carbohydrate_g"))}
        {infoBox("Proteínas", v("protein_g"))}
      </div>
      <div style={{ marginTop: 10, color: "var(--subtext)", fontSize: 12, opacity: 0.7 }}>Saiba mais →</div>
    </button>
  );
}
