import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // Relative to main.jsx in arkitect/react/

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Main: Root element found, mounting app");
  rootElement.innerHTML = ""; // Clear static content
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Main: Root element not found");
}