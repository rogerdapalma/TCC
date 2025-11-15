export const PT = {
  id: "ID", description: "Descrição", category: "Categoria", score: "Score",
  humidity_percents: "Umidade (%)", energy_kcal: "Energia (kcal)", energy_kj: "Energia (kJ)",
  protein_g: "Proteína (g)", lipid_g: "Lipídeos (g)", carbohydrate_g: "Carboidratos (g)",
  fiber_g: "Fibras (g)", sugars_g: "Açúcares (g)", starch_g: "Amido (g)", ash_g: "Cinzas (g)",
  calcium_mg: "Cálcio (mg)", iron_mg: "Ferro (mg)", magnesium_mg: "Magnésio (mg)",
  phosphorus_mg: "Fósforo (mg)", potassium_mg: "Potássio (mg)", sodium_mg: "Sódio (mg)",
  zinc_mg: "Zinco (mg)", copper_mg: "Cobre (mg)", manganese_mg: "Manganês (mg)",
  selenium_ug: "Selênio (µg)", vitamin_c_mg: "Vitamina C (mg)", thiamin_mg: "Tiamina B1 (mg)",
  riboflavin_mg: "Riboflavina B2 (mg)", niacin_mg: "Niacina (mg)", vitamin_b6_mg: "Vitamina B6 (mg)",
  folate_ug: "Folato (µg)", vitamin_b12_ug: "Vitamina B12 (µg)", vitamin_a_ug: "Vitamina A (µg RE)",
  vitamin_e_mg: "Vitamina E (mg)", vitamin_d_ug: "Vitamina D (µg)", cholesterol_mg: "Colesterol (mg)",
  water_g: "Água (g)", monounsaturated_g: "Monoinsaturadas (g)", polyunsaturated_g: "Poli-insaturadas (g)",
  saturated_g: "Saturadas (g)"
};

export const pt = (k) =>
  PT[k] || k.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

export const fmt = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return v ?? "—";
  const a = Math.abs(n);
  return a >= 1000 ? n.toFixed(0) : a >= 100 ? n.toFixed(1) : n.toFixed(2);
};
