import React from "react";
import { Text } from "react-native";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import CategoryBlocks from "../components/CategoryBlocks";
import SuggestionList from "../components/SuggestionList";
import useDebouncedValue from "../utils/useDebouncedValue";
import styles from "./styles/HomeScreen.styles";

export default function HomeScreen({
  error, homeQuery, setHomeQuery, categories, goToCategory, onSelectFood, getAllFoods
}) {
  const dq = useDebouncedValue(homeQuery, 150);
  const [allFoods, setAllFoods] = React.useState(null);
  const [suggestions, setSuggestions] = React.useState([]);

  // === NOVO: controla abertura do painel + ref para click-outside ===
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const q = dq.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);              // fecha quando texto curto
      return;
    }
    (async () => {
      const base = allFoods ?? await getAllFoods();
      if (!allFoods) setAllFoods(base);
      const list = base
        .filter((r) => String(r.description || "").toLowerCase().includes(q))
        .slice(0, 10);
      setSuggestions(list);
      setOpen(true);               // abre quando há consulta válida
    })();
  }, [dq]); // debounce controla a frequência

  // === NOVO: fecha ao clicar fora e tecla Esc ===
  React.useEffect(() => {
    const onDown = (e) => {
      const el = wrapRef.current;
      if (!open || !el || el.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (open && e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div style={styles.pagePad}>
        {!!error && <Text style={{ color: "#b91c1c", fontWeight: "600" }}>Erro: {error}</Text>}
        <Hero
          title="Tabela de Busca de similaridade Nutricional"
          tableLabel="Usada como referencia Tabela TACO"
          subtitle="Plataforma nutricional completa: pesquise alimentos e encontre similares com base em seus perfis nutricionais."
        />

        {/* ENVOLVA input + lista com o ref para capturar click-outside */}
        <div ref={wrapRef} style={styles.searchWrap}>
          <SearchBar
            value={homeQuery}
            onChange={(v) => { setHomeQuery(v); setOpen(true); }}   // abre ao digitar
            onSubmit={() => { setOpen(false); goToCategory("Todos", homeQuery); }} // fecha ao buscar
            placeholder="Pesquisar alimento…"
          />
          {/* Mostra a aba só quando 'open' for true */}
          <SuggestionList
            items={open ? suggestions : []}
            onSelect={(item) => { setOpen(false); onSelectFood(item); }} // fecha ao selecionar
          />
        </div>

        <div style={styles.gridWrap}>
          <Text style={styles.groupTitle}></Text>
          <CategoryBlocks
            categories={categories}
            onSelect={(c) => goToCategory(c, "")}
            columns={4}
            itemHeight={120}
            maxWidth={1200}
            gap={16}
          />
        </div>
      </div>
    </>
  );
}