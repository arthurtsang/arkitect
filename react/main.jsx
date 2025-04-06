// arkitect/react/main.jsx
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Main: Root element found, hydrating app");
  try {
    hydrateRoot(rootElement, <App />);
  } catch (error) {
    console.error("Main: Error hydrating app:", error.message);
    rootElement.innerHTML = `<div>Error hydrating app: ${error.message}</div>`;
  }
} else {
  console.error("Main: Root element not found");
}