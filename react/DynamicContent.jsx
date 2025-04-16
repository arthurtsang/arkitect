import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { components } from "./components.js";

const DynamicContent = () => {
  console.log("DynamicContent: Rendering");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkDom = () => {
      const contentElement = document.querySelector(".content");
      if (contentElement && contentElement.innerHTML.includes("data-react")) {
        console.log("DynamicContent: DOM ready, processing react elements");
        setMounted(true);
      } else {
        console.log("DynamicContent: DOM not ready, retrying");
        setTimeout(checkDom, 50);
      }
    };
    checkDom();
  }, []);

  useEffect(() => {
    if (!mounted) return;

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

      const wrapper = document.createElement("div");
      element.appendChild(wrapper);
      console.log(`DynamicContent: Rendering ${componentName} in`, element);

      const props = {};
      for (const attr of element.attributes) {
        if (attr.name.startsWith("data-") && attr.name !== "data-react") {
          const propName = attr.name.replace("data-", "").replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          props[propName] = attr.value;
        }
      }
      console.log(`DynamicContent: Props for ${componentName}:`, props);

      try {
        const root = createRoot(wrapper);
        root.render(<Component {...props} />);
        console.log(`DynamicContent: Rendered ${componentName}`);
      } catch (error) {
        console.error(`DynamicContent: Failed to render ${componentName}:`, error);
      }
    });
  }, [mounted]);

  return <div style={{ display: "contents" }} />;
};

export default DynamicContent;