// arkitect/react/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Main: Root element found, mounting app");
  try {
    rootElement.innerHTML = ""; // Clear static content
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Main: Error mounting app:", error.message);
    rootElement.innerHTML = `<div>Error mounting app: ${error.message}</div>`;
  }
} else {
  console.error("Main: Root element not found");
}