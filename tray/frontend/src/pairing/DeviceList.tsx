import { useEffect } from "react";

import { useTelevision } from "../television/television";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Row, RowBadge, RowIcon, RowText } from "../ui/Row";
import { Note } from "../ui/Text";
import styles from "./DeviceList.module.css";
import { pair, searchTelevisions, useSearch } from "./search";

export function DeviceList() {
  const { televisions, searching } = useSearch();
  const state = useTelevision();
  const paired = state?.paired ? state.serial : "";

  // The paired TV is listed at once, while the search looks for the others.
  const answered = televisions ?? [];
  const listed = state?.paired && !answered.some((television) => television.serial === paired) ? [state, ...answered] : answered;

  useEffect(() => {
    void searchTelevisions();
  }, []);

  return (
    <div className={styles.list}>
      {listed.length === 0 && televisions === null && <Note>Looking for Roku devices on this network.</Note>}
      {listed.length === 0 && televisions?.length === 0 && !searching && (
        <Note>No Roku answered. Check that it's on and on the same Wi-Fi as this PC.</Note>
      )}
      {listed.map((found) => (
        <Row key={found.serial} active={found.serial === paired} title={found.host}>
          <RowIcon>
            <Icon name="tv" />
          </RowIcon>
          <RowText name={found.name || "Roku"} detail={found.model || "Roku device"} />
          {found.serial === paired ? (
            <RowBadge>
              IN USE
              <Icon name="checkmark" size={16} />
            </RowBadge>
          ) : (
            <Button selected onClick={() => void pair(found)}>
              Use
            </Button>
          )}
        </Row>
      ))}
      <Button className={styles.again} onClick={() => void searchTelevisions()} disabled={searching}>
        <Icon name="arrow_sync" size={16} spinning={searching} />
        {searching ? "Searching" : "Search again"}
      </Button>
    </div>
  );
}
