import { expect, test } from "vitest";

import { describeInput } from "./inputs";

test("an input renamed after its device says what kind of device it is", () => {
  expect(
    describeInput({
      id: "tvinput.hdmi2",
      name: "PlayStation 5",
      type: "tvin",
    }),
  ).toEqual({
    title: "PlayStation 5",
    detail: "Game console · HDMI 2",
    glyph: "games",
  });
});

test("an input keeping its port name is just an input, with ARC noted", () => {
  expect(
    describeInput({
      id: "tvinput.hdmi1",
      name: "HDMI 1 (ARC)",
      type: "tvin",
    }),
  ).toEqual({
    title: "HDMI 1",
    detail: "Input · ARC",
    glyph: "tv_arrow_right",
  });
});

test("the antenna input is named after the antenna", () => {
  expect(
    describeInput({
      id: "tvinput.dtv",
      name: "Live TV",
      type: "tvin",
    }).detail,
  ).toBe("Antenna");
});
