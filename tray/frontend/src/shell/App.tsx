import { useEffect, useState } from "react";

import { iconUrl } from "../api/client";
import { useBrand } from "../apps/brand";
import { AppsPage } from "../pages/apps/AppsPage";
import { RemotePage } from "../pages/remote/RemotePage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { TvPage } from "../pages/tv/TvPage";
import { isOn, useTelevision } from "../television/television";
import styles from "./App.module.css";
import { CommandPalette } from "./CommandPalette";
import { Header } from "./Header";
import { Onboarding } from "./Onboarding";
import { type Page, requestedPage } from "./pages";
import { Standby } from "./Standby";
import { Tabs } from "./Tabs";
import { Toast } from "./Toast";
import { useDirections } from "./useDirections";
import { useShortcuts } from "./useShortcuts";

export function App() {
  const state = useTelevision();
  const [page, setPage] = useState(requestedPage);
  const [palette, setPalette] = useState(false);
  const [lit, pressDirection] = useDirections();

  const on = isOn(state);
  const blocked = Boolean(state?.paired) && !on && page !== "settings";
  const showing = on && state?.app.id && state.app.type !== "home" ? state.app.id : undefined;
  const accent = useBrand(showing && iconUrl(showing));

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-rgb", accent);
  }, [accent]);

  useShortcuts({
    enabled: on,
    palette,
    onPalette: setPalette,
    onPage: setPage,
    onDirection: pressDirection,
  });

  if (!state) {
    return <div className={styles.panel} />;
  }

  const content: Record<Page, React.ReactNode> = {
    tv: <TvPage accent={accent} onApps={() => setPage("apps")} />,
    remote: <RemotePage lit={lit} onDirection={pressDirection} />,
    apps: <AppsPage />,
    settings: <SettingsPage />,
  };

  return (
    <div className={styles.panel}>
      <Header onSettings={() => setPage("settings")} />
      {state.paired && !blocked ? <Tabs page={page} onChange={setPage} /> : <div />}
      <main className={styles.scroll}>
        {!state.paired ? <Onboarding /> : blocked ? <Standby accent={accent} onSettings={() => setPage("settings")} /> : content[page]}
      </main>
      {palette && <CommandPalette onClose={() => setPalette(false)} onNavigate={setPage} />}
      <Toast />
    </div>
  );
}
