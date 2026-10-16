import { api } from "../../api/client";
import type { App } from "../../api/types.gen";
import { attempt } from "../../feedback/toast";
import { useTelevision } from "../../television/television";
import { Card, CardHead } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { RowBadge, RowButton, RowIcon, RowText } from "../../ui/Row";
import styles from "./InputsCard.module.css";
import { describeInput } from "./inputs";

export function InputsCard({ inputs }: { inputs: App[] }) {
  const state = useTelevision();

  if (inputs.length === 0) {
    return null;
  }

  return (
    <Card label="Inputs">
      <CardHead>
        <Icon name="tv_arrow_right" size={16} />
        Inputs
      </CardHead>
      <div className={styles.inputs}>
        {inputs.map((input) => {
          const active = state?.app.id === input.id;
          const { title, detail, glyph } = describeInput(input);

          return (
            <RowButton
              key={input.id}
              active={active}
              disabled={!state?.reachable}
              onClick={() => void attempt(() => api.launch(input.id), `${title} didn't open`)}
            >
              <RowIcon>
                <Icon name={glyph} filled={active} />
              </RowIcon>
              <RowText name={title} detail={active ? `${detail} · on screen` : detail} />
              {active && (
                <RowBadge>
                  ON SCREEN
                  <Icon name="checkmark" size={16} />
                </RowBadge>
              )}
            </RowButton>
          );
        })}
      </div>
    </Card>
  );
}
