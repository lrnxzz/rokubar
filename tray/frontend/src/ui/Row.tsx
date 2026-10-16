import type { ComponentProps, ReactNode } from "react";

import styles from "./Row.module.css";

type RowProps = ComponentProps<"div"> & {
  active?: boolean;
};

/** A list line: an icon, a name with its detail, and what's left on the right. */
export function Row({ active, ...props }: RowProps) {
  return <div className={styles.row} data-active={active} {...props} />;
}

type RowButtonProps = Omit<ComponentProps<"button">, "type"> & {
  active?: boolean;
};

export function RowButton({ active, ...props }: RowButtonProps) {
  return <button type="button" className={styles.row} data-active={active} aria-current={active ? "true" : undefined} {...props} />;
}

export function RowIcon({ children }: { children: ReactNode }) {
  return <span className={styles.icon}>{children}</span>;
}

export function RowText({ name, detail }: { name: ReactNode; detail?: ReactNode }) {
  return (
    <span className={styles.text}>
      <span className={styles.name}>{name}</span>
      {detail && <span className={styles.detail}>{detail}</span>}
    </span>
  );
}

export function RowBadge({ children }: { children: ReactNode }) {
  return <span className={styles.badge}>{children}</span>;
}
