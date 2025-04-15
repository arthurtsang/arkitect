// arkitect/react/App.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Use exports from index.js

const componentModules = import.meta.glob(["./../src/components/*.jsx", "./../../../src/components/*.jsx"], { eager: true });
const components = {};
for (const [path, module] of Object.entries(componentModules)) {
  const componentName = path.split("/").pop().replace(".jsx", "");
  const Component = module.default;
  console.log(`App: Inspecting component ${componentName}`, module);
  if (typeof Component === "function") {
    components[componentName] = Component;
    console.log("App: Loaded component:", componentName, typeof Component, "[Debug #999]");
  } else {
    console.error(`App: Component ${componentName} is not a valid React component.`, module);
    components[componentName] = () => <div>Error: Invalid component {componentName}</div>;
  }
}

const App = () => {
  console.log("App v1.27: Starting render");
  const [layoutData, setLayoutData] = useState(null);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    console.log("App v1.27: useEffect running");
    const layout = document.querySelector(".layout");
    if (!layout) {
      console.error("App v1.27: Layout element not found");
      setLayoutData({ error: "Layout not found" });
      return;
    }
    const breadcrumbWrapper = layout.querySelector(".breadcrumb-wrapper");
    const content = layout.querySelector(".content");
    const searchBar = layout.querySelector("#search-bar");
    const themeToggle = layout.querySelector("#theme-toggle");
    console.log("App v1.27: Layout found, hydration complete");
    setLayoutData({ breadcrumbWrapper, content, searchBar, themeToggle });

    // Dynamically load routes
    import("~user/_data/routes.json")
      .then((module) => {
        setRoutes(module.default);
        console.log("App v1.27: Routes loaded:", module.default);
      })
      .catch((err) => console.error("App v1.27: Failed to load routes:", err));

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDomContentLoaded);
    } else {
      onDomContentLoaded();
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", onDomContentLoaded);
    };
  }, []);

  if (!layoutData || !routes.length) return null;
  if (layoutData.error) return <div>Error: {layoutData.error}</div>;

  const DynamicComponent = ({ componentName, element, props = {} }) => {
    console.log("DynamicComponent: Attempting to render component:", componentName, "with props:", props);
    const Component = components[componentName];
    if (!Component || typeof Component !== "function") {
      console.error(`DynamicComponent: Component ${componentName} is not a valid React component.`, Component);
      return <InsertIntoElement element={element}><div>Error: Component {componentName} is invalid or not found</div></InsertIntoElement>;
    }
    console.log("DynamicComponent: Successfully resolved component:", componentName);
    return <InsertIntoElement element={element}><Component {...props} /></InsertIntoElement>;
  };

  return (
    <BrowserRouter>
      <DynamicComponent componentName="SearchBar" element={layoutData.searchBar} />
      <DynamicComponent componentName="ThemeToggle" element={layoutData.themeToggle} />
      <DynamicComponent componentName="Breadcrumb" element={layoutData.breadcrumbWrapper} props={{ routes }} />
      <InsertIntoElement element={layoutData.content} preserveContent={true}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<DynamicContent />}
            />
          ))}
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </InsertIntoElement>
    </BrowserRouter>
  );
};

const InsertIntoElement = ({ element, children, preserveContent = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (element && !mounted) {
      if (!preserveContent) element.innerHTML = "";
      setMounted(true);
    }
  }, [element, mounted, preserveContent]);

  return element && mounted ? createPortal(children, element) : null;
};

const DynamicContent = () => {
  const contentElement = document.querySelector(".content");
  const content = contentElement ? contentElement.innerHTML : "<div>No content available</div>";
  console.log("DynamicContent: Starting render with content:", content);

  try {
    const elements = [];
    let lastIndex = 0;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const reactElements = doc.querySelectorAll("[data-react]");

    console.log("DynamicContent: Found data-react elements:", reactElements.length);
    reactElements.forEach((el, index) => {
      const componentName = el.getAttribute("data-react");
      const Component = components[componentName];
      const props = Array.from(el.attributes)
        .filter((attr) => attr.name !== "data-react")
        .reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {});

      const htmlBefore = content.substring(lastIndex, content.indexOf(el.outerHTML));
      if (htmlBefore) {
        elements.push(<span key={`html-${index}`} dangerouslySetInnerHTML={{ __html: htmlBefore }} />);
      }

      if (Component) {
        console.log("DynamicContent: Rendering component:", componentName);
        elements.push(<Component key={`component-${index}`} {...props} />);
      } else {
        console.warn(`DynamicContent: Component ${componentName} not found`);
        elements.push(<span key={`missing-${index}`} dangerouslySetInnerHTML={{ __html: el.outerHTML }} />);
      }

      lastIndex = content.indexOf(el.outerHTML) + el.outerHTML.length;
    });

    const htmlAfter = content.substring(lastIndex);
    if (htmlAfter) elements.push(<span key="html-end" dangerouslySetInnerHTML={{ __html: htmlAfter }} />);
    console.log("DynamicContent: Rendered elements:", elements);
    return <>{elements}</>;
  } catch (error) {
    console.error("DynamicContent: Error during render:", error.message);
    return <div>Error in DynamicContent: {error.message}</div>;
  }
};

export default App;