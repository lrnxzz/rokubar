import { useState } from "react";

import { iconUrl } from "../api/client";
import type { App } from "../api/types.gen";
import { classes } from "../lib/classes";
import styles from "./AppMark.module.css";
import { appName } from "./apps";
import { useArtwork } from "./artwork";

type AppMarkProps = {
  app: App;
  size: number;
  radius?: number;
  className?: string;
};

/** The app's icon: its App Store artwork when there is one, then the TV's own poster, then its initial. */
export function AppMark({ app, size, radius = size * 0.23, className }: AppMarkProps) {
  const artwork = useArtwork(app, size);
  const [broken, setBroken] = useState<string[]>([]);
  const source = [artwork, iconUrl(app.id)].find((candidate) => candidate && !broken.includes(candidate));
  const shape = {
    width: size,
    height: size,
    borderRadius: radius,
  };

  if (!source) {
    return (
      <span
        className={classes(styles.fallback, className)}
        style={{
          ...shape,
          fontSize: size * 0.42,
        }}
        aria-hidden="true"
      >
        {appName(app).charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className={classes(styles.mark, className)}
      src={source}
      alt=""
      draggable={false}
      style={shape}
      onError={() => setBroken((failed) => [...failed, source])}
    />
  );
}
