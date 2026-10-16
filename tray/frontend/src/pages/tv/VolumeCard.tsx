import { type CSSProperties, useState } from "react";

import { api } from "../../api/client";
import { attempt, notify } from "../../feedback/toast";
import { press } from "../../television/commands";
import { Key } from "../../television/keys";
import { useOn, useTelevision } from "../../television/television";
import { PanelButton } from "../../ui/Button";
import { Card, CardHead, Spacer } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { Note } from "../../ui/Text";
import styles from "./VolumeCard.module.css";

/** Where the slider rests while the TV doesn't report a volume. */
const resting = 50;

export function VolumeCard() {
  const audio = useTelevision()?.audio;
  const on = useOn();
  const [dragged, setDragged] = useState<number | null>(null);
  const [sent, setSent] = useState<number | null>(null);

  // The slider holds the level it sent until the TV reports it, so it doesn't jump back while the keys go out.
  if (sent !== null && audio?.volume === sent) {
    setSent(null);
  }

  const level = dragged ?? sent ?? audio?.volume ?? resting;

  const release = () => {
    if (dragged === null) {
      return;
    }

    setDragged(null);

    // Without audio-device the TV can't tell its level, so the slider springs back and points to the buttons.
    if (!audio) {
      notify("This TV doesn't report its volume. Use the buttons beside the slider.", "error");

      return;
    }

    setSent(dragged);
    void attempt(() => api.setVolume(dragged), "The TV didn't change the volume").then((changed) => changed || setSent(null));
  };

  return (
    <Card label="TV audio">
      <CardHead>
        <Icon name="speaker_2" size={16} filled />
        TV audio
        {audio && <Note>{audio.muted ? "Muted" : audio.volume}</Note>}
        <Spacer />
        <PanelButton
          size="small"
          label={audio?.muted ? "Unmute" : "Mute"}
          shortcut="M"
          onPress={() => press(Key.VolumeMute)}
          selected={audio?.muted}
          disabled={!on}
        >
          <Icon name="speaker_mute" size={16} />
        </PanelButton>
        <PanelButton size="small" label="Lower volume" shortcut="-" onPress={() => press(Key.VolumeDown)} repeat disabled={!on}>
          <Icon name="subtract" size={16} />
        </PanelButton>
        <PanelButton size="small" label="Raise volume" shortcut="+" onPress={() => press(Key.VolumeUp)} repeat disabled={!on}>
          <Icon name="add" size={16} />
        </PanelButton>
      </CardHead>
      <input
        type="range"
        className={styles.slider}
        aria-label="Volume level"
        min={0}
        max={100}
        value={level}
        disabled={!on}
        style={
          {
            "--level": `${level}%`,
          } as CSSProperties
        }
        onChange={(event) => setDragged(Number(event.target.value))}
        onPointerUp={release}
        onKeyUp={release}
      />
    </Card>
  );
}
