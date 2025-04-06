// arkitect/react/App.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Breadcrumb from "@arthurtsang/arkitect/Breadcrumb";
import SearchBar from "@arthurtsang/arkitect/SearchBar";
import ThemeToggle from "@arthurtsang/arkitect/ThemeToggle";
import JsonSchemaViewer from "@arthurtsang/arkitect/JsonSchemaViewer";

const componentModules = import.meta.glob(["./../src/components/*.jsx", "./../../../src/components/*.jsx"], { eager: true });
const components = {};
for (const [path, module] of Object.entries(componentModules)) {
  const componentName = path.split("/").pop().replace(".jsx", "");
  components[componentName] = module.default;
  console.log("App v1.26: Loaded component:", componentName);
}

const routes = (await import("~user/src/_data/routes.json")).default;

const App = () => {
  console.log("App v1.26: Starting render");
  const [layoutData, setLayoutData] = useState(null);

  useEffect(() => {
    console.log("App v1.26: useEffect running");
    const layout = document.querySelector(".layout");
    if (!layout) {
      console.error("App v1.26: Layout element not found");
      setLayoutData({ error: "Layout not found" });
      return;
    }
    const breadcrumbWrapper = layout.querySelector(".breadcrumb-wrapper");
    const content = layout.querySelector(".content");
    const searchBar = layout.querySelector("#search-bar");
    const themeToggle = layout.querySelector("#theme-toggle");
    console.log("App v1.26: Layout found, hydration complete");
    setLayoutData({ breadcrumbWrapper, content, searchBar, themeToggle });
  }, []);

  if (!layoutData) return null;
  if (layoutData.error) return <div>Error: {layoutData.error}</div>;

  return (
    <BrowserRouter>
      <InsertIntoElement element={layoutData.searchBar}>
        <SearchBar />
      </InsertIntoElement>
      <InsertIntoElement element={layoutData.themeToggle}>
        <ThemeToggle />
      </InsertIntoElement>
      <InsertIntoElement element={layoutData.breadcrumbWrapper}>
        <Breadcrumb routes={routes} />
      </InsertIntoElement>
      <InsertIntoElement element={layoutData.content} preserveContent={true}>
        <Routes>
          <Route path="/" element={<HomeContent />} />
          <Route path="/sad/" element={<SadContent />} />
          <Route path="/sad/introduction/" element={<SadIntroContent />} />
          <Route path="/sad/overview/" element={<SadOverviewContent />} />
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </InsertIntoElement>
    </BrowserRouter>
  );
};

// Helper to insert React content into DOM element
const InsertIntoElement = ({ element, children, preserveContent = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (element && !mounted) {
      if (!preserveContent) element.innerHTML = ""; // Clear only if not preserving
      setMounted(true);
    }
  }, [element, mounted, preserveContent]);

  return element && mounted ? createPortal(children, element) : null;
};

const HomeContent = () => <div><h1>Welcome to Arkitect</h1><p>Sample page.</p></div>;
const SadContent = () => <DynamicContent content={`<h1>Simple SAD</h1><p>A basic overview.</p><div data-react="JsonSchemaViewer" schemaPath="/sad/example.json"></div><p>More content below the component.</p>`} />;
const SadIntroContent = () => <div><h1>Introduction</h1><p>Intro to SAD.</p></div>;
const SadOverviewContent = () => <div><h1>Overview</h1><p>Overview of SAD.</p></div>;

const DynamicContent = ({ content }) => {
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
        .filter(attr => attr.name !== "data-react")
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