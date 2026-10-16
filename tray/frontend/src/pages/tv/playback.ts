import { useEffect, useState } from "react";

import type { Player } from "../../api/types.gen";

/** A position as a clock: 4:05, or 1:02:09 past an hour. */
export function clock(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/** The position moving forward between polls while the player plays, so the bar doesn't jump once a second. */
export function useLivePosition(player: Player): number {
  const playing = player.state === "play";
  const [tick, setTick] = useState({
    position: player.position,
    elapsed: 0,
  });

  useEffect(() => {
    if (!playing) {
      return;
    }

    const start = performance.now();
    const timer = window.setInterval(() => {
      setTick({
        position: player.position,
        elapsed: Math.min(performance.now() - start, 1500),
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [playing, player.position]);

  // Time counted for an earlier position doesn't apply once the TV reports a new one.
  const elapsed = playing && tick.position === player.position ? tick.elapsed : 0;

  return Math.min(player.position + elapsed, player.duration || Number.POSITIVE_INFINITY);
}
