import type { ReactNode } from "react";

import type { App } from "../../api/types.gen";
import { AppMark } from "../../apps/AppMark";
import { appName } from "../../apps/apps";
import { classes } from "../../lib/classes";
import { type Direction, Key } from "../../television/keys";
import { Icon } from "../../ui/Icon";
import { useHold } from "../../ui/useHold";
import styles from "./RokuRemote.module.css";

// The cross of the d-pad: arms 104 wide reaching 104 from the center, outer corners rounded 24, inner 18.
const cross =
  "M -28 -104 H 28 A 24 24 0 0 1 52 -80 V -70 A 18 18 0 0 0 70 -52 H 80 A 24 24 0 0 1 104 -28 V 28 A 24 24 0 0 1 80 52 H 70 " +
  "A 18 18 0 0 0 52 70 V 80 A 24 24 0 0 1 28 104 H -28 A 24 24 0 0 1 -52 80 V 70 A 18 18 0 0 0 -70 52 H -80 A 24 24 0 0 1 -104 28 " +
  "V -28 A 24 24 0 0 1 -80 -52 H -70 A 18 18 0 0 0 -52 -70 V -80 A 24 24 0 0 1 -28 -104 Z";

type KeyButtonProps = {
  label: string;
  shortcut?: string;
  className?: string;
  repeat?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children?: ReactNode;
};

function KeyButton({ label, shortcut, className, repeat = false, pressed, disabled, onPress, children }: KeyButtonProps) {
  const hold = useHold(onPress, repeat);

  return (
    <button
      type="button"
      className={classes(styles.key, className)}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={shortcut ? `${label} (${shortcut})` : label}
      data-pressed={pressed}
      disabled={disabled}
      {...hold}
    >
      {children}
    </button>
  );
}

const shortcutSlots = [styles.shortcut0, styles.shortcut1, styles.shortcut2, styles.shortcut3];

type RokuRemoteProps = {
  /** The d-pad key lit for a moment after an arrow on the keyboard. */
  lit: Direction | null;
  shortcuts: App[];
  waking: boolean;
  onPress: (key: Key) => void;
  onDirection: (direction: Direction) => void;
  onPower: () => void;
  onLaunch: (app: App) => void;
};

/** Roku's remote, laid out in the units of Roku's own remote artwork (323 wide) and drawn at half size. */
export function RokuRemote({ lit, shortcuts, waking, onPress, onDirection, onPower, onLaunch }: RokuRemoteProps) {
  return (
    <div className={styles.stage}>
      {/* biome-ignore lint/a11y/useSemanticElements: a fieldset brings a border and padding the drawn remote doesn't have. */}
      <div className={styles.remote} role="group" aria-label="Roku remote">
        <div className={styles.tag} aria-hidden="true">
          Bar
        </div>
        <div className={styles.body} />

        <KeyButton className={styles.volumeUp} label="Volume up" shortcut="+" repeat onPress={() => onPress(Key.VolumeUp)} />
        <KeyButton className={styles.volumeDown} label="Volume down" shortcut="-" repeat onPress={() => onPress(Key.VolumeDown)} />
        <KeyButton className={styles.mute} label="Mute" shortcut="M" onPress={() => onPress(Key.VolumeMute)} />

        <KeyButton className={styles.power} label="Power" onPress={onPower} disabled={waking}>
          <Icon name="power" />
        </KeyButton>
        <span className={styles.micHole} aria-hidden="true" />

        <KeyButton className={styles.back} label="Back" shortcut="Backspace" onPress={() => onPress(Key.Back)}>
          <Icon name="arrow_left" size={16} />
        </KeyButton>
        <KeyButton className={styles.home} label="Home" shortcut="H" onPress={() => onPress(Key.Home)}>
          <Icon name="home" size={16} />
        </KeyButton>

        <div className={styles.well} aria-hidden="true" />
        <svg className={styles.cross} viewBox="-112 -112 224 224" aria-hidden="true">
          <defs>
            <linearGradient id="rk-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7a3df0" />
              <stop offset="1" stopColor="#5a21c6" />
            </linearGradient>
            <radialGradient id="rk-sheen" cx="0.5" cy="0.18" r="0.75">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.24" />
              <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={cross} fill="url(#rk-purple)" stroke="#3a128c" strokeWidth="1.5" />
          <path d={cross} fill="url(#rk-sheen)" />
        </svg>

        <KeyButton className={classes(styles.arm, styles.up)} label="Up" repeat pressed={lit === "up"} onPress={() => onDirection("up")}>
          <Icon name="chevron_up" filled />
        </KeyButton>
        <KeyButton
          className={classes(styles.arm, styles.down)}
          label="Down"
          repeat
          pressed={lit === "down"}
          onPress={() => onDirection("down")}
        >
          <Icon name="chevron_down" filled />
        </KeyButton>
        <KeyButton
          className={classes(styles.arm, styles.left)}
          label="Left"
          repeat
          pressed={lit === "left"}
          onPress={() => onDirection("left")}
        >
          <Icon name="chevron_left" filled />
        </KeyButton>
        <KeyButton
          className={classes(styles.arm, styles.right)}
          label="Right"
          repeat
          pressed={lit === "right"}
          onPress={() => onDirection("right")}
        >
          <Icon name="chevron_right" filled />
        </KeyButton>
        <KeyButton className={styles.ok} label="OK" shortcut="Enter" pressed={lit === "ok"} onPress={() => onDirection("ok")}>
          OK
        </KeyButton>

        <KeyButton className={styles.replay} label="Instant replay" shortcut="R" onPress={() => onPress(Key.InstantReplay)}>
          <Icon name="arrow_counterclockwise" size={16} />
        </KeyButton>
        <KeyButton className={styles.search} label="Search" onPress={() => onPress(Key.Search)}>
          <Icon name="mic" size={16} filled />
        </KeyButton>
        <KeyButton className={styles.star} label="Options" shortcut="O" onPress={() => onPress(Key.Info)}>
          <span className={styles.asterisk}>✱</span>
        </KeyButton>

        <KeyButton className={styles.rewind} label="Rewind" shortcut="," repeat onPress={() => onPress(Key.Rev)}>
          <Icon name="rewind" size={16} filled />
        </KeyButton>
        <KeyButton className={styles.play} label="Play or pause" shortcut="Space" onPress={() => onPress(Key.Play)}>
          <span className={styles.pair}>
            <Icon name="play" size={16} filled />
            <Icon name="pause" size={16} filled />
          </span>
        </KeyButton>
        <KeyButton className={styles.forward} label="Fast forward" shortcut="." repeat onPress={() => onPress(Key.Fwd)}>
          <Icon name="fast_forward" size={16} filled />
        </KeyButton>

        {shortcuts.slice(0, 4).map((app, index) => (
          <KeyButton
            key={app.id}
            className={classes(styles.shortcut, shortcutSlots[index])}
            label={`Open ${appName(app)}`}
            onPress={() => onLaunch(app)}
          >
            <AppMark app={app} size={44} radius={9} />
          </KeyButton>
        ))}
      </div>
    </div>
  );
}
