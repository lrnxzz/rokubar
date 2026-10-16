import { useSyncExternalStore } from "react";

export type Store<T> = {
  get(): T;
  set(value: T): void;
  update(change: (value: T) => T): void;
  subscribe(listener: () => void): () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const set = (next: T) => {
    if (Object.is(value, next)) {
      return;
    }

    value = next;
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    get: () => value,
    set,
    update: (change) => set(change(value)),
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T;
export function useStore<T, S>(store: Store<T>, select: (value: T) => S): S;
export function useStore<T, S>(store: Store<T>, select?: (value: T) => S) {
  return useSyncExternalStore(store.subscribe, () => (select ? select(store.get()) : store.get()));
}
