import { PanelButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import type { CameraCommand } from "./camera";
import styles from "./TvHero.module.css";

type CameraPadProps = {
  /** Only a TV Rokubar has a model of comes apart. */
  apart: boolean | null;
  onApart: () => void;
  onCamera: (command: CameraCommand) => void;
};

export function CameraPad({ apart, onApart, onCamera }: CameraPadProps) {
  return (
    <div className={styles.pad} role="toolbar" aria-label="Camera">
      <div className={styles.group}>
        <PanelButton size="small" label="Turn left" repeat onPress={() => onCamera({ kind: "turn", angle: -0.2 })}>
          <Icon name="arrow_counterclockwise" />
        </PanelButton>
        <PanelButton size="small" label="Move left" repeat onPress={() => onCamera({ kind: "move", right: -1, up: 0 })}>
          <Icon name="arrow_left" />
        </PanelButton>
        <PanelButton size="small" label="Move up" repeat onPress={() => onCamera({ kind: "move", right: 0, up: 1 })}>
          <Icon name="arrow_up" />
        </PanelButton>
        <PanelButton size="small" label="Move down" repeat onPress={() => onCamera({ kind: "move", right: 0, up: -1 })}>
          <Icon name="arrow_down" />
        </PanelButton>
        <PanelButton size="small" label="Move right" repeat onPress={() => onCamera({ kind: "move", right: 1, up: 0 })}>
          <Icon name="arrow_right" />
        </PanelButton>
        <PanelButton size="small" label="Turn right" repeat onPress={() => onCamera({ kind: "turn", angle: 0.2 })}>
          <Icon name="arrow_clockwise" />
        </PanelButton>
      </div>
      <div className={styles.group}>
        <PanelButton size="small" label="Zoom out" repeat onPress={() => onCamera({ kind: "zoom", factor: 1.25 })}>
          <Icon name="zoom_out" />
        </PanelButton>
        <PanelButton size="small" label="Zoom in" repeat onPress={() => onCamera({ kind: "zoom", factor: 0.8 })}>
          <Icon name="zoom_in" />
        </PanelButton>
      </div>
      <div className={styles.group}>
        {apart !== null && (
          <PanelButton size="small" label={apart ? "Put the TV back together" : "Take the TV apart"} selected={apart} onPress={onApart}>
            <Icon name="layer" />
          </PanelButton>
        )}
        <PanelButton size="small" label="Reset the view" onPress={() => onCamera({ kind: "reset" })}>
          <Icon name="arrow_reset" />
        </PanelButton>
      </div>
    </div>
  );
}
