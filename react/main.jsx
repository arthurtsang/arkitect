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
          if (sheet) {
            console.log(`Main: Stylesheet ${index + 1} loaded: ${link.href}`);
            loadedCount++;
            checkAllLoaded();
          } else {
            console.log(`Main: Stylesheet ${link.href} not ready, retrying`);
            setTimeout(checkLoaded, 50);
          }
        } catch (e) {
          console.warn(`Main: Stylesheet access failed for ${link.href}, treating as loaded:`, e.message);
          loadedCount++;
          checkAllLoaded();
        }
      };

      // Check if stylesheet is accessible
      fetch(link.href, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            console.log(`Main: Stylesheet ${link.href} exists`);
            if (link.sheet) {
              checkLoaded();
            } else {
              link.addEventListener("load", checkLoaded, { once: true });
            }
          } else {
            console.warn(`Main: Stylesheet ${link.href} not found (status ${response.status}), skipping`);
            loadedCount++;
            checkAllLoaded();
          }
        })
        .catch((error) => {
          console.warn(`Main: Stylesheet ${link.href} fetch failed, treating as loaded:`, error.message);
          loadedCount++;
          checkAllLoaded();
        });

      link.addEventListener("error", () => {
        console.error(`Main: Stylesheet error: ${link.href}`);
        loadedCount++;
        checkAllLoaded();
      }, { once: true });
    });

    // Force loaded state after timeout
    setTimeout(() => {
      if (loadedCount < totalStylesheets) {
        console.warn("Main: Stylesheet timeout, forcing loaded state");
        document.body.classList.add("loaded");
        resolve();
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
        hydrateRoot(rootElement, <App />);
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