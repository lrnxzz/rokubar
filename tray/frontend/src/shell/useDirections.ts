import { useRef, useState } from "react";

import { press } from "../television/commands";
import { type Direction, directionKey } from "../television/keys";

/** Presses a d-pad key and lights the remote's matching key for a moment, so an arrow typed on the keyboard shows. */
export function useDirections() {
  const [lit, setLit] = useState<Direction | null>(null);
  const timer = useRef<number>(undefined);

  const pressDirection = (direction: Direction) => {
    press(directionKey[direction]);
    setLit(direction);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLit(null), 160);
  };

  return [lit, pressDirection] as const;
}
