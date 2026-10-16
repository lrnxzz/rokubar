import { createStore, useStore } from "../lib/store";

const storageKey = "rokubar.favorites";

function saved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");

    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

const favorites = createStore(saved());

export function toggleFavorite(appId: string) {
  favorites.update((current) => (current.includes(appId) ? current.filter((id) => id !== appId) : [...current, appId]));

  try {
    localStorage.setItem(storageKey, JSON.stringify(favorites.get()));
  } catch {
    // Without storage the favorites last until Rokubar quits.
  }
}

export function useFavorites(): string[] {
  return useStore(favorites);
}
