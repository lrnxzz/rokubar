import { type MouseEvent, type PointerEvent, type RefObject, useEffect, useRef } from "react";

const repeatDelay = 380;
const repeatInterval = 110;

function stop(timer: RefObject<number | undefined>) {
  window.clearTimeout(timer.current);
  window.clearInterval(timer.current);
}

/** Acts once on pointer down and, when repeat is on, keeps acting while the pointer stays down. */
export function useHold(action: () => void, repeat: boolean) {
  const timer = useRef<number>(undefined);

  useEffect(() => () => stop(timer), []);

  return {
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      action();

      if (repeat) {
        timer.current = window.setTimeout(() => {
          timer.current = window.setInterval(action, repeatInterval);
        }, repeatDelay);
      }
    },
    onPointerUp: () => stop(timer),
    onPointerLeave: () => stop(timer),
    onPointerCancel: () => stop(timer),
    // A click with no pointer behind it comes from the keyboard.
    onClick: (event: MouseEvent) => {
      if (event.detail === 0) {
        action();
      }
    },
  };
}
