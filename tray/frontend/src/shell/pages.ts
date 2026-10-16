import type { Glyph } from "../ui/Icon";

export type Page = "tv" | "remote" | "apps" | "settings";

export const pages: {
  id: Page;
  label: string;
  glyph: Glyph;
}[] = [
  {
    id: "tv",
    label: "Your TV",
    glyph: "tv",
  },
  {
    id: "remote",
    label: "Remote",
    glyph: "device_meeting_room_remote",
  },
  {
    id: "apps",
    label: "Apps",
    glyph: "apps",
  },
  {
    id: "settings",
    label: "Settings",
    glyph: "options",
  },
];

/** The page the tray asked for in the window's URL, like /#remote. */
export function requestedPage(): Page {
  return pages.find((page) => `#${page.id}` === window.location.hash)?.id ?? "tv";
}
