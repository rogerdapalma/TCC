import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, View, Modal, Text, Pressable } from "react-native";
import { api } from "../api/client";

import { ThemeStyles } from "../utils/theme";
import { PageScroll } from "../utils/layout";
import { KEY_ALIASES, getVal } from "../utils/aliases";

import NavBar from "../components/NavBar";
import HomeScreen from "./HomeScreen";
import CategoryScreen from "./CategoryScreen";
import FoodScreen from "./FoodScreen";
import ResultsScreen from "./ResultsScreen";
import AboutScreen from "./AboutScreen";

const EXCLUDED_KEYS = new Set(["id", "description", "category"]);
const BLUE = "#2563eb"; // mantém cor de botões existente

export default function SinglePage() {
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [categories, setCategories] = useState([]), [selectedCat, setSelectedCat] = useState("Todos");
  const [foodsCache, setFoodsCache] = useState(new Map());
  const [allColumns, setAllColumns] = useState([]), [checkedCols, setCheckedCols] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null), [selectedFoodDetails, setSelectedFoodDetails] = useState(null);

  const [homeQuery, setHomeQuery] = useState(""), [categoryQuery, setCategoryQuery] = useState("");
  const [k, setK] = useState("10"), [metric, setMetric] = useState("cosine"), [sameCategory, setSameCategory] = useState(false);

  const [similar, setSimilar] = useState([]), [expandedId, setExpandedId] = useState(null), [candidate, setCandidate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Tema padrão escuro
  const [theme, setTheme] = useState(() => (Platform.OS === "web" ? (localStorage.getItem("theme") || "dark") : "dark"));
  const [view, setView] = useState("home");

  const [miniCache, setMiniCache] = useState(new Map());
  const getMini = (id) => miniCache.get(id);
  const ensureMini = React.useCallback(async (id) => {
    if (miniCache.has(id)) return;
    try {
      const detail = await api.foodDetail(id, "energy_kcal,carbohydrate_g,protein_g");
      const data = detail?.item || detail;
      setMiniCache(prev => new Map(prev).set(id, data));
    } catch {}
  }, [miniCache]);

  const [categoryFoods, setCategoryFoods] = useState([]);
  const [showNoNutrientsAlert, setShowNoNutrientsAlert] = useState(false);

  const displayColumns = useMemo(() => allColumns.filter((c) => !EXCLUDED_KEYS.has(c)), [allColumns]);

  useEffect(() => {
    (async () => {
      try {
        await api.health();
        const cats = await api.categories(); const list = cats?.categories ?? cats?.items ?? [];
        setCategories(["Todos", ...list]);
        const colRes = await api.columns(); const cols = colRes?.columns || colRes?.numeric_columns || colRes?.items || [];
        setAllColumns(cols);
        setCheckedCols([]); // sem pré-seleção
      } catch (e) { setError(String(e?.message || e)); } finally { setLoading(false); }
    })();
  }, []);
  useEffect(() => { if (Platform.OS === "web") localStorage.setItem("theme", theme); }, [theme]);

  async function ensureFoodsFor(category) {
    if (category === "Todos") {
      const cats = categories.filter(c => c !== "Todos");
      const need = cats.filter(c => !foodsCache.has(c));
      if (need.length) {
        const results = await Promise.all(need.map(c => api.foodsByCategory(c).catch(() => ({ items: [] }))));
        const m = new Map(foodsCache);
        need.forEach((c, i) => m.set(c, results[i].items || []));
        setFoodsCache(m);
        return Array.from(m.values()).flat();
      }
      return Array.from(foodsCache.values()).flat();
    } else {
      if (foodsCache.has(category)) return foodsCache.get(category);
      const res = await api.foodsByCategory(category); const items = res.items || [];
      const m = new Map(foodsCache); m.set(category, items); setFoodsCache(m); return items;
    }
  }

  async function getAllFoods() { return ensureFoodsFor("Todos"); }

  async function goToCategory(cat, presetQuery = "") {
    setSelectedCat(cat); setCategoryQuery(presetQuery);
    await ensureFoodsFor(cat);
    setView("category");
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  async function onSelectFood(item) {
    setCheckedCols([]); // não altera cores dos chips/seleção
    setSelectedFood(item); setSelectedFoodDetails(null);
    try {
      const colsCsv = allColumns.join(",");
      const detail = await api.foodDetail(item.id, colsCsv);
      const data = detail?.item || detail;
      setSelectedFoodDetails({ ...item, ...data });
      setExpandedId(null);
      setView("food");
      window?.scrollTo?.({ top: 0, behavior: "smooth" });
    } catch (e) { setError(String(e?.message || e)); }
  }

  async function calcularSimilar() {
    if (!selectedFoodDetails) { setError("Escolha um alimento primeiro."); return; }
    const featureCols = checkedCols;
    if (!featureCols.length) {
      setError("");
      setShowNoNutrientsAlert(true);
      return;
    }

    setError("");
    setExpandedId(null);
    setCandidate(null);
    setSimilar([]);
    setIsCalculating(true);

    const selectedCsv = featureCols.join(",");

    try {
      const res = await api.similar(
        selectedFoodDetails.id,
        {
          k: String(parseInt(k || "10", 10) || 10),
          metric,
          same_category: sameCategory ? "true" : "false",
          columns: selectedCsv,
          include: selectedCsv
        }
      );
      const items = res.items || [];

      setSimilar(items);
      const first = items[0] || null;
      
// NÃO expandir automaticamente a primeira linha:
      setExpandedId(null);
      //setExpandedId(first ? first.id : null);

      const needDetail = items.filter(it => featureCols.some(c => getVal(it, c) == null));
      if (needDetail.length) {
        const details = await Promise.all(needDetail.map(it => api.foodDetail(it.id, selectedCsv).catch(() => null)));
        setSimilar(prev =>
          prev.map(row => {
            const idx = needDetail.findIndex(n => n.id === row.id);
            if (idx >= 0 && details[idx]) {
              const d = details[idx].item || details[idx];
              return { ...row, ...d };
            }
            return row;
          })
        );
      }

      if (first) {
        try {
          const full = await api.foodDetail(first.id, displayColumns.join(","));
          const data = full?.item || full;
          setSimilar(prev => prev.map(it => it.id === first.id ? ({ ...it, ...data }) : it));
        } catch {}
      }

      setView("results");
      window?.scrollTo?.({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setIsCalculating(false);
    }
  }

  async function onPickCandidateRow(row) {
    setCandidate(row);
    const needsFetch = displayColumns.some(k => getVal(row, k) == null);
    if (needsFetch) {
      try {
        const detail = await api.foodDetail(row.id, displayColumns.join(","));
        const data = detail?.item || detail;
        setSimilar(prev => prev.map(it => it.id === row.id ? ({ ...it, ...data }) : it));
        setCandidate(c => (c && c.id === row.id ? ({ ...c, ...data }) : c));
      } catch (e) { setError(String(e?.message || e)); }
    }
  }

  function toggleCol(c) {
    if (EXCLUDED_KEYS.has(c)) return;
    setCheckedCols(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  useEffect(() => {
    (async () => {
      if (view !== "category") return;
      try {
        const base = await ensureFoodsFor(selectedCat);
        const q = categoryQuery.trim().toLowerCase();
        const filtered = q ? base.filter(r => String(r.description || "").toLowerCase().includes(q)) : base;
        setCategoryFoods(filtered);
      } catch (e) { setError(String(e?.message || e)); }
    })();
  }, [view, selectedCat, categoryQuery, categories.length, foodsCache]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme === "dark" ? "#212121" : "#f6f7fb" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    // >>> Fundo real do tema escuro aplicado aqui <<<
    <View style={{ flex: 1, backgroundColor: theme === "dark" ? "#212121" : "#f6f7fb" }}>
      <ThemeStyles theme={theme} />
      <PageScroll>
        {Platform.OS === "web" && (
          <NavBar
            siteName="NutriFinder"
            onHome={() => setView("home")}
            onAbout={() => setView("about")}
            theme={theme}
            toggleTheme={() => setTheme(t => (t === "light" ? "dark" : "light"))}
          />
        )}

        {view === "home" && (
          <HomeScreen
            error={error}
            homeQuery={homeQuery}
            setHomeQuery={setHomeQuery}
            categories={categories}
            goToCategory={goToCategory}
            onSelectFood={onSelectFood}
            getAllFoods={getAllFoods}
          />
        )}

        {view === "category" && (
          <CategoryScreen
            selectedCat={selectedCat}
            categoryQuery={categoryQuery}
            setCategoryQuery={setCategoryQuery}
            categoryFoods={categoryFoods}
            getMini={getMini}
            ensureMini={ensureMini}
            onSelectFood={onSelectFood}
            onBack={() => setView("home")}
          />
        )}

        {view === "food" && (
          <FoodScreen
            selectedFoodDetails={selectedFoodDetails}
            allColumns={allColumns}
            displayColumns={displayColumns}
            checkedCols={checkedCols}
            toggleCol={toggleCol}
            k={k} setK={setK}
            metric={metric} setMetric={setMetric}
            sameCategory={sameCategory} setSameCategory={setSameCategory}
            calcularSimilar={calcularSimilar}
            isCalculating={isCalculating}
            onBack={() => setView("category")}
          />
        )}

        {view === "results" && (
          <ResultsScreen
            onBack={() => setView("food")}
            selectedFoodDetails={selectedFoodDetails}
            checkedCols={checkedCols}
            allColumns={allColumns}
            displayColumns={displayColumns}
            similar={similar}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onPickCandidateRow={onPickCandidateRow}
            isCalculating={false}
          />
        )}

        {view === "about" && <AboutScreen onBack={() => setView("home")} />}

        <div style={{ height: 24 }} />

        {/* ALERTA CENTRALIZADO (mantém surface #171717) */}
        <Modal
          visible={showNoNutrientsAlert}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => { setShowNoNutrientsAlert(false); setError(""); }}
        >
          <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24
          }}>
            <View style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#171717",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "#2a2a2a"
            }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#fff" }}>Atenção</Text>
              <Text style={{ fontSize: 16, color: "#e5e7eb", marginBottom: 16 }}>
                nenhum nutriente selecionado, selecione os nutrientes que deseja
              </Text>
              <Pressable
                onPress={() => { setShowNoNutrientsAlert(false); setError(""); }}
                style={({ pressed }) => ({
                  alignSelf: "flex-end",
                  backgroundColor: BLUE,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 12,
                  opacity: pressed ? 0.9 : 1
                })}
                accessibilityRole="button"
                accessibilityLabel="Fechar alerta"
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </PageScroll>
    </View>
  );
}