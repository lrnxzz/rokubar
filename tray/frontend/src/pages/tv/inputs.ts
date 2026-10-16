import type { App } from "../../api/types.gen";
import type { Glyph } from "../../ui/Icon";

export type Input = {
  title: string;
  detail: string;
  glyph: Glyph;
};

// ECP reports no HDMI-CEC devices, only each input's name. Roku TVs let the owner rename an input
// (Settings › TV inputs › Rename), so a renamed input says what is plugged into it.
const devices: [RegExp, Glyph, string][] = [
  [/game|jogo|console|playstation|\bps[2-5]\b|xbox|nintendo|switch|steam/i, "games", "Game console"],
  [/blu-?ray|dvd/i, "cd", "Disc player"],
  [/cable|cabo|satellite|sat[eé]lite|decoder|decodificador|set-?top|sky\b/i, "router", "TV box"],
  [/computer|computador|\bpc\b|laptop|notebook|\bmac\b/i, "desktop", "Computer"],
  [/receiver|receptor|soundbar|home theater|[aá]udio/i, "speaker_box", "Sound system"],
  [/chromecast|fire ?tv|apple ?tv|google ?tv|android ?tv|stick|streaming/i, "video", "Streaming device"],
];

/** An input as the panel lists it: its name, what kind of device its name suggests, its port and an icon. */
export function describeInput(input: App): Input {
  const port = input.id.match(/^tvinput\.(hdmi|cvbs|av)(\d*)$/);
  const portName = input.id === "tvinput.dtv" ? "Antenna" : port ? (port[1] === "hdmi" ? `HDMI ${port[2]}` : "AV") : "Input";
  const arc = /\(ARC\)/i.test(input.name);
  const title =
    input.name
      .replace(/\(ARC\)/i, "")
      .replace(/\s+/g, " ")
      .trim() || portName;
  const device = devices.find(([pattern]) => pattern.test(title));
  const kind = device && device[2].toLowerCase() !== title.toLowerCase() ? device[2] : null;
  const renamed = title.toLowerCase() !== portName.toLowerCase();

  return {
    title,
    detail: [kind, renamed ? portName : "Input", arc ? "ARC" : null].filter(Boolean).join(" · "),
    glyph: device?.[1] ?? (input.id === "tvinput.dtv" ? "live" : port?.[1] === "hdmi" ? "tv_arrow_right" : "connector"),
  };
}
