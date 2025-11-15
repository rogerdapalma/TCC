from __future__ import annotations

import heapq
import math
from dataclasses import dataclass
from typing import Iterable, List, Literal, Optional, Sequence, Tuple, Union

Number = Union[int, float]
Vector = Sequence[Optional[Number]]

OtherItem = Tuple[int, str, str, Vector]   # (id, nome, categoria, vetor)
ScoredItem = Tuple[int, str, str, float]   # score em % (0..100)

Metric = Literal["cosine", "euclidean", "manhattan", "seuclidean"]
Normalize = Literal["none", "zscore", "robust", "minmax"]
Impute = Literal["mean", "median", "zero"]


@dataclass(frozen=True)
class ColStats:
    n: int
    mean: float
    median: float
    std: float
    mad: float
    vmin: float
    vmax: float
    var: float


# -------------------------- util & estatísticas --------------------------

def _is_nan(x: Optional[Number]) -> bool:
    return x is None or (isinstance(x, float) and math.isnan(x))

def _safe(x: Optional[Number]) -> float:
    return 0.0 if _is_nan(x) else float(x)

def _transpose(vectors: List[List[float]]) -> List[List[float]]:
    if not vectors:
        return []
    d = len(vectors[0])
    cols = [[] for _ in range(d)]
    for row in vectors:
        for i, x in enumerate(row):
            cols[i].append(x)
    return cols

def _median(sorted_vals: List[float]) -> float:
    n = len(sorted_vals)
    if n == 0:
        return 0.0
    mid = n // 2
    if n % 2:
        return sorted_vals[mid]
    return 0.5 * (sorted_vals[mid - 1] + sorted_vals[mid])

def _col_stats(vectors: Iterable[Vector]) -> List[ColStats]:
    vs = [[_safe(x) for x in row] for row in vectors]
    if not vs:
        return []
    d = len(vs[0])
    for r in vs:
        if len(r) != d:
            raise ValueError(f"Dimensão divergente: esperado {d}, obtido {len(r)}")

    cols = _transpose(vs)
    stats: List[ColStats] = []
    for col in cols:
        vals = [float(x) for x in col]
        n = len(vals)
        s = sum(vals)
        mean = s / max(n, 1)
        vmin = min(vals) if n else 0.0
        vmax = max(vals) if n else 1.0
        var = sum((x - mean) ** 2 for x in vals) / max(n, 1)
        std = math.sqrt(var) if var > 0.0 else 1.0
        sorted_vals = sorted(vals)
        med = _median(sorted_vals)
        mad_vals = [abs(x - med) for x in vals]
        mad = _median(sorted(mad_vals)) or 1.0
        if abs(vmax - vmin) < 1e-12:
            vmax = vmin + 1.0  # evita divisão por zero
        stats.append(ColStats(n=n, mean=mean, median=med, std=std, mad=mad, vmin=vmin, vmax=vmax, var=var if var > 1e-18 else 1.0))
    return stats

def _select_dims(vec: Vector, idx: Optional[Sequence[int]]) -> List[Optional[Number]]:
    if idx is None:
        return list(vec)
    return [vec[i] if 0 <= i < len(vec) else None for i in idx]

def _prepare_matrix(base_vec: Vector, others: List[OtherItem], selected_idx: Optional[Sequence[int]]) -> Tuple[List[float], List[OtherItem], List[ColStats]]:
    base_sel = _select_dims(base_vec, selected_idx)
    others_sel: List[OtherItem] = [(fid, name, cat, _select_dims(v, selected_idx)) for fid, name, cat, v in others]
    d = len(base_sel)
    if d == 0:
        raise ValueError("Nenhuma dimensão/nutriente selecionado.")
    for _, _, _, v in others_sel:
        if len(v) != d:
            raise ValueError(f"Dimensão divergente: base={d}, outro={len(v)}")
    all_rows = [base_sel] + [v for _, _, _, v in others_sel]
    stats = _col_stats(all_rows)
    return [_safe(x) for x in base_sel], others_sel, stats

def _impute_row(row: Vector, stats: List[ColStats], how: Impute) -> List[float]:
    out: List[float] = []
    for x, st in zip(row, stats):
        if not _is_nan(x):
            out.append(float(x))
            continue
        if how == "mean":
            out.append(st.mean)
        elif how == "median":
            out.append(st.median)
        elif how == "zero":
            out.append(0.0)
        else:
            raise ValueError("impute must be 'mean' | 'median' | 'zero'")
    return out

def _normalize_row(row: Sequence[float], stats: List[ColStats], mode: Normalize) -> List[float]:
    if mode == "none":
        return list(row)
    out: List[float] = []
    for x, st in zip(row, stats):
        if mode == "zscore":
            out.append((x - st.mean) / st.std)
        elif mode == "robust":
            out.append((x - st.median) / st.mad)
        elif mode == "minmax":
            out.append((x - st.vmin) / (st.vmax - st.vmin))
        else:
            raise ValueError("normalize must be 'none' | 'zscore' | 'robust' | 'minmax'")
    return out


# -------------------------- métricas ponderadas --------------------------

def _weighted_dot(a: Sequence[float], b: Sequence[float], w: Sequence[float]) -> float:
    return sum((wa * x * y) for x, y, wa in zip(a, b, w))

def _weighted_norm(a: Sequence[float], w: Sequence[float]) -> float:
    return math.sqrt(sum((wa * x * x) for x, wa in zip(a, w)))

def cosine_weighted(a: Sequence[float], b: Sequence[float], w: Sequence[float]) -> float:
    na = _weighted_norm(a, w)
    nb = _weighted_norm(b, w)
    if na == 0.0 or nb == 0.0:
        return 0.0
    return _weighted_dot(a, b, w) / (na * nb)

def euclidean_weighted(a: Sequence[float], b: Sequence[float], w: Sequence[float]) -> float:
    return math.sqrt(sum((wa * (x - y) ** 2) for x, y, wa in zip(a, b, w)))

def manhattan_weighted(a: Sequence[float], b: Sequence[float], w: Sequence[float]) -> float:
    return sum((wa * abs(x - y)) for x, y, wa in zip(a, b, w))


# -------------------------- conversão p/ % --------------------------

def _pct_from_cosine(cos_val: float, decimals: int) -> float:
    pct = ((cos_val + 1.0) * 0.5) * 100.0
    pct = max(0.0, min(100.0, pct))
    return round(pct, decimals)

def _pct_list_from_distances(dists: List[Tuple[int, str, str, float]], decimals: int) -> List[ScoredItem]:
    if not dists:
        return []
    d_vals = [d for _, _, _, d in dists]
    d_min, d_max = min(d_vals), max(d_vals)
    if abs(d_max - d_min) < 1e-12:
        return [(fid, name, cat, round(100.0, decimals)) for fid, name, cat, _ in dists]

    rng = (d_max - d_min)
    out: List[ScoredItem] = []
    for fid, name, cat, d in dists:
        pct = ((d_max - d) / rng) * 100.0
        pct = max(0.0, min(100.0, pct))
        out.append((fid, name, cat, round(pct, decimals)))
    return out


# -------------------------- API pública (KNN alimento) --------------------------

def knn_food_similarity(
    base_vec: Vector,
    others: List[OtherItem],
    *,
    k: int = 10,
    selected_idx: Optional[Sequence[int]] = None,
    metric: Metric = "cosine",
    normalize: Normalize = "zscore",
    impute: Impute = "mean",
    weights: Optional[Sequence[float]] = None,
    exclude_ids: Optional[Iterable[int]] = None,
    percent_decimals: int = 1,
) -> List[ScoredItem]:
    """
    Retorna os K alimentos mais similares ao alimento base, com score em % (0..100).
    """
    if k < 1:
        k = 1
    if not others:
        return []

    base_raw, others_sel, stats = _prepare_matrix(base_vec, others, selected_idx)
    base_imp = _impute_row(base_raw, stats, impute)
    others_imp: List[OtherItem] = [(fid, name, cat, _impute_row(v, stats, impute)) for fid, name, cat, v in others_sel]

    base = _normalize_row(base_imp, stats, normalize)
    normed_others: List[OtherItem] = [(fid, name, cat, _normalize_row(v, stats, normalize)) for fid, name, cat, v in others_imp]

    d = len(base)
    if metric == "seuclidean":
        w = [1.0 / st.var for st in stats]
    else:
        w = [1.0] * d

    if weights is not None:
        if len(weights) != d:
            raise ValueError(f"'weights' deve ter {d} valores.")
        w = [max(0.0, float(ww)) * wi for ww, wi in zip(weights, w)]

    ex_ids = set(exclude_ids or [])

    if metric == "cosine":
        raw: List[Tuple[int, str, str, float]] = []
        for fid, name, cat, v in normed_others:
            if fid in ex_ids:
                continue
            cos_val = float(cosine_weighted(base, v, w))
            raw.append((fid, name, cat, cos_val))
        scored_pct: List[ScoredItem] = [(fid, name, cat, _pct_from_cosine(cos, percent_decimals)) for fid, name, cat, cos in raw]
        return heapq.nlargest(k, scored_pct, key=lambda t: (t[3], -t[0]))

    elif metric in ("euclidean", "manhattan", "seuclidean"):
        dists: List[Tuple[int, str, str, float]] = []
        for fid, name, cat, v in normed_others:
            if fid in ex_ids:
                continue
            if metric == "manhattan":
                dval = float(manhattan_weighted(base, v, w))
            else:
                dval = float(euclidean_weighted(base, v, w))
            dists.append((fid, name, cat, dval))
        scored_pct = _pct_list_from_distances(dists, percent_decimals)
        return heapq.nlargest(k, scored_pct, key=lambda t: (t[3], -t[0]))

    else:
        raise ValueError("metric must be 'cosine' | 'euclidean' | 'manhattan' | 'seuclidean'")


def build_selected_indexes(all_columns: Sequence[str], selected_columns: Optional[Sequence[str]]) -> Optional[List[int]]:
    if not selected_columns:
        return None
    pos = {c: i for i, c in enumerate(all_columns)}
    idx: List[int] = []
    for c in selected_columns:
        if c not in pos:
            raise KeyError(f"Coluna '{c}' não encontrada em all_columns.")
        idx.append(pos[c])
    return idx


def knn(
    base_vec: Sequence[float],
    others: List[Tuple[int, str, str, Sequence[float]]],
    k: int = 10,
    metric: Literal["cosine", "euclidean"] = "cosine",
) -> List[ScoredItem]:
    metric_map: Metric = "cosine" if metric == "cosine" else "euclidean"
    conv_others: List[OtherItem] = [(fid, name, cat, list(v)) for fid, name, cat, v in others]
    return knn_food_similarity(
        list(base_vec),
        conv_others,
        k=k,
        selected_idx=None,
        metric=metric_map,
        normalize="zscore",
        impute="mean",
        weights=None,
        exclude_ids=None,
        percent_decimals=1,
    )