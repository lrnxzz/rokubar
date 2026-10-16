import { useRef, useState } from "react";

import { api } from "../../api/client";
import { attempt } from "../../feedback/toast";
import { Key } from "../../television/keys";
import { PanelButton } from "../../ui/Button";
import { Card, CardHead } from "../../ui/Card";
import { Icon } from "../../ui/Icon";
import { Note, VisuallyHidden } from "../../ui/Text";
import { edits } from "./edits";
import styles from "./KeyboardCard.module.css";

/** A field whose letters reach the TV as they're typed, for the TV's own text fields. */
export function KeyboardCard() {
  const [text, setText] = useState("");
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  // Requests go one after another, so the TV receives the characters in the order they were typed.
  const send = (action: () => Promise<unknown>) => {
    queue.current = queue.current.then(() => attempt(action, "The TV didn't take that text"));
  };

  const change = (next: string) => {
    const { erase, type } = edits(text, next);

    for (let erased = 0; erased < erase; erased++) {
      send(() => api.press(Key.Backspace));
    }

    if (type) {
      send(() => api.type(type));
    }

    setText(next);
  };

  return (
    <Card label="Keyboard">
      <CardHead>
        <Icon name="keyboard" size={16} />
        Keyboard
      </CardHead>
      <label className={styles.field}>
        <VisuallyHidden>Text for the TV</VisuallyHidden>
        <input
          value={text}
          placeholder="Type into the open field on your TV"
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => change(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              send(() => api.press(Key.Enter));
            }
          }}
        />
      </label>
      <div className={styles.actions}>
        <Note>Letters reach the TV as you type.</Note>
        <PanelButton size="small" label="Erase everything" onPress={() => change("")} disabled={!text}>
          <Icon name="backspace" size={16} />
        </PanelButton>
        <PanelButton size="small" label="Confirm on the TV" shortcut="Enter" onPress={() => send(() => api.press(Key.Enter))}>
          <Icon name="arrow_enter_left" size={16} />
        </PanelButton>
      </div>
    </Card>
  );
}
