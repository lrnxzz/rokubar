import type { Hardware } from "../../api/types.gen";

// AOC 43S5155/78G in millimetres, from the spec sheet: 955.9 × 562.6 × 86.9 without the stand, 606.3 tall with it.
// Proportions not in the sheet (bezel, bulge, ports, feet) are measured off AOC's product photos.
export const W = 955.9;
export const H = 562.6;
export const halfW = W / 2;
export const top = H / 2;
export const bottom = -H / 2;
export const floor = bottom - 43.7;
export const lip = 2.5;
export const chin = 14;
export const deep = 86.9;

export const cell = {
  w: W - 2 * lip,
  h: top - lip - (bottom + chin),
  y: (top - lip + bottom + chin) / 2,
};

export const active = {
  w: 940,
  h: 528.75,
  y: 5,
};

export const bulge = {
  left: -86,
  right: 239,
  bottom: -190,
  top: 163,
  back: -68,
};

export const barTop = bottom + 92;

export const vesa = {
  x: (bulge.left + bulge.right) / 2,
  y: (bulge.top + bulge.bottom) / 2,
};

// A 43-inch direct-lit panel: three strips of ten LEDs.
export const ledRows = [-175, 5, 185];
export const ledColumns = Array.from(
  {
    length: 10,
  },
  (_, index) => -405 + index * 90,
);

export const hdmiRows = {
  hdmi1: -8,
  hdmi2: -30,
  hdmi3: -52,
};

export function isAoc43S5155(hardware: Hardware | undefined): boolean {
  return hardware?.vendor.toUpperCase() === "AOC" && hardware.modelNumber.startsWith("43S5155");
}
