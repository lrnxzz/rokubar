import { Hero } from "../hero/Hero";
import { rokuPurple, toCss } from "../lib/color";
import { DeviceList } from "../pairing/DeviceList";
import { useSearch } from "../pairing/search";
import { Card } from "../ui/Card";
import { RokubarMark } from "../ui/RokubarMark";
import styles from "./Onboarding.module.css";

export function Onboarding() {
  const { televisions, searching } = useSearch();
  const found = (televisions?.length ?? 0) > 0;

  return (
    <div className={styles.onboarding}>
      <Hero accent={toCss(rokuPurple)} lit={found}>
        <RokubarMark />
        <span className={styles.title}>{searching ? "Looking for your Roku" : found ? "Found it" : "No Roku yet"}</span>
      </Hero>
      <div className={styles.intro}>
        <h1>Find your Roku</h1>
        <p>Rokubar looks for Roku TVs and players on this network. Pick yours to start.</p>
      </div>
      <Card label="Roku devices">
        <DeviceList />
      </Card>
    </div>
  );
}
