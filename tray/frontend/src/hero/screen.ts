import { useEffect, useState } from "react";

import { iconUrl } from "../api/client";
import type { App, Television } from "../api/types.gen";
import { brandOf } from "../apps/brand";
import { rokuPurple } from "../lib/color";
import { isOn } from "../television/television";

// The picture is 16:9 like the panel; Roku OS draws its UI at 1280 by 720 on this TV (device-info ui-resolution).
const width = 1280;
const height = 720;

const font = "'Segoe UI Variable Display', 'Segoe UI', sans-serif";

// Roku OS 15's home menu, in the TV's language.
const menus: Record<string, { items: string[]; apps: string }> = {
  pt: {
    items: ["Tela inicial", "O que assistir", "Minha lista", "Pesquisar", "Central de apps", "Configurações"],
    apps: "Apps e entradas",
  },
  es: {
    items: ["Inicio", "Qué ver", "Mi lista", "Buscar", "Tienda de canales", "Configuración"],
    apps: "Apps y entradas",
  },
  en: {
    items: ["Home", "What to Watch", "My List", "Search", "Streaming Store", "Settings"],
    apps: "Apps and inputs",
  },
};

function load(source: string, attempts = 2): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    // The TV answers a burst of icon requests with an occasional failure; one retry fills the gap.
    image.onerror = () => {
      if (attempts > 1) {
        window.setTimeout(() => void load(source, attempts - 1).then(resolve), 400);
      } else {
        resolve(null);
      }
    };
    image.src = source;
  });
}

/** Roku OS 15's home screen as this TV draws it: charcoal, the menu on the left, apps and inputs in four columns. */
async function home(context: CanvasRenderingContext2D, state: Television, tiles: App[]) {
  const posters = await Promise.all(tiles.slice(0, 12).map((app) => load(iconUrl(app.id))));
  const menu = menus[state.hardware.language] ?? menus.en;

  context.fillStyle = "#1f1f22";
  context.fillRect(0, 0, width, height);

  // The faint folded-paper texture behind Roku OS 15's home.
  context.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (const [x, y, w] of [
    [-200, 520, 900],
    [380, -120, 760],
    [820, 300, 700],
  ] as const) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + w, y - w * 0.45);
    context.lineTo(x + w * 0.8, y + w * 0.2);
    context.closePath();
    context.fill();
  }

  context.fillStyle = "#ffffff";
  context.textBaseline = "middle";
  context.font = `700 34px ${font}`;
  // AOC writes its name with a crossbarless A, which Λ draws.
  const vendor = state.hardware.vendor.toUpperCase() === "AOC" ? "ΛOC" : state.hardware.vendor;
  context.fillText(vendor ? `${vendor} • Roku TV` : "Roku TV", 54, 60);

  const now = new Date();
  context.font = `400 26px ${font}`;
  context.textAlign = "right";
  context.fillText(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`, width - 60, 60);
  context.textAlign = "left";

  menu?.items.forEach((item, index) => {
    const y = 180 + index * 54;

    if (index === 0) {
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.roundRect(48, y - 24, 380, 48, 4);
      context.fill();
    }

    context.font = `${index === 0 ? 600 : 400} 26px ${font}`;
    context.fillStyle = index === 0 ? "#1f1f22" : "rgba(255, 255, 255, 0.86)";
    context.fillText(item, 70, y);
  });

  context.font = `400 22px ${font}`;
  context.fillStyle = "rgba(255, 255, 255, 0.8)";
  context.fillText(menu?.apps ?? "", 520, 156);

  // Roku tiles are 290 by 218.
  const [tileWidth, tileHeight, gap, left, top] = [170, 128, 14, 520, 182];
  posters.forEach((poster, index) => {
    const x = left + (index % 4) * (tileWidth + gap);
    const y = top + Math.floor(index / 4) * (tileHeight + gap);
    const tile = tiles[index];

    context.save();
    context.beginPath();
    context.roundRect(x, y, tileWidth, tileHeight, 4);
    context.clip();
    context.fillStyle = "#3a3a3f";
    context.fill();
    if (poster) {
      context.drawImage(poster, x, y, tileWidth, tileHeight);
    }
    context.restore();

    // Input tiles carry their name under the glyph.
    if (tile?.type === "tvin") {
      context.font = `400 15px ${font}`;
      context.fillStyle = "rgba(255, 255, 255, 0.85)";
      context.textAlign = "center";
      context.fillText(tile.name.replace(/\s+/g, " ").trim(), x + tileWidth / 2, y + tileHeight - 16);
      context.textAlign = "left";
    }
  });
}

/** A screen lit in one color: the open app's brand color, or slate for an HDMI or antenna input Rokubar can't see. */
async function tint(context: CanvasRenderingContext2D, app: App) {
  const brand = app.type === "tvin" ? null : await brandOf(iconUrl(app.id));
  const [red, green, blue] = brand ?? (app.type === "tvin" ? [96, 110, 150] : rokuPurple);

  const background = context.createRadialGradient(width * 0.3, height * 0.15, 0, width * 0.3, height * 0.15, width);
  background.addColorStop(0, `rgb(${red} ${green} ${blue})`);
  background.addColorStop(1, `rgb(${red * 0.22} ${green * 0.22} ${blue * 0.22})`);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
}

/** The minute of the clock, moving only while ticking, so a picture that shows the time redraws when it turns. */
function useMinute(ticking: boolean): number {
  const [minute, setMinute] = useState(() => Math.floor(Date.now() / 60000));

  useEffect(() => {
    if (!ticking) {
      return;
    }

    const timer = window.setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 5000);

    return () => window.clearInterval(timer);
  }, [ticking]);

  return minute;
}

/** What the TV is showing, drawn for the 3D TV's screen; null while it's off. */
export function useScreen(state: Television | null, tiles: App[]): HTMLCanvasElement | null {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const app = isOn(state) ? state?.app : undefined;
  const scene = !app ? "" : !app.id || app.type === "home" ? "home" : `${app.type}:${app.id}`;
  const order = tiles.map((tile) => tile.id).join(" ");
  const minute = useMinute(scene === "home");

  // The picture depends on the scene, the tile order and the minute; the objects behind them are new on every poll.
  // biome-ignore lint/correctness/useExhaustiveDependencies: state, app and tiles are read through scene, order and minute.
  useEffect(() => {
    if (!state || !app) {
      return;
    }

    let current = true;
    const next = document.createElement("canvas");
    next.width = width;
    next.height = height;

    const context = next.getContext("2d");
    if (!context) {
      return;
    }

    void (scene === "home" ? home(context, state, tiles) : tint(context, app)).then(() => {
      if (current) {
        setCanvas(next);
      }
    });

    return () => {
      current = false;
    };
  }, [scene, order, minute]);

  return scene ? canvas : null;
}
