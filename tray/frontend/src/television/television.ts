import { api } from "../api/client";
import { onTelevision } from "../api/events";
import type { Television } from "../api/types.gen";
import { createStore, useStore } from "../lib/store";

export const television = createStore<Television | null>(null);

export function connect() {
  onTelevision(television.set);

  // The first event carries the state too, so a failed read only waits for it.
  api
    .television()
    .then((initial) => television.update((latest) => latest ?? initial))
    .catch(() => undefined);
}

export function isOn(state: Television | null): boolean {
  return Boolean(state?.paired && state.reachable && state.power === "PowerOn");
}

export function useTelevision(): Television | null {
  return useStore(television);
}

export function useOn(): boolean {
  return useStore(television, isOn);
}
