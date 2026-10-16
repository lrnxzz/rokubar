import { api } from "../api/client";
import type { Television } from "../api/types.gen";
import { attempt, notify } from "../feedback/toast";
import { createStore, useStore } from "../lib/store";

type Search = {
  televisions: Television[] | null;
  searching: boolean;
};

const search = createStore<Search>({
  televisions: null,
  searching: false,
});

export async function searchTelevisions() {
  search.update((current) => ({
    ...current,
    searching: true,
  }));

  const televisions = await api.search().catch((): Television[] => []);

  search.set({
    televisions,
    searching: false,
  });
}

export async function pair(found: Television) {
  if (await attempt(() => api.pair(found.serial), "Rokubar couldn't connect to that TV")) {
    notify(`Connected to ${found.name || "your Roku"}`);
  }
}

export function useSearch(): Search {
  return useStore(search);
}
