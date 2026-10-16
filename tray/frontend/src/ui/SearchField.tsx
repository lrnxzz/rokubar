import type { ComponentProps, ReactNode } from "react";

import { classes } from "../lib/classes";
import { Icon } from "./Icon";
import styles from "./SearchField.module.css";
import { VisuallyHidden } from "./Text";

type SearchFieldProps = Omit<ComponentProps<"input">, "size"> & {
  label: string;
  iconSize?: number;
  className?: string;
  trailing?: ReactNode;
};

export function SearchField({ label, iconSize, className, trailing, ...input }: SearchFieldProps) {
  return (
    <label className={classes(styles.search, className)}>
      <Icon name="search" size={iconSize} />
      <VisuallyHidden>{label}</VisuallyHidden>
      <input spellCheck={false} {...input} />
      {trailing}
    </label>
  );
}
