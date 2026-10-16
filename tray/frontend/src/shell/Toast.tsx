import { AnimatePresence, motion } from "motion/react";

import { useToast } from "../feedback/toast";
import { Icon } from "../ui/Icon";
import styles from "./Toast.module.css";

export function Toast() {
  const toast = useToast();

  return (
    <div aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={styles.toast}
            data-tone={toast.tone}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 4,
            }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Icon name={toast.tone === "error" ? "warning" : "checkmark"} size={16} filled />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
