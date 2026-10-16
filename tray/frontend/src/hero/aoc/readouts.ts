import type { App, Television } from "../../api/types.gen";
import { appName } from "../../apps/apps";
import { isOn } from "../../television/television";

export type Readout = {
  name: string;
  detail: string;
};

/** What each part of the AOC is, with what the TV reports about it right now. */
export function readAocPart(part: string, state: Television, inputs: App[]): Readout | null {
  const on = isOn(state);
  const home = !state.app.id || state.app.type === "home";
  const showing = !on ? "Off" : home ? "Home screen" : appName(state.app);
  const { hardware, audio } = state;

  const port = (inputId: string, name: string): Readout => {
    const input = inputs.find((candidate) => candidate.id === inputId);
    const title = input?.name.replace(/\s+/g, " ").trim() ?? name;

    return {
      name,
      detail: state.app.id === inputId ? `${title} · on screen` : title,
    };
  };

  const readouts: Record<string, () => Readout> = {
    bezel: () => ({
      name: "Front frame",
      detail: "2.5 mm at the sides, a 14 mm chin with the AOC logo",
    }),
    ir: () => ({
      name: "IR receiver and power key",
      detail: on ? "Listening for the remote" : "Standby light on",
    }),
    panel: () => ({
      name: "LCD panel",
      detail: `${hardware.screenSize || 43}" · 1920 × 1080 · ${showing}`,
    }),
    frame: () => ({
      name: "Middle frame",
      detail: "Holds the optical films against the panel",
    }),
    films: () => ({
      name: "Optical films",
      detail: "Two prism sheets that aim the light forward",
    }),
    diffuser: () => ({
      name: "Diffuser plate",
      detail: "Spreads the LEDs into even light",
    }),
    reflector: () => ({
      name: "Reflector sheet",
      detail: "Sends stray light back toward the screen",
    }),
    backlight: () => ({
      name: "Direct LED backlight",
      detail: `3 strips, 30 LEDs · ${on ? "lit" : "off"}`,
    }),
    chassis: () => ({
      name: "Back chassis",
      detail: "Steel plate carrying the boards and the VESA nuts",
    }),
    mainboard: () => ({
      name: "Main board",
      detail: `Roku OS ${hardware.software || "?"} · ${hardware.network === "ethernet" ? "Ethernet" : "Wi-Fi"}`,
    }),
    wifi: () => ({
      name: "Wi-Fi module",
      detail: hardware.network === "wifi" ? `Dual band · ${hardware.networkName}` : "Dual band · not in use",
    }),
    tuner: () => ({
      name: "Digital tuner",
      detail: state.app.id === "tvinput.dtv" ? "Tuned in · on screen" : "ISDB-T, behind the antenna input",
    }),
    lan: () => ({
      name: "Ethernet",
      detail: hardware.network === "ethernet" ? "Connected" : "Unused, the TV is on Wi-Fi",
    }),
    optical: () => ({
      name: "Optical audio out",
      detail: "SPDIF",
    }),
    headphone: () => ({
      name: "Headphone out",
      detail: "3.5 mm",
    }),
    av: () => ({
      name: "AV in",
      detail: "Composite video and stereo audio",
    }),
    usb: () => ({
      name: "USB 2.0",
      detail: "Media and power for a stick",
    }),
    rf: () => port("tvinput.dtv", "Antenna input"),
    hdmi1: () => port("tvinput.hdmi1", "HDMI 1 (ARC)"),
    hdmi2: () => port("tvinput.hdmi2", "HDMI 2"),
    hdmi3: () => port("tvinput.hdmi3", "HDMI 3"),
    power: () => ({
      name: "Power board",
      detail: `100–240 V · ${on ? "running" : "standby, under 1 W"}`,
    }),
    speakers: () => ({
      name: "Speakers",
      detail: `2 × 8 W, Dolby Audio${audio ? ` · ${audio.muted ? "muted" : `volume ${audio.volume}`}` : ""}`,
    }),
    cover: () => ({
      name: "Rear cover",
      detail: `VESA 200 × 200 · ${hardware.modelNumber}`,
    }),
    stand: () => ({
      name: "Stand",
      detail: "Two feet, four screws · 606 mm tall on them",
    }),
  };

  return readouts[part]?.() ?? null;
}
