import { expect, test } from "vitest";

import { edits } from "./edits";

test("typing at the end only sends the new letters", () => {
  expect(edits("net", "netflix")).toEqual({
    erase: 0,
    type: "flix",
  });
});

test("changing a letter erases back to it and types the rest again", () => {
  expect(edits("netflix", "netflax")).toEqual({
    erase: 2,
    type: "ax",
  });
});

test("clearing the field erases everything", () => {
  expect(edits("hbo", "")).toEqual({
    erase: 3,
    type: "",
  });
});
