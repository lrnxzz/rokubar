import { Window } from "@wailsio/runtime";
import { useEffect, useEffectEvent } from "react";

import { press } from "../television/commands";
import { type Direction, Key } from "../television/keys";
import { type Page, pages } from "./pages";

const arrowDirections: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "ok",
};

const shortcutKeys: Record<string, Key> = {
  Backspace: Key.Back,
  " ": Key.Play,
  h: Key.Home,
  r: Key.InstantReplay,
  o: Key.Info,
  "*": Key.Info,
  ",": Key.Rev,
  ".": Key.Fwd,
  "+": Key.VolumeUp,
  "=": Key.VolumeUp,
  "-": Key.VolumeDown,
  m: Key.VolumeMute,
};

function typing(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

type Shortcuts = {
  /** The keys that reach the TV, and the ones that need it, work only while it's on. */
  enabled: boolean;
  palette: boolean;
  onPalette: (open: boolean) => void;
  onPage: (page: Page) => void;
  onDirection: (direction: Direction) => void;
};

export function useShortcuts({ enabled, palette, onPalette, onPage, onDirection }: Shortcuts) {
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();

      if (palette) {
        onPalette(false);
      } else {
        void Window.Hide();
      }

      return;
    }

    if (!enabled) {
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      onPalette(!palette);

      return;
    }

    const page = event.ctrlKey ? pages[Number(event.key) - 1] : undefined;
    if (page) {
      event.preventDefault();
      onPage(page.id);

      return;
    }

    if (palette || typing(event.target) || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const direction = arrowDirections[event.key];
    const key = shortcutKeys[event.key.toLowerCase()] ?? shortcutKeys[event.key];

    if (direction) {
      event.preventDefault();
      onDirection(direction);
    } else if (key) {
      event.preventDefault();
      press(key);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
