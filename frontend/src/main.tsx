/**
 * EduBranch AI — React application entry point.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "@/providers/AppProviders";
import { App } from "@/App";
/* Public landing headings only (R01 §0 "EduBranch/Public *" text styles); imported in JS so Vite emits font assets */
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
