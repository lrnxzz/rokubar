import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { api } from "../api/client";
import { appName, openApp, useApps } from "../apps/apps";
import { attempt, notify } from "../feedback/toast";
import { press } from "../television/commands";
import { Key } from "../television/keys";
import { useOn } from "../television/television";
import { type Glyph, Icon } from "../ui/Icon";
import { RowIcon, RowText } from "../ui/Row";
import { SearchField } from "../ui/SearchField";
import { Note } from "../ui/Text";
import styles from "./CommandPalette.module.css";
import type { Page } from "./pages";

type Command = {
  id: string;
  title: string;
  detail: string;
  glyph: Glyph;
  run: () => void;
};

const easing = [0.22, 1, 0.36, 1] as const;

export function CommandPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (page: Page) => void }) {
  const { apps } = useApps();
  const on = useOn();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useRef<HTMLDivElement>(null);

  const all: Command[] = [
    ...(apps ?? [])
      .filter((app) => app.type === "appl" || app.type === "tvin")
      .map((app) => ({
        id: app.id,
        title: appName(app),
        detail: app.type === "tvin" ? "Input" : "App",
        glyph: app.type === "tvin" ? ("tv_arrow_right" as const) : ("apps" as const),
        run: () => void openApp(app).then((opened) => opened && notify(`Opening ${appName(app)}`)),
      })),
    {
      id: "home",
      title: "Go home",
      detail: "Remote",
      glyph: "home",
      run: () => press(Key.Home),
    },
    {
      id: "power",
      title: on ? "Turn the TV off" : "Turn the TV on",
      detail: "Power",
      glyph: "power",
      run: () => void attempt(on ? api.turnOff : api.turnOn, "The TV didn't respond"),
    },
    {
      id: "settings",
      title: "Settings",
      detail: "Rokubar",
      glyph: "settings",
      run: () => onNavigate("settings"),
    },
  ];

  const words = query.trim().toLowerCase();
  const commands = words ? all.filter((command) => command.title.toLowerCase().includes(words)) : all;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the row to bring into view is the one aria-selected marks after selected changes.
  useEffect(() => {
    results.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({
      block: "nearest",
    });
  }, [selected]);

  const choose = (command: Command | undefined) => {
    if (command) {
      command.run();
      onClose();
    }
  };

  return (
    <>
      <motion.div
        className={styles.scrim}
        onClick={onClose}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
      />
      <motion.div
        className={styles.palette}
        role="dialog"
        aria-label="Open an app or run an action"
        initial={{
          opacity: 0,
          y: -6,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.18,
          ease: easing,
        }}
      >
        <SearchField
          className={styles.search}
          label="Search"
          autoFocus
          value={query}
          placeholder="Open an app, switch input, or run an action"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-results"
          aria-activedescendant={commands[selected] && `palette-${commands[selected].id}`}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelected((index) => Math.min(index + 1, commands.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setSelected((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(commands[selected]);
            }
          }}
        />
        <div ref={results} id="palette-results" className={styles.results} role="listbox">
          {commands.length === 0 && (
            <div className={styles.empty}>
              <Note>Nothing matches "{query.trim()}"</Note>
            </div>
          )}
          {commands.map((command, index) => (
            // biome-ignore lint/a11y: focus stays in the search field, which moves through the options with aria-activedescendant.
            <div
              key={command.id}
              id={`palette-${command.id}`}
              className={styles.row}
              role="option"
              aria-selected={index === selected}
              onPointerEnter={() => setSelected(index)}
              onClick={() => choose(command)}
            >
              <RowIcon>
                <Icon name={command.glyph} />
              </RowIcon>
              <RowText name={command.title} />
              <Note>{command.detail}</Note>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
