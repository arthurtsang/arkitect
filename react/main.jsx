// arkitect/react/main.jsx
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Main: Root element found, hydrating app");
  hydrateRoot(rootElement, <App />);
} else {
  console.error("Main: Root element not found");
}