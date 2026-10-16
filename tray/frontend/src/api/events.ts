import { Events } from "@wailsio/runtime";

import type { Television } from "./types.gen";

/** The server publishes the TV as the "state" event on every change; see server/internal/transporter/events.go. */
export function onTelevision(listener: (television: Television) => void): () => void {
  return Events.On("state", (event) => listener(event.data as Television));
}
