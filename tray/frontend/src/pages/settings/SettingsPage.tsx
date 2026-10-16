import { Application } from "@wailsio/runtime";
import { useState } from "react";

import { api } from "../../api/client";
import { attempt } from "../../feedback/toast";
import { DeviceList } from "../../pairing/DeviceList";
import { useTelevision } from "../../television/television";
import { Button } from "../../ui/Button";
import { Card, CardHead } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { SectionTitle } from "../../ui/Text";
import { LimitedBanner } from "../tv/LimitedBanner";
import styles from "./SettingsPage.module.css";

const shortcuts: [string, string[]][] = [
  ["Move", ["←", "↑", "↓", "→"]],
  ["OK", ["Enter"]],
  ["Back", ["Backspace"]],
  ["Home", ["H"]],
  ["Play or pause", ["Space"]],
  ["Rewind, fast forward", [",", "."]],
  ["Volume", ["-", "+"]],
  ["Mute", ["M"]],
  ["Options", ["O"]],
  ["Open an app", ["Ctrl", "K"]],
  ["Pages", ["Ctrl", "1–4"]],
  ["Hide Rokubar", ["Esc"]],
];

export function SettingsPage() {
  const state = useTelevision();
  const [confirming, setConfirming] = useState(false);

  if (!state) {
    return null;
  }

  // Forgetting asks twice, since pairing again means searching the network.
  const forget = () => {
    if (confirming) {
      void attempt(api.forget, "Rokubar couldn't forget the TV");
    } else {
      setConfirming(true);
    }
  };

  return (
    <>
      <SectionTitle>Settings</SectionTitle>

      {state.limited && <LimitedBanner />}

      <Card label="TVs">
        <CardHead>
          <Icon name="tv" size={16} />
          TVs on this network
        </CardHead>
        <DeviceList />
        <Button tone="danger" onClick={forget} onBlur={() => setConfirming(false)}>
          {confirming ? "Click again to forget this TV" : "Forget this TV"}
        </Button>
      </Card>

      <Card label="Keyboard shortcuts">
        <CardHead>
          <Icon name="keyboard" size={16} />
          Keyboard shortcuts
        </CardHead>
        <dl className={styles.shortcuts}>
          {shortcuts.map(([action, keys]) => (
            <div key={action} className={styles.shortcut}>
              <dt>{action}</dt>
              <dd>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Button onClick={() => void Application.Quit()}>
        <Icon name="sign_out" size={16} />
        Quit Rokubar
      </Button>
    </>
  );
}
