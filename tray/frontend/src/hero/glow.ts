import type { CSSProperties } from "react";

/** The accent glow behind the TV, faint while the screen is off. */
export function glow(lit: boolean): CSSProperties {
  return {
    "--glow": lit ? 0.28 : 0.08,
  } as CSSProperties;
}
