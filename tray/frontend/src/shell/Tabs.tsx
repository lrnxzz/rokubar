import { Icon } from "../ui/Icon";
import { type Page, pages } from "./pages";
import styles from "./Tabs.module.css";

export function Tabs({ page, onChange }: { page: Page; onChange: (page: Page) => void }) {
  return (
    <nav className={styles.tabs} aria-label="Pages">
      {pages.map(({ id, label, glyph }, index) => (
        <button
          key={id}
          type="button"
          className={styles.tab}
          aria-label={label}
          aria-current={page === id ? "page" : undefined}
          title={`${label} (Ctrl+${index + 1})`}
          onClick={() => onChange(id)}
        >
          <Icon name={glyph} filled={page === id} />
        </button>
      ))}
    </nav>
  );
}
