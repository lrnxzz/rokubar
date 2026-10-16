import { createCache, useCached } from "../lib/cache";
import { hsv, type Rgb, readable, rokuPurple, toCss } from "../lib/color";

/** The brand color of an icon: the most common hue among its saturated, bright pixels. */
function sample(source: string): Promise<Rgb | null> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onerror = () => resolve(null);
    image.onload = () => {
      const size = 24;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!context) {
        resolve(null);

        return;
      }

      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      const buckets = new Map<number, [number, number, number, number]>();

      for (let index = 0; index < pixels.length; index += 4) {
        const [red = 0, green = 0, blue = 0, alpha = 0] = pixels.subarray(index, index + 4);
        const [hue, saturation, value] = hsv(red, green, blue);

        if (alpha >= 153 && saturation >= 0.25 && value >= 0.25) {
          const bucket = Math.floor(hue * 20);
          const [count, sumRed, sumGreen, sumBlue] = buckets.get(bucket) ?? [0, 0, 0, 0];
          buckets.set(bucket, [count + 1, sumRed + red, sumGreen + green, sumBlue + blue]);
        }
      }

      const best = [...buckets.values()].sort((left, right) => right[0] - left[0])[0];
      if (!best) {
        resolve(null);

        return;
      }

      const [count, red, green, blue] = best;
      resolve(readable([red / count, green / count, blue / count]));
    };

    image.src = source;
  });
}

const brands = createCache(sample);

export function brandOf(source: string): Promise<Rgb | null> {
  return brands.load(source);
}

/** The brand color of the icon at source as CSS channels, Roku's purple until it's known or when it has none. */
export function useBrand(source: string | undefined): string {
  return toCss(useCached(brands, source) ?? rokuPurple);
}
