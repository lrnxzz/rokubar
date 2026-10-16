import type { ReactNode } from "react";

import styles from "./Card.module.css";

export function Card({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className={styles.card} aria-label={label}>
      {children}
    </section>
  );
}

export function CardHead({ children }: { children: ReactNode }) {
  return <div className={styles.head}>{children}</div>;
}

export function Spacer() {
  return <span className={styles.spacer} />;
}

export function CardLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.link} onClick={onClick}>
      {children}
    </button>
  );
}
