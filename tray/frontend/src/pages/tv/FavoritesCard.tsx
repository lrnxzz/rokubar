import type { App } from "../../api/types.gen";
import { AppMark } from "../../apps/AppMark";
import { appName, openApp } from "../../apps/apps";
import { useTelevision } from "../../television/television";
import { Card, CardHead, CardLink, Spacer } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import styles from "./FavoritesCard.module.css";

type FavoritesCardProps = {
  apps: App[];
  favorites: string[];
  onSeeAll: () => void;
};

/** The favorite apps, or the first four the TV lists until there are favorites. */
export function FavoritesCard({ apps, favorites, onSeeAll }: FavoritesCardProps) {
  const reachable = Boolean(useTelevision()?.reachable);
  const pinned = favorites.length > 0 ? apps.filter((app) => favorites.includes(app.id)) : apps.slice(0, 4);

  if (pinned.length === 0) {
    return null;
  }

  return (
    <Card label="Favorites">
      <CardHead>
        <Icon name="star" size={16} />
        Favorites
        <Spacer />
        <CardLink onClick={onSeeAll}>See all</CardLink>
      </CardHead>
      <div className={styles.favorites}>
        {pinned.slice(0, 8).map((app) => (
          <button
            key={app.id}
            type="button"
            className={styles.favorite}
            title={`Open ${appName(app)} on the TV`}
            disabled={!reachable}
            onClick={() => void openApp(app)}
          >
            <AppMark app={app} size={40} className={styles.mark} />
            <span>{appName(app)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
