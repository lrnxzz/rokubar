import { Window } from "@wailsio/runtime";

import { usePower } from "../television/commands";
import { useTelevision } from "../television/television";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { RokubarMark } from "../ui/RokubarMark";
import styles from "./Header.module.css";
import { Menu } from "./Menu";

export function Header({ onSettings }: { onSettings: () => void }) {
  const state = useTelevision();
  const power = usePower();
  const paired = Boolean(state?.paired);

  return (
    <header className={styles.header}>
      <RokubarMark />
      <div className={styles.text}>
        <span className={styles.name}>{state?.paired ? state.name || "Your Roku" : "Rokubar"}</span>
        <span className={styles.detail}>{state?.paired ? state.model || (state.isTv ? "Roku TV" : "Roku") : "Not connected"}</span>
      </div>

      {paired && (
        <button
          type="button"
          className={styles.power}
          data-on={power.on}
          onClick={power.toggle}
          disabled={power.waking}
          aria-label={power.on ? "Turn the TV off" : "Turn the TV on"}
          title={power.on ? "Turn the TV off" : "Turn the TV on"}
        >
          <Icon name={power.waking ? "arrow_sync" : "power"} spinning={power.waking} />
        </button>
      )}

      <Menu paired={paired} onSettings={onSettings} />

      <Button variant="ghost" aria-label="Close Rokubar" title="Close (Esc)" onClick={() => void Window.Hide()}>
        <Icon name="dismiss" />
      </Button>
    </header>
  );
}
