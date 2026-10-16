import { classes } from "../lib/classes";
import styles from "./Icon.module.css";

// Fluent UI System Icons 1.1.344 (MIT, github.com/microsoft/fluentui-system-icons), copied at every size Microsoft draws:
// each size is a separate drawing fitted to that pixel grid, so an icon shown at 16 or 20 px uses the drawing made for it.
const files = import.meta.glob<string>("../assets/fluent/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const drawings = new Map(
  Object.entries(files).map(([path, svg]) => [
    path.slice(path.lastIndexOf("/") + 1, -".svg".length),
    svg.replace("<svg ", '<svg fill="currentColor" aria-hidden="true" '),
  ]),
);

const sizes = [16, 20, 24, 28, 32];

export type Glyph =
  | "add"
  | "apps"
  | "arrow_clockwise"
  | "arrow_counterclockwise"
  | "arrow_down"
  | "arrow_enter_left"
  | "arrow_left"
  | "arrow_reset"
  | "arrow_right"
  | "arrow_sync"
  | "arrow_up"
  | "backspace"
  | "cd"
  | "checkmark"
  | "chevron_down"
  | "chevron_left"
  | "chevron_right"
  | "chevron_up"
  | "connector"
  | "desktop"
  | "device_meeting_room_remote"
  | "dismiss"
  | "dismiss_circle"
  | "fast_forward"
  | "games"
  | "home"
  | "keyboard"
  | "layer"
  | "live"
  | "mic"
  | "more_horizontal"
  | "options"
  | "pause"
  | "play"
  | "power"
  | "rewind"
  | "router"
  | "search"
  | "settings"
  | "sign_out"
  | "speaker_2"
  | "speaker_box"
  | "speaker_mute"
  | "star"
  | "subtract"
  | "tv"
  | "tv_arrow_right"
  | "video"
  | "warning"
  | "zoom_in"
  | "zoom_out";

/** The drawing made for this size, or the nearest larger one scaled down to it. */
function drawing(name: Glyph, size: number, filled: boolean): string {
  const style = filled ? "filled" : "regular";
  const drawn = sizes.filter((candidate) => drawings.has(`${name}_${candidate}_${style}`));
  const best = drawn.find((candidate) => candidate >= size) ?? drawn.at(-1);
  const svg = drawings.get(`${name}_${best}_${style}`) ?? "";

  return best === size ? svg : svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
}

type IconProps = {
  name: Glyph;
  size?: number;
  filled?: boolean;
  spinning?: boolean;
};

export function Icon({ name, size = 20, filled = false, spinning = false }: IconProps) {
  return (
    <span
      className={classes(styles.icon, spinning && styles.spinning)}
      style={{
        width: size,
        height: size,
      }}
      data-icon
      // biome-ignore lint/security/noDangerouslySetInnerHtml: the drawings are Fluent's SVG files, bundled at build time.
      dangerouslySetInnerHTML={{
        __html: drawing(name, size, filled),
      }}
    />
  );
}
