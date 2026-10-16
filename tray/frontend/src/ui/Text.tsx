import type { ReactNode } from "react";

import styles from "./Text.module.css";

export function Note({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.title}>{children}</h2>;
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.hidden}>{children}</span>;
}
