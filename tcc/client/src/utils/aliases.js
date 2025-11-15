export const KEY_ALIASES = {
  energy_kcal: ["energia_kcal"], energy_kj: ["energia_kj"], protein_g: ["proteina_g"],
  lipid_g: ["lipideos_g", "gordura_total_g"],
  carbohydrate_g: ["carboidrato_g", "carboidratos_g"],
  fiber_g: ["fibra_g", "fibras_g"], sugars_g: ["acucares_g", "açúcares_g"], ash_g: ["cinzas_g"],
  water_g: ["agua_g", "água_g"], cholesterol_mg: ["colesterol_mg"], calcium_mg: ["calcio_mg", "cálcio_mg"],
  iron_mg: ["ferro_mg"], magnesium_mg: ["magnesio_mg", "magnésio_mg"], phosphorus_mg: ["fosforo_mg", "fósforo_mg"],
  potassium_mg: ["potassio_mg", "potássio_mg"], sodium_mg: ["sodio_mg", "sódio_mg"], zinc_mg: ["zinco_mg"],
  copper_mg: ["cobre_mg"], manganese_mg: ["manganes_mg", "manganês_mg"], selenium_ug: ["selenio_ug", "selênio_ug"],
  vitamin_c_mg: ["vitamina_c_mg"], vitamin_a_ug: ["vitamina_a_ug"], vitamin_e_mg: ["vitamina_e_mg"],
  vitamin_b6_mg: ["vitamina_b6_mg"], thiamin_mg: ["tiamina_mg"], riboflavin_mg: ["riboflavina_mg"],
  niacin_mg: ["niacina_mg"], folate_ug: ["folato_ug"], saturated_g: ["saturadas_g", "gorduras_saturadas_g"],
  monounsaturated_g: ["monoinsaturadas_g"], polyunsaturated_g: ["poliinsaturadas_g", "poli-insaturadas_g"],
};
for (const [en, arr] of Object.entries(KEY_ALIASES)) {
  arr.forEach((ptk) => {
    if (!KEY_ALIASES[ptk]) KEY_ALIASES[ptk] = [en];
  });
}

export function getVal(row, key) {
  if (!row) return undefined;
  if (key in row && row[key] != null) return row[key];
  const tries = KEY_ALIASES[key] || [];
  for (const k of tries) if (k in row && row[k] != null) return row[k];
  return row[key];
}
