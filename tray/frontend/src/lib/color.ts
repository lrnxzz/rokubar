export type Rgb = [number, number, number];

export const rokuPurple: Rgb = [168, 108, 232];

/** The color as the space-separated channels CSS reads in rgb(var(--x) / alpha). */
export function toCss([red, green, blue]: Rgb): string {
  return `${red} ${green} ${blue}`;
}

/** Hue, saturation and value, each from 0 to 1. */
export function hsv(red: number, green: number, blue: number): Rgb {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta > 0) {
    if (max === red) {
      hue = ((green - blue) / delta + 6) % 6;
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
  }

  return [hue / 6, max === 0 ? 0 : delta / max, max / 255];
}

/** The red, green and blue of the hue's sixth of the color wheel, before lightness is added. */
function wheel(sector: number, chroma: number, second: number): Rgb {
  switch (Math.floor(sector)) {
    case 0:
      return [chroma, second, 0];
    case 1:
      return [second, chroma, 0];
    case 2:
      return [0, chroma, second];
    case 3:
      return [0, second, chroma];
    case 4:
      return [second, 0, chroma];
    default:
      return [chroma, 0, second];
  }
}

export function hsl(hue: number, saturation: number, lightness: number): Rgb {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = hue * 6;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const match = lightness - chroma / 2;
  const [red, green, blue] = wheel(sector, chroma, second);

  return [Math.round((red + match) * 255), Math.round((green + match) * 255), Math.round((blue + match) * 255)];
}

/** Keeps a brand color legible as text and as a tint on the dark panel. */
export function readable([red, green, blue]: Rgb): Rgb {
  const max = Math.max(red, green, blue) / 255;
  const min = Math.min(red, green, blue) / 255;
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const [hue] = hsv(red, green, blue);

  return hsl(hue, Math.max(saturation, 0.5), Math.min(Math.max(lightness, 0.58), 0.7));
}
