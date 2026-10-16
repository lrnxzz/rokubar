import type { Player } from "../../api/types.gen";
import { press } from "../../television/commands";
import { Key } from "../../television/keys";
import { ButtonRow, PanelButton } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { Note } from "../../ui/Text";
import styles from "./PlaybackCard.module.css";
import { clock, useLivePosition } from "./playback";

export function PlaybackCard({ player }: { player: Player }) {
  const position = useLivePosition(player);
  const timed = player.duration > 0 && !player.live;
  const paused = player.state === "pause";

  return (
    <Card label="Playback">
      {timed ? (
        <div className={styles.progress}>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={Math.round(player.duration / 1000)}
            aria-valuenow={Math.round(position / 1000)}
          >
            <div
              className={styles.fill}
              style={{
                transform: `scaleX(${position / player.duration})`,
              }}
            />
          </div>
          <div className={styles.times}>
            <span>{clock(position)}</span>
            <span>-{clock(player.duration - position)}</span>
          </div>
        </div>
      ) : (
        <Note>{player.live ? "Live" : paused ? "Paused" : "Playing"}</Note>
      )}
      <ButtonRow>
        <PanelButton label="Rewind" shortcut="," onPress={() => press(Key.Rev)} repeat>
          <Icon name="rewind" size={16} filled />
        </PanelButton>
        <PanelButton label={paused ? "Play" : "Pause"} shortcut="Space" onPress={() => press(Key.Play)}>
          <Icon name={paused ? "play" : "pause"} size={16} filled />
        </PanelButton>
        <PanelButton label="Fast forward" shortcut="." onPress={() => press(Key.Fwd)} repeat>
          <Icon name="fast_forward" size={16} filled />
        </PanelButton>
      </ButtonRow>
    </Card>
  );
}
