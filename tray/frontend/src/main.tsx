import "./theme.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { followApps } from "./apps/apps";
import { App } from "./shell/App";
import { connect } from "./television/television";

followApps();
connect();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// The 3D loads apart so the panel paints first; fetching it right after keeps the first hero from waiting.
requestIdleCallback(() => void import("./hero/TvHero"));
