import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

// Force console logs in production
const log = console.log.bind(console);
const warn = console.warn.bind(console);
const error = console.error.bind(console);

log("Main: Script loaded");

const rootElement = document.getElementById("root");

const waitForStylesheets = () => {
  log("Main: Waiting for stylesheets");
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    log("Main: Found stylesheets:", stylesheets.map(link => link.href));
    if (stylesheets.length === 0) {
      warn("Main: No stylesheets found");
      document.body.classList.add("loaded");
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalStylesheets = stylesheets.length;

    const checkAllLoaded = () => {
      if (loadedCount >= totalStylesheets) {
        log("Main: All stylesheets loaded");
        document.body.classList.add("loaded");
        resolve();
      }
    };

    stylesheets.forEach((link, index) => {
      const checkLoaded = () => {
        try {
          const sheet = link.sheet;
          if (sheet) {
            log(`Main: Stylesheet ${index + 1} loaded: ${link.href}`);
            loadedCount++;
            checkAllLoaded();
          } else {
            log(`Main: Stylesheet ${link.href} not ready, retrying`);
            setTimeout(checkLoaded, 50);
          }
        } catch (e) {
          warn(`Main: Stylesheet access delayed for ${link.href}, counting as loaded:`, e.message);
          loadedCount++;
          checkAllLoaded();
        }
      };

      if (link.sheet) {
        checkLoaded();
      } else {
        link.addEventListener("load", checkLoaded, { once: true });
        link.addEventListener("error", () => {
          error(`Main: Stylesheet error: ${link.href}`);
          loadedCount++;
          checkAllLoaded();
        }, { once: true });
      }
    });

    // Force loaded state after timeout
    setTimeout(() => {
      if (loadedCount < totalStylesheets) {
        warn("Main: Stylesheet timeout, forcing loaded state");
        document.body.classList.add("loaded");
        resolve();
      }
    }, 1000);
  });
};

if (rootElement) {
  log("Main: Initial root content:", rootElement.innerHTML.substring(0, 200) + "...");
  log("Main: Initial .layout exists:", !!document.querySelector(".layout"));
  waitForStylesheets()
    .then(() => {
      log("Main: Before hydration, root content:", rootElement.innerHTML.substring(0, 200) + "...");
      log("Main: Before hydration, .layout exists:", !!document.querySelector(".layout"));
      try {
        hydrateRoot(rootElement, <App />);
        log("Main: Hydrated successfully");
      } catch (err) {
        error("Main: Hydration failed:", err);
        rootElement.innerHTML = `<div>Error: Failed to load UI components. ${err.message}</div>`;
        document.body.classList.add("loaded");
      }
    })
    .catch((err) => {
      error("Main: Stylesheet wait failed:", err);
      rootElement.innerHTML = `<div>Error: Stylesheet loading failed. ${err.message}</div>`;
      document.body.classList.add("loaded");
    });
} else {
  error("Main: Root element not found");
  document.body.innerHTML = `<div>Error: Root element not found</div>`;
  document.body.classList.add("loaded");
}