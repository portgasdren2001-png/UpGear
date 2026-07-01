import { useState, useEffect, useCallback } from "react";
import { initialData } from "../data/initialData";

const STORAGE_KEY = "upgear_data";
const LEARNING_KEY = "upgear_learning";
const MASTER_KEY = "upgear_master";
const CATEGORIES_KEY = "upgear_categories";
const GENRES_KEY = "upgear_genres";

const DEFAULT_GENRES = {
  genres: [
    { id: "g_gadget", name: "ガジェット", order: 0 },
    { id: "g_bag",    name: "バッグ",     order: 1 },
    { id: "g_apparel",name: "アパレル",   order: 2 },
    { id: "g_shoes",  name: "シューズ",   order: 3 },
    { id: "g_desk",   name: "デスク環境", order: 4 },
    { id: "g_edc",    name: "EDC",        order: 5 },
    { id: "g_travel", name: "トラベル",   order: 6 },
    { id: "g_other",  name: "その他",     order: 7 },
  ],
};

function loadGenres() {
  try {
    const raw = localStorage.getItem(GENRES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_GENRES;
}

function saveGenres(data) {
  localStorage.setItem(GENRES_KEY, JSON.stringify(data));
}

function genGenreId() {
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

const DEFAULT_CATEGORIES = {
  mainCategories: [
    { id: "mc_gadget", name: "ガジェット", subCategories: [
      { id: "sc_earphone",  name: "イヤホン" },
      { id: "sc_headphone", name: "ヘッドホン" },
      { id: "sc_mouse",     name: "マウス" },
      { id: "sc_keyboard",  name: "キーボード" },
      { id: "sc_battery",   name: "モバイルバッテリー" },
      { id: "sc_charger",   name: "充電器" },
      { id: "sc_watch",     name: "スマートウォッチ" },
      { id: "sc_camera",    name: "カメラ" },
      { id: "sc_gadget_o",  name: "その他" },
    ]},
    { id: "mc_bag", name: "バッグ", subCategories: [
      { id: "sc_backpack",  name: "バックパック" },
      { id: "sc_shoulder",  name: "ショルダー" },
      { id: "sc_tote",      name: "トート" },
      { id: "sc_bag_o",     name: "その他" },
    ]},
    { id: "mc_apparel", name: "アパレル", subCategories: [
      { id: "sc_jacket",    name: "ジャケット" },
      { id: "sc_pants",     name: "パンツ" },
      { id: "sc_tshirt",    name: "Tシャツ" },
      { id: "sc_hoodie",    name: "パーカー" },
      { id: "sc_apparel_o", name: "その他" },
    ]},
    { id: "mc_shoes", name: "シューズ", subCategories: [
      { id: "sc_sneaker",   name: "スニーカー" },
      { id: "sc_boots",     name: "ブーツ" },
      { id: "sc_shoes_o",   name: "その他" },
    ]},
    { id: "mc_desk", name: "デスク環境", subCategories: [
      { id: "sc_desk",      name: "デスク" },
      { id: "sc_chair",     name: "チェア" },
      { id: "sc_marm",      name: "モニターアーム" },
      { id: "sc_light",     name: "照明" },
      { id: "sc_speaker",   name: "スピーカー" },
      { id: "sc_desk_o",    name: "その他" },
    ]},
    { id: "mc_edc", name: "EDC", subCategories: [
      { id: "sc_wallet",    name: "財布" },
      { id: "sc_keycase",   name: "キーケース" },
      { id: "sc_pen",       name: "ペン" },
      { id: "sc_edc_o",     name: "その他" },
    ]},
    { id: "mc_travel", name: "トラベル", subCategories: [
      { id: "sc_suitcase",  name: "スーツケース" },
      { id: "sc_tpouch",    name: "トラベルポーチ" },
      { id: "sc_travel_o",  name: "その他" },
    ]},
    { id: "mc_other", name: "その他", subCategories: [
      { id: "sc_other",     name: "その他" },
    ]},
  ]
};

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CATEGORIES;
}

function saveCategories(data) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data));
}

function genId() {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadLearning() {
  try {
    const raw = localStorage.getItem(LEARNING_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { patterns: [] };
}

function saveLearning(data) {
  localStorage.setItem(LEARNING_KEY, JSON.stringify(data));
}

function loadMaster() {
  try {
    const raw = localStorage.getItem(MASTER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { versions: [] };
}

function saveMaster(data) {
  localStorage.setItem(MASTER_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState(() => load() || initialData);
  const [learningData, setLearningDataState] = useState(() => loadLearning());
  const [masterStore, setMasterStore] = useState(() => loadMaster());
  const [categories, setCategoriesState] = useState(() => loadCategories());
  const [genreStore, setGenreStore] = useState(() => loadGenres());

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  // posts helpers
  const addPost = (post) =>
    update((d) => ({ ...d, posts: [...d.posts, post] }));

  const updatePost = (no, patch) =>
    update((d) => ({
      ...d,
      posts: d.posts.map((p) => (p.no === no ? { ...p, ...patch } : p)),
    }));

  const deletePost = (no) =>
    update((d) => ({ ...d, posts: d.posts.filter((p) => p.no !== no) }));

  // items helpers
  const addItem = (item) =>
    update((d) => ({ ...d, items: [...d.items, item] }));

  const updateItem = (id, patch) =>
    update((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const deleteItem = (id) =>
    update((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const setFollowers = (n) => update((d) => ({ ...d, followers: n }));

  const resetData = () => {
    save(initialData);
    setData(initialData);
  };

  const addLearning = (record) => {
    setLearningDataState(prev => {
      const next = { patterns: [...(prev.patterns || []), { ...record, ts: Date.now() }].slice(-200) };
      saveLearning(next);
      return next;
    });
  };

  const addMasterVersion = (version) => {
    setMasterStore((prev) => {
      const next = { versions: [...(prev.versions || []), version].slice(-20) };
      saveMaster(next);
      return next;
    });
  };

  const latestMasterVersion = masterStore.versions[masterStore.versions.length - 1] || null;

  // ─── Category management ─────────────────────────────────────────────────────

  const updateCategories = (updater) => {
    setCategoriesState((prev) => {
      const next = updater(prev);
      saveCategories(next);
      return next;
    });
  };

  const addMainCategory = (name) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: [...prev.mainCategories, { id: genId(), name, subCategories: [] }],
    }));
  };

  const renameMainCategory = (id, name) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: prev.mainCategories.map((m) => m.id === id ? { ...m, name } : m),
    }));
  };

  const deleteMainCategory = (id) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: prev.mainCategories.filter((m) => m.id !== id),
    }));
  };

  const addSubCategory = (mainId, name) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: prev.mainCategories.map((m) =>
        m.id === mainId
          ? { ...m, subCategories: [...m.subCategories, { id: genId(), name }] }
          : m
      ),
    }));
  };

  const renameSubCategory = (mainId, subId, name) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: prev.mainCategories.map((m) =>
        m.id === mainId
          ? { ...m, subCategories: m.subCategories.map((s) => s.id === subId ? { ...s, name } : s) }
          : m
      ),
    }));
  };

  const deleteSubCategory = (mainId, subId) => {
    updateCategories((prev) => ({
      ...prev,
      mainCategories: prev.mainCategories.map((m) =>
        m.id === mainId
          ? { ...m, subCategories: m.subCategories.filter((s) => s.id !== subId) }
          : m
      ),
    }));
  };

  const resetCategories = () => {
    saveCategories(DEFAULT_CATEGORIES);
    setCategoriesState(DEFAULT_CATEGORIES);
  };

  // ─── Genre management ─────────────────────────────────────────────────────────

  const genres = [...(genreStore.genres || [])].sort((a, b) => a.order - b.order);

  const updateGenres = (updater) => {
    setGenreStore((prev) => {
      const next = updater(prev);
      saveGenres(next);
      return next;
    });
  };

  const addGenre = (name) => {
    updateGenres((prev) => {
      const maxOrder = Math.max(-1, ...(prev.genres || []).map((g) => g.order));
      return { ...prev, genres: [...(prev.genres || []), { id: genGenreId(), name, order: maxOrder + 1 }] };
    });
  };

  const renameGenre = (id, name) => {
    updateGenres((prev) => ({
      ...prev,
      genres: prev.genres.map((g) => (g.id === id ? { ...g, name } : g)),
    }));
  };

  const deleteGenre = (id) => {
    updateGenres((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g.id !== id),
    }));
  };

  const moveGenre = (id, direction) => {
    updateGenres((prev) => {
      const sorted = [...prev.genres].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((g) => g.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newList = sorted.map((g, i) => {
        if (i === idx)     return { ...g, order: sorted[swapIdx].order };
        if (i === swapIdx) return { ...g, order: sorted[idx].order };
        return g;
      });
      return { ...prev, genres: newList };
    });
  };

  const resetGenres = () => {
    saveGenres(DEFAULT_GENRES);
    setGenreStore(DEFAULT_GENRES);
  };

  return {
    data,
    addPost, updatePost, deletePost,
    addItem, updateItem, deleteItem,
    setFollowers,
    resetData,
    learningData,
    addLearning,
    masterStore,
    addMasterVersion,
    latestMasterVersion,
    categories,
    addMainCategory,
    renameMainCategory,
    deleteMainCategory,
    addSubCategory,
    renameSubCategory,
    deleteSubCategory,
    resetCategories,
    genres,
    addGenre,
    renameGenre,
    deleteGenre,
    moveGenre,
    resetGenres,
  };
}
