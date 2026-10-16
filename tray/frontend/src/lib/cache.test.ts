import { expect, test, vi } from "vitest";

import { createCache } from "./cache";
import { createStore } from "./store";

test("a cache loads each key once and tells its readers when the value arrives", async () => {
  const fetch = vi.fn(async (key: string) => key.toUpperCase());
  const cache = createCache(fetch);
  const listener = vi.fn();
  cache.subscribe(listener);

  await Promise.all([cache.load("netflix"), cache.load("netflix")]);

  expect(cache.read("netflix")).toBe("NETFLIX");
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledTimes(1);
});

test("a failed load is forgotten, so the next load tries again", async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce("found");
  const cache = createCache<string>(fetch);

  await expect(cache.load("hbo")).rejects.toThrow("offline");
  await expect(cache.load("hbo")).resolves.toBe("found");
});

test("a store notifies only when its value changes", () => {
  const store = createStore(1);
  const listener = vi.fn();
  store.subscribe(listener);

  store.set(1);
  store.update((value) => value + 1);

  expect(store.get()).toBe(2);
  expect(listener).toHaveBeenCalledTimes(1);
});
