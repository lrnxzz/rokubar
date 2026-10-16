import { expect, test } from "vitest";

import { clock } from "./playback";

test("clock writes minutes and seconds, adding hours past the first", () => {
  expect(clock(65_000)).toBe("1:05");
  expect(clock(3_725_000)).toBe("1:02:05");
});

test("clock never shows a negative time", () => {
  expect(clock(-500)).toBe("0:00");
});
