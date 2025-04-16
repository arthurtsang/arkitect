import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

console.log("Main: Script loaded");

const rootElement = document.getElementById("root");

const waitForStylesheets = () => {
  console.log("Main: Waiting for stylesheets");
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    console.log("Main: Found stylesheets:", stylesheets.map(link => link.href));
    if (stylesheets.length === 0) {
      console.warn("Main: No stylesheets found");
      document.body.classList.add("loaded");
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalStylesheets = stylesheets.length;

    const checkAllLoaded = () => {
      if (loadedCount >= totalStylesheets) {
        console.log("Main: All stylesheets loaded");
        document.body.classList.add("loaded");
        resolve();
      }
    };

    stylesheets.forEach((link, index) => {
      const checkLoaded = () => {
        try {
          const sheet = link.sheet;
          if (sheet && (sheet.cssRules || sheet.rules || sheet.href)) {
            console.log(`Main: Stylesheet ${index + 1} loaded: ${link.href}`);
            loadedCount++;
            checkAllLoaded();
          } else {
            console.log(`Main: Stylesheet ${link.href} not ready, retrying`);
            setTimeout(checkLoaded, 50);
          }
        } catch (e) {
          console.warn(`Main: Stylesheet access delayed for ${link.href}, counting as loaded:`, e.message);
          loadedCount++;
          checkAllLoaded();
        }
      };

      // Check if already loaded
      if (link.sheet) {
        checkLoaded();
      }

      link.addEventListener("load", checkLoaded, { once: true });
      link.addEventListener("error", () => {
        console.error(`Main: Stylesheet error: ${link.href}`);
        loadedCount++;
        checkAllLoaded();
      }, { once: true });
    });

    // Fallback after timeout
    setTimeout(() => {
      if (loadedCount < totalStylesheets) {
        console.warn("Main: Stylesheet timeout, forcing loaded state");
        loadedCount = totalStylesheets;
        checkAllLoaded();
      }
    }, 2000);
  });
};

if (rootElement) {
  console.log("Main: Initial root content:", rootElement.innerHTML.substring(0, 200) + "...");
  console.log("Main: Initial .layout exists:", !!document.querySelector(".layout"));
  waitForStylesheets()
    .then(() => {
      console.log("Main: Before hydration, root content:", rootElement.innerHTML.substring(0, 200) + "...");
      console.log("Main: Before hydration, .layout exists:", !!document.querySelector(".layout"));
      try {
        hydrateRoot(rootElement, <App />, {
          onRecoverableError: (error) => {
            console.warn("Main: Hydration error recovered:", error.message);
          }
        });
        console.log("Main: Hydrated successfully");
      } catch (error) {
        console.error("Main: Hydration failed:", error);
        rootElement.innerHTML = `<div>Error: Failed to load UI components. ${error.message}</div>`;
        document.body.classList.add("loaded");
      }
    })
    .catch((error) => {
      console.error("Main: Stylesheet wait failed:", error);
      rootElement.innerHTML = `<div>Error: Stylesheet loading failed. ${error.message}</div>`;
      document.body.classList.add("loaded");
    });
} else {
  console.error("Main: Root element not found");
  document.body.innerHTML = `<div>Error: Root element not found</div>`;
  document.body.classList.add("loaded");
}