import { useState, useEffect, useCallback } from "react";
import { initialData } from "../data/initialData";

const STORAGE_KEY = "upgear_data";

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

export function useStore() {
  const [data, setData] = useState(() => load() || initialData);

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

  return {
    data,
    addPost, updatePost, deletePost,
    addItem, updateItem, deleteItem,
    setFollowers,
    resetData,
  };
}
