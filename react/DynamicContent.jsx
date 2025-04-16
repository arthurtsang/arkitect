import React, { useEffect } from "react";
import { components } from "./components.js";

const DynamicContent = () => {
  console.log("DynamicContent: Rendering");

  useEffect(() => {
    console.log("DynamicContent: useEffect running");
    const reactElements = document.querySelectorAll("[data-react]");
    console.log("DynamicContent: Found react elements:", reactElements.length);

    reactElements.forEach((element) => {
      const componentName = element.getAttribute("data-react");
      const Component = components[componentName];
      if (!Component) {
        console.error(`DynamicContent: Component ${componentName} not found`);
        return;
      }

      // Create a wrapper to render the component
      const wrapper = document.createElement("div");
      element.appendChild(wrapper);
      console.log(`DynamicContent: Rendering ${componentName} in`, element);

      // Pass data attributes as props
      const props = {};
      for (const attr of element.attributes) {
        if (attr.name.startsWith("data-") && attr.name !== "data-react") {
          const propName = attr.name.replace("data-", "").replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          props[propName] = attr.value;
        }
      }
      console.log(`DynamicContent: Props for ${componentName}:`, props);

      // Hydrate the component (simplified, assuming React handles it)
      import("react-dom/client").then(({ hydrateRoot }) => {
        hydrateRoot(wrapper, <Component {...props} />);
        console.log(`DynamicContent: Hydrated ${componentName}`);
      }).catch((error) => {
        console.error(`DynamicContent: Failed to hydrate ${componentName}:`, error);
      });
    });
  }, []);

  return <div style={{ display: "contents" }} />;
};

export default DynamicContent;