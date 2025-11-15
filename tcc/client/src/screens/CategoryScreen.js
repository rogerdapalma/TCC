import React from "react";
import SearchBar from "../components/SearchBar";
import FoodCard from "../components/FoodCard";
import SuggestionList from "../components/SuggestionList";
import useDebouncedValue from "../utils/useDebouncedValue";
import useClickOutside from "../utils/useClickOutside";
import styles from "./styles/CategoryScreen.styles";

export default function CategoryScreen({
  selectedCat, categoryQuery, setCategoryQuery,
  categoryFoods, onBack, getMini, ensureMini, onSelectFood
}) {
  const dq = useDebouncedValue(categoryQuery, 150);
  const [suggestions, setSuggestions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  useClickOutside(wrapRef, () => setOpen(false));

  React.useEffect(() => {
    const s = dq.trim().toLowerCase();
    if (s.length < 2) { setSuggestions([]); return; }
    const list = categoryFoods
      .filter((r) => String(r.description || "").toLowerCase().includes(s))
      .slice(0, 10);
    setSuggestions(list);
  }, [dq, categoryFoods]);

  return (
    <>
      <div style={styles.pagePad}>
        <button onClick={onBack} style={styles.backBtn}>← Voltar</button>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={styles.headerRow}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedCat}</div>
            <div ref={wrapRef} style={styles.searchWrap}>
              <SearchBar
                value={categoryQuery}
                onChange={setCategoryQuery}
                onFocus={() => setOpen(true)}
                placeholder="Filtrar nesta categoria…"
                onSubmit={() => {}}
              />
              <SuggestionList items={suggestions} onSelect={(it)=>{ setOpen(false); onSelectFood(it); }} open={open} />
            </div>
          </div>

          <div style={styles.nutritionNote}>Valores nutricionais com base em 100g do alimento.</div>
          <div style={styles.grid}>
            {categoryFoods.map((it) => (
              <FoodCard
                key={it.id}
                item={it}
                getMini={getMini}
                ensureMini={ensureMini}
                onClick={() => onSelectFood(it)}
              />
            ))}
            {categoryFoods.length === 0 && <div style={styles.none}>Nenhum alimento encontrado.</div>}
          </div>
        </div>
      </div>
    </>
  );
}