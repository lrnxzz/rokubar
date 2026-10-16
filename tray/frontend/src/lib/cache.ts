import { useEffect, useSyncExternalStore } from "react";

/** Values loaded once per key; whoever reads a key renders again when its value arrives. */
export type Cache<V> = {
  read(key: string): V | undefined;
  load(key: string): Promise<V>;
  subscribe(listener: () => void): () => void;
};

export function createCache<V>(fetch: (key: string) => Promise<V>, known: Iterable<[string, V]> = []): Cache<V> {
  const values = new Map(known);
  const pending = new Map<string, Promise<V>>();
  const listeners = new Set<() => void>();

  const load = (key: string): Promise<V> => {
    const value = values.get(key);
    if (value !== undefined) {
      return Promise.resolve(value);
    }

    let promise = pending.get(key);
    if (!promise) {
      promise = fetch(key)
        .then((loaded) => {
          values.set(key, loaded);
          for (const listener of listeners) {
            listener();
          }

          return loaded;
        })
        // A failed load isn't an answer: the next load of the key tries again.
        .finally(() => pending.delete(key));
      pending.set(key, promise);
    }

    return promise;
  };

  return {
    read: (key) => values.get(key),
    load,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useCached<V>(cache: Cache<V>, key: string | undefined): V | undefined {
  useEffect(() => {
    if (key) {
      cache.load(key).catch(() => undefined);
    }
  }, [cache, key]);

  return useSyncExternalStore(cache.subscribe, () => (key ? cache.read(key) : undefined));
}
