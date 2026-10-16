import { createStore, useStore } from "../lib/store";

export type Toast = {
  id: number;
  message: string;
  tone: "info" | "error";
};

const toast = createStore<Toast | null>(null);
let dismissal: number | undefined;

export function notify(message: string, tone: Toast["tone"] = "info") {
  window.clearTimeout(dismissal);
  toast.set({
    id: Date.now(),
    message,
    tone,
  });
  dismissal = window.setTimeout(() => toast.set(null), 2600);
}

/** Runs an action against the TV and tells the user when it fails; resolves to whether it worked. */
export async function attempt(action: () => Promise<unknown>, failure: string): Promise<boolean> {
  try {
    await action();

    return true;
  } catch {
    notify(failure, "error");

    return false;
  }
}

export function useToast(): Toast | null {
  return useStore(toast);
}
