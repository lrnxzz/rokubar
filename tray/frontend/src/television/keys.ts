export const Key = {
  Home: "Home",
  Back: "Back",
  Up: "Up",
  Down: "Down",
  Left: "Left",
  Right: "Right",
  Select: "Select",
  Play: "Play",
  Rev: "Rev",
  Fwd: "Fwd",
  InstantReplay: "InstantReplay",
  Info: "Info",
  Backspace: "Backspace",
  Enter: "Enter",
  Search: "Search",
  VolumeUp: "VolumeUp",
  VolumeDown: "VolumeDown",
  VolumeMute: "VolumeMute",
  ChannelUp: "ChannelUp",
  ChannelDown: "ChannelDown",
} as const;

export type Key = (typeof Key)[keyof typeof Key];

export type Direction = "up" | "down" | "left" | "right" | "ok";

export const directionKey: Record<Direction, Key> = {
  up: Key.Up,
  down: Key.Down,
  left: Key.Left,
  right: Key.Right,
  ok: Key.Select,
};
