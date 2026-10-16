import { lazy, Suspense } from "react";

import { glow } from "./glow";
import type { TvHeroProps } from "./TvHero";
import styles from "./TvHero.module.css";

const TvHero = lazy(() => import("./TvHero").then((module) => ({ default: module.TvHero })));

/** The 3D TV, loaded apart from the rest of the panel so three.js doesn't hold up its first paint. */
export function Hero(props: TvHeroProps) {
  return (
    <Suspense fallback={<Placeholder {...props} />}>
      <TvHero {...props} />
    </Suspense>
  );
}

/** The hero's frame and glow while the 3D loads, as tall as the TV and its camera pad so nothing moves when it arrives. */
function Placeholder({ lit, state, controls = true, children }: TvHeroProps) {
  return (
    <>
      <div className={styles.hero} style={glow(lit)}>
        <div className={styles.glow} />
        {children && <div className={styles.screen}>{children}</div>}
      </div>
      {state && controls && <div className={styles.padSpace} />}
    </>
  );
}
