import { useTransition } from "react";

import { api } from "../api/client";
import { attempt, notify } from "../feedback/toast";
import type { Key } from "./keys";
import { useOn } from "./television";

export function press(key: Key) {
  void attempt(() => api.press(key), "The TV didn't take that key");
}

/** Turns the TV off when it's on, and wakes it otherwise; waking can take a while, through Wake-on-LAN. */
export function usePower() {
  const on = useOn();
  const [waking, startWaking] = useTransition();

  const toggle = () => {
    if (on) {
      void attempt(api.turnOff, "The TV didn't turn off");
    } else {
      startWaking(async () => {
        if (await attempt(api.turnOn, "The TV didn't wake up. Check that it's plugged in and on the same network.")) {
          notify("The TV is on");
        }
      });
    }
  };

  return {
    on,
    waking,
    toggle,
  };
}
