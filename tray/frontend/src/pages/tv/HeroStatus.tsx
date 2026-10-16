import styles from "./HeroStatus.module.css";
import type { HeroStatus as Status } from "./heroStatus";

export function HeroStatus({ status }: { status: Status }) {
  return (
    <>
      <div className={styles.status} data-live={status.live}>
        <span className={styles.dot} />
        <span className={styles.label}>{status.label}</span>
        {status.source && <span className={styles.source}>{status.source}</span>}
      </div>
      <div className={styles.line}>{status.line}</div>
    </>
  );
}
