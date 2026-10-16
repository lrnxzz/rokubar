import { expect, test } from "vitest";

import type { Television } from "../../api/types.gen";
import { heroStatus, inputLabel } from "./heroStatus";

const on: Television = {
  paired: true,
  connecting: false,
  reachable: true,
  serial: "X04000AJS65H",
  host: "192.168.1.2:8060",
  name: "Lorenzo TV Roku 43",
  model: "AOC Roku TV",
  isTv: true,
  power: "PowerOn",
  limited: false,
  hardware: {
    vendor: "AOC",
    modelNumber: "43S5155/78G",
    screenSize: 43,
    software: "15.3.4",
    network: "wifi",
    networkName: "Home",
    language: "pt",
  },
  app: {
    id: "12",
    name: "Netflix ",
    type: "appl",
  },
  player: {
    state: "play",
    position: 0,
    duration: 0,
    live: false,
  },
};

test("an open app is reported by name, without the spaces the TV leaves around it", () => {
  expect(heroStatus(on)).toEqual({
    live: true,
    label: "Reported by the TV",
    source: "App",
    line: "Netflix is open on the TV.",
  });
});

test("a TV in standby points to the power button", () => {
  expect(
    heroStatus({
      ...on,
      power: "Ready",
    }).label,
  ).toBe("Standby");
});

test("a TV that doesn't answer reads as not responding", () => {
  expect(
    heroStatus({
      ...on,
      reachable: false,
    }).label,
  ).toBe("Not responding");
});

test("inputLabel names HDMI ports by number and the tuner as the antenna", () => {
  expect(inputLabel("tvinput.hdmi3")).toBe("HDMI 3");
  expect(inputLabel("tvinput.dtv")).toBe("Antenna");
  expect(inputLabel("tvinput.cvbs")).toBe("Input");
});
