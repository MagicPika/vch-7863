import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import emblemUrl from "./assets/emblem.png";

// Set favicon dynamically (works on GitHub Pages with subpaths)
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = emblemUrl;
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
