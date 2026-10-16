import { Application } from "@wailsio/runtime";
import { useEffect, useRef, useState } from "react";

import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./Header.module.css";

export function Menu({ paired, onSettings }: { paired: boolean; onSettings: () => void }) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", close);

    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={menu}>
      <Button variant="ghost" aria-label="More" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((shown) => !shown)}>
        <Icon name="more_horizontal" />
      </Button>
      {open && (
        <div className={styles.menu} role="menu">
          {paired && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onSettings();
                }}
              >
                Settings and TVs
              </button>
              <hr />
            </>
          )}
          <button type="button" role="menuitem" onClick={() => void Application.Quit()}>
            Quit Rokubar
          </button>
        </div>
      )}
    </div>
  );
}
