import { expect, test } from "vitest";

import { hsl, hsv, readable, toCss } from "./color";

test("hsl turns pure hues back into their channels", () => {
  expect(hsl(0, 1, 0.5)).toEqual([255, 0, 0]);
  expect(hsl(1 / 3, 1, 0.5)).toEqual([0, 255, 0]);
  expect(hsl(2 / 3, 1, 0.5)).toEqual([0, 0, 255]);
});

test("hsv reads a pure red as hue 0, fully saturated and bright", () => {
  expect(hsv(255, 0, 0)).toEqual([0, 1, 1]);
});

test("readable lightens a dark brand color until it reads on the panel", () => {
  const [, , value] = hsv(...readable([20, 10, 60]));

  expect(value).toBeGreaterThan(0.58);
});

test("toCss writes the channels CSS reads inside rgb()", () => {
  expect(toCss([168, 108, 232])).toBe("168 108 232");
});
