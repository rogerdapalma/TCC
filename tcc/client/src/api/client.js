const API_BASE = process.env.EXPO_PUBLIC_API || "http://127.0.0.1:8000";

async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} :: ${url} :: ${msg}`);
  }
  return res.json();
}

/**
 * Busca detalhes de um alimento com as colunas pedidas.
 * Tenta algumas rotas porque o backend pode estar com nomes levemente diferentes.
 */
async function foodDetail(id, columnsCsv) {
  const q = `columns=${encodeURIComponent(columnsCsv)}`;
  const tries = [
    `/v1/foods/${id}?${q}`,
    `/v1/food/${id}?${q}`,
    `/v1/foods/${id}/detail?${q}`,
  ];
  let lastErr;
  for (const p of tries) {
    try {
      return await apiGet(p);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Não foi possível obter detalhes do alimento.");
}

export const api = {
  health: () => apiGet("/health"),
  columns: () => apiGet("/v1/columns"),
  categories: () => apiGet("/v1/categories"),
  foodsByCategory: (c) =>
    apiGet(`/v1/foods?category=${encodeURIComponent(c)}`),
  similar: (id, params) =>
    apiGet(
      `/v1/foods/${id}/similar?${new URLSearchParams(params).toString()}`
    ),
  foodDetail,
};