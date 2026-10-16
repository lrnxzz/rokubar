import type { ComponentProps, ReactNode } from "react";

import { classes } from "../lib/classes";
import styles from "./Button.module.css";
import { useHold } from "./useHold";

type ButtonProps = Omit<ComponentProps<"button">, "type"> & {
  variant?: "panel" | "ghost";
  size?: "square" | "small";
  tone?: "danger";
  selected?: boolean;
};

export function Button({ variant = "panel", size, tone, selected, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={classes(styles[variant], size && styles[size], tone && styles[tone], className)}
      data-selected={selected}
      {...props}
    />
  );
}

type PanelButtonProps = {
  label: string;
  shortcut?: string;
  onPress: () => void;
  repeat?: boolean;
  size?: "square" | "small";
  selected?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

/** A button that acts on pointer down, like a remote's key, and keeps acting while held when repeat is on. */
export function PanelButton({ label, shortcut, onPress, repeat = false, ...props }: PanelButtonProps) {
  const hold = useHold(onPress, repeat);

  return (
    <Button aria-label={label} aria-keyshortcuts={shortcut} title={shortcut ? `${label} (${shortcut})` : label} {...hold} {...props} />
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
