import { api } from "../api/client";
import type { App } from "../api/types.gen";
import { attempt } from "../feedback/toast";
import { createStore, useStore } from "../lib/store";
import { television } from "../television/television";

type Catalog = {
  apps: App[] | null;
  failed: boolean;
};

const catalog = createStore<Catalog>({
  apps: null,
  failed: false,
});

export async function reloadApps() {
  catalog.update((current) => ({
    ...current,
    failed: false,
  }));

  try {
    catalog.set({
      apps: await api.apps(),
      failed: false,
    });
  } catch {
    catalog.update((current) => ({
      ...current,
      failed: true,
    }));
  }
}

/** Lists the apps whenever a TV starts answering, since a TV that doesn't answer lists none. */
export function followApps() {
  let answering = "";

  television.subscribe(() => {
    const state = television.get();
    const serial = state?.reachable ? state.serial : "";

    if (serial && serial !== answering) {
      void reloadApps();
    }

    answering = serial;
  });
}

/** The name as the TV lists it, which may carry stray spaces. */
export function appName(app: App): string {
  return app.name.trim();
}

export function openApp(app: App): Promise<boolean> {
  return attempt(() => api.launch(app.id), `${appName(app)} didn't open`);
}

export function useApps() {
  const { apps, failed } = useStore(catalog);
  const all = apps ?? [];

  return {
    apps,
    launchable: all.filter((app) => app.type === "appl" && app.id !== "home"),
    inputs: all.filter((app) => app.type === "tvin"),
    failed,
  };
}
