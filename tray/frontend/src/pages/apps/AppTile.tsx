import type { CSSProperties } from "react";

import { iconUrl } from "../../api/client";
import type { App } from "../../api/types.gen";
import { AppMark } from "../../apps/AppMark";
import { appName } from "../../apps/apps";
import { useBrand } from "../../apps/brand";
import { Icon } from "../../ui/Icon";
import styles from "./AppTile.module.css";

type AppTileProps = {
  app: App;
  active: boolean;
  favorite: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

/** An app in its brand color, with a star to keep it in the favorites. */
export function AppTile({ app, active, favorite, onToggle, onOpen }: AppTileProps) {
  const brand = useBrand(iconUrl(app.id));
  const name = appName(app);

  return (
    <div
      className={styles.tile}
      data-active={active}
      style={
        {
          "--brand": brand,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={styles.star}
        aria-pressed={favorite}
        aria-label={`Favorite ${name}`}
        title={`Favorite ${name}`}
        onClick={onToggle}
      >
        <Icon name="star" size={16} filled={favorite} />
      </button>
      <button type="button" className={styles.open} title={`Open ${name} on the TV`} onClick={onOpen}>
        <AppMark app={app} size={48} className={styles.mark} />
        <span className={styles.title}>{name}</span>
      </button>
      <span className={styles.active}>{active ? "ACTIVE" : ""}</span>
    </div>
  );
}
