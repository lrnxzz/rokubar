import { useState } from "react";

import type { App } from "../../api/types.gen";
import { appName, openApp, reloadApps, useApps } from "../../apps/apps";
import { toggleFavorite, useFavorites } from "../../apps/favorites";
import { notify } from "../../feedback/toast";
import { useTelevision } from "../../television/television";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { SearchField } from "../../ui/SearchField";
import { Note, SectionTitle } from "../../ui/Text";
import styles from "./AppsPage.module.css";
import { AppTile } from "./AppTile";

async function open(app: App) {
  if (await openApp(app)) {
    notify(`Opening ${appName(app)} on the TV`);
  }
}

export function AppsPage() {
  const state = useTelevision();
  const { apps, launchable, failed } = useApps();
  const favorites = useFavorites();
  const [query, setQuery] = useState("");

  const wanted = query.trim().toLowerCase();
  const shown = launchable.filter((app) => app.name.toLowerCase().includes(wanted));

  return (
    <>
      <SectionTitle>Apps</SectionTitle>

      <SearchField
        label="Search apps"
        iconSize={16}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={apps ? `Search ${launchable.length} apps` : "Search apps"}
        trailing={
          query && (
            <Button variant="ghost" className={styles.clear} aria-label="Clear search" onClick={() => setQuery("")}>
              <Icon name="dismiss_circle" size={16} filled />
            </Button>
          )
        }
      />

      {failed ? (
        <Card>
          <span>The app list didn't load. The TV may be off or refusing control.</span>
          <Button onClick={() => void reloadApps()}>
            <Icon name="arrow_sync" size={16} />
            Try again
          </Button>
        </Card>
      ) : !state?.reachable && apps === null ? (
        <Note>Apps appear once the TV answers.</Note>
      ) : apps === null ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from(
            {
              length: 9,
            },
            (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the placeholders have nothing else to tell them apart.
              <div key={index} className={styles.skeleton} />
            ),
          )}
        </div>
      ) : shown.length === 0 ? (
        <Note>No app matches "{query.trim()}".</Note>
      ) : (
        <div className={styles.grid}>
          {shown.map((app) => (
            <AppTile
              key={app.id}
              app={app}
              active={state?.app.id === app.id}
              favorite={favorites.includes(app.id)}
              onToggle={() => toggleFavorite(app.id)}
              onOpen={() => void open(app)}
            />
          ))}
        </div>
      )}

      <Note>Click an app to open it on the TV. The star adds it to your favorites.</Note>
    </>
  );
}
