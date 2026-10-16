import type { App } from "../api/types.gen";
import { createCache, useCached } from "../lib/cache";
import { appName } from "./apps";

// ECP gives one landscape poster per app (290 by 218), too small to crop into a sharp square icon. The App Store
// has each streaming app's square icon and its image server renders any pixel size, so Rokubar asks it by app name.
const genres = new Set(["Entertainment", "Music", "Photo & Video", "Sports", "News", "Kids", "Education"]);
const storageKey = "rokubar.artwork";
const country = (new Intl.Locale(navigator.language).region ?? "US").toLowerCase();

type SearchResult = {
  trackName: string;
  primaryGenreName: string;
  artworkUrl512: string;
};

function words(text: string): string[] {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function covers(outer: string[], inner: string[]): boolean {
  return inner.length > 0 && inner.every((word) => outer.includes(word));
}

/** The artwork URL with {size} where the pixel size goes, or "" when no streaming app of that name is in the store. */
async function search(name: string): Promise<string> {
  const response = await fetch(
    `https://itunes.apple.com/search?entity=software&limit=5&country=${country}&term=${encodeURIComponent(name)}`,
  );
  const { results } = (await response.json()) as { results: SearchResult[] };
  const wanted = words(name);

  // Store names carry a tagline after a colon or dash ("HBO Max: programas e filmes"); the brand comes before it.
  const match = results.find((result) => {
    const brand = words(result.trackName.split(/[:|–-]/)[0] ?? "");

    return genres.has(result.primaryGenreName) && (covers(brand, wanted) || covers(wanted, brand));
  });

  return match ? match.artworkUrl512.replace(/\/\d+x\d+bb\.\w+$/, "/{size}x{size}bb.png") : "";
}

function saved(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? "{}");
  } catch {
    return {};
  }
}

const artwork = createCache(async (name) => {
  const template = await search(name);

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...saved(),
        [name]: template,
      }),
    );
  } catch {
    // Without storage the lookup repeats next session.
  }

  return template;
}, Object.entries(saved()));

/** The app's store icon at a CSS size, rendered for the screen's pixel density; null until found or when absent. */
export function useArtwork(app: App, size: number): string | null {
  const template = useCached(artwork, app.type === "appl" ? appName(app) : undefined);

  return template ? template.replaceAll("{size}", String(Math.round(size * window.devicePixelRatio))) : null;
}
