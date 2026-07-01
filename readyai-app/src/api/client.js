/**
 * ReadyAI APIクライアント
 *
 * 全データはUpGear OSサーバー（/api/*）から取得する。
 * ReadyAI自身はデータを持たない。
 */

const BASE = '/api';

async function get(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${path} — HTTP ${res.status}`);
  return res.json();
}

// 商品一覧
export function fetchProducts(params = {}) {
  return get('/products', params);
}

// 商品詳細
export function fetchProduct(id) {
  return get(`/products/${id}`);
}

// カテゴリ一覧
export function fetchCategories() {
  return get('/categories');
}

// ランキング
export function fetchRankings() {
  return get('/rankings');
}

// 同期状態
export function fetchSyncStatus() {
  return get('/sync/status');
}
