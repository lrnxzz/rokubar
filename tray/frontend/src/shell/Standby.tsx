import { Hero } from "../hero/Hero";
import { usePower } from "../television/commands";
import { useTelevision } from "../television/television";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import styles from "./Standby.module.css";

/** Stands in for every page but settings while the TV is off, since nothing else works until it's on. */
export function Standby({ accent, onSettings }: { accent: string; onSettings: () => void }) {
  const state = useTelevision();
  const power = usePower();

  if (!state) {
    return null;
  }

  const name = state.name || "your TV";
  const title = state.connecting ? `Connecting to ${name}` : state.reachable ? "Your TV is off" : "Your TV isn't answering";
  const detail = state.connecting
    ? "Rokubar is checking on it."
    : state.reachable
      ? "Turn it on to use the remote, your apps and the keyboard."
      : "It may be in deep standby or off this network. Rokubar can wake it up.";

  return (
    <div className={styles.standby}>
      <Hero accent={accent} lit={false} state={state} controls={false} />
      <div className={styles.text}>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {!state.connecting && (
        <Button className={styles.power} selected onClick={power.toggle} disabled={power.waking}>
          <Icon name={power.waking ? "arrow_sync" : "power"} spinning={power.waking} />
          {power.waking ? "Turning on" : "Turn on the TV"}
        </Button>
      )}
      <button type="button" className={styles.other} onClick={onSettings}>
        Choose another TV
      </button>
    </div>
  );
}
