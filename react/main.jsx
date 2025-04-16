import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

const waitForStylesheets = () => {
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    if (stylesheets.length === 0) {
      resolve();
      return;
    }
    let loadedCount = 0;
    stylesheets.forEach((link) => {
      if (link.sheet && link.sheet.cssRules) {
        loadedCount++;
      } else {
        link.addEventListener("load", () => {
          loadedCount++;
          if (loadedCount === stylesheets.length) {
            resolve();
          }
        });
        link.addEventListener("error", () => {
          loadedCount++;
          if (loadedCount === stylesheets.length) {
            resolve();
          }
        });
      }
    });
    if (loadedCount === stylesheets.length 0) {
      resolve();
    }
    if (loadedCount === stylesheets.length) {
      resolve();
    }
  });
};

if (rootElement) {
  console.log("Main: Waiting for stylesheets...");
  waitForStylesheets().then(() => {
    console.log("Main: Hydrating...");
    try {
      hydrateRoot(rootElement, <App />);
    } catch (error) {
      console.error("Main: Hydration failed:", error);
      rootElement.innerHTML = `<div>Error: Failed to load UI components. ${error.message}</div>`;
    }
  }).catch((error) => {
    console.error("Main: Stylesheet wait failed:", error);
  });
} else {
  console.error("Main: Root element not found");
}