// arkitect/react/main.jsx
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

const waitForStylesheets = () => {
  return new Promise((resolve) => {
    const stylesheets = Array.from(document.styleSheets);
    const interval = setInterval(() => {
      const allLoaded = stylesheets.every((sheet) => {
        try {
          return sheet.cssRules !== null;
        } catch (e) {
          return false;
        }
      });
      if (allLoaded) {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
};

if (rootElement) {
  console.log("Main: Waiting for stylesheets to load... [Debug #123]");
  waitForStylesheets().then(() => {
    console.log("Main: Stylesheets loaded, hydrating app [Debug #123]");
    try {
      hydrateRoot(rootElement, <App />);
    } catch (error) {
      console.error("Main: Error hydrating app [Debug #123]:", error.message);
      rootElement.innerHTML = `<div>Error hydrating app: ${error.message}</div>`;
    }
  });
} else {
  console.error("Main: Root element not found");
}