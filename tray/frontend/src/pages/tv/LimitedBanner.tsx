import { Icon } from "../../ui/Icon";
import styles from "./LimitedBanner.module.css";

/** Shown while the TV's Control by mobile apps is Limited, which answers state but refuses commands. */
export function LimitedBanner() {
  return (
    <div className={styles.banner} role="note">
      <Icon name="warning" size={16} filled />
      <span>
        The TV only lets Rokubar read its state. To control it, open{" "}
        <b>Settings › System › Advanced system settings › Control by mobile apps</b> on the TV and choose <b>Enabled</b>.
      </span>
    </div>
  );
}
