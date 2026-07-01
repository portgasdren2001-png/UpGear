/**
 * publishStore.js — ReadyAI公開データ永続化
 *
 * UpGear OSから同期された商品・カテゴリ・ランキングをJSONファイルで保持する。
 * DBは不要。ファイル1本でシンプルに管理。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'published.json');

const EMPTY_STORE = {
  products:   [],
  categories: [],
  rankings:   [],
  syncedAt:   null,
  version:    1,
};

function load() {
  try {
    if (!existsSync(STORE_FILE)) return structuredClone(EMPTY_STORE);
    return JSON.parse(readFileSync(STORE_FILE, 'utf-8'));
  } catch {
    return structuredClone(EMPTY_STORE);
  }
}

function save(store) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getProducts()   { return load().products; }
export function getCategories() { return load().categories; }
export function getRankings()   { return load().rankings; }
export function getSyncMeta()   { const s = load(); return { syncedAt: s.syncedAt, count: s.products.length }; }

export function getProductById(id) {
  return load().products.find(p => p.id === id) || null;
}

export function sync({ products, categories, rankings }) {
  const store = {
    products:   products   || [],
    categories: categories || [],
    rankings:   rankings   || [],
    syncedAt:   Date.now(),
    version:    1,
  };
  save(store);
  return { ok: true, count: store.products.length, syncedAt: store.syncedAt };
}
