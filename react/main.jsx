import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

const waitForStylesheets = () => {
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    console.log("Main: Found stylesheets:", stylesheets.map(link => link.href));
    if (stylesheets.length === 0) {
      console.warn("Main: No stylesheets found, resolving immediately");
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalStylesheets = stylesheets.length;
    const timeout = setTimeout(() => {
      console.warn("Main: Stylesheet loading timed out after 5s, loaded:", loadedCount, "/", totalStylesheets);
      resolve();
    }, 5000);

    const checkAllLoaded = () => {
      if (loadedCount === totalStylesheets) {
        clearTimeout(timeout);
        console.log("Main: All stylesheets loaded");
        resolve();
      }
    };

    stylesheets.forEach((link, index) => {
      const checkLoaded = () => {
        if (link.sheet && link.sheet.cssRules) {
          console.log(`Main: Stylesheet ${index + 1} loaded: ${link.href}, rules: ${link.sheet.cssRules.length}`);
          loadedCount++;
          checkAllLoaded();
        }
      };

      checkLoaded();
      if (!link.sheet || !link.sheet.cssRules) {
        link.addEventListener("load", checkLoaded);
        link.addEventListener("error", () => {
          console.error(`Main: Stylesheet error: ${link.href}`);
          loadedCount++;
          checkAllLoaded();
        });
      }
    });

    checkAllLoaded();
  });
};

if (rootElement) {
  console.log("Main: Initial root content:", rootElement.innerHTML);
  waitForStylesheets()
    .then(() => {
      console.log("Main: Hydrating...");
      try {
        hydrateRoot(rootElement, <App />);
      } catch (error) {
        console.error("Main: Hydration failed:", error);
        rootElement.innerHTML = `<div>Error: Failed to load UI components. ${error.message}</div>`;
      }
    })
    .catch((error) => {
      console.error("Main: Stylesheet wait failed:", error);
      rootElement.innerHTML = `<div>Error: Stylesheet loading failed. ${error.message}</div>`;
    });
} else {
  console.error("Main: Root element not found");
  document.body.innerHTML = `<div>Error: Root element not found</div>`;
}