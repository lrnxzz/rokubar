import type { Television } from "../../api/types.gen";
import { appName } from "../../apps/apps";
import { isOn } from "../../television/television";

export type HeroStatus = {
  live: boolean;
  label: string;
  source: string;
  line: string;
};

export function inputLabel(appId: string): string {
  if (appId === "tvinput.dtv") {
    return "Antenna";
  }

  const hdmi = appId.match(/^tvinput\.hdmi(\d+)$/);

  return hdmi ? `HDMI ${hdmi[1]}` : "Input";
}

/** What the lines under the TV say about it. */
export function heroStatus(state: Television): HeroStatus {
  if (state.connecting) {
    return {
      live: false,
      label: "Connecting to the TV",
      source: "",
      line: "Looking for your Roku on the network.",
    };
  }

  if (!state.reachable) {
    return {
      live: false,
      label: "Not responding",
      source: "",
      line: "The TV may be off or in deep standby. The power button wakes it.",
    };
  }

  if (!isOn(state)) {
    return {
      live: false,
      label: "Standby",
      source: "",
      line: "The power button turns it on.",
    };
  }

  if (!state.app.id || state.app.type === "home") {
    return {
      live: true,
      label: "Home screen",
      source: "Home",
      line: "Pick an app below or from Apps.",
    };
  }

  if (state.app.type === "tvin") {
    return {
      live: true,
      label: "Reported by the TV",
      source: inputLabel(state.app.id),
      line: `Watching ${appName(state.app)}.`,
    };
  }

  return {
    live: true,
    label: "Reported by the TV",
    source: "App",
    line: `${appName(state.app)} is open on the TV.`,
  };
}
