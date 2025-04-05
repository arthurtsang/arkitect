// arkitect/react/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Breadcrumb from "@arthurtsang/arkitect/Breadcrumb";
import JsonSchemaViewer from "@arthurtsang/arkitect/JsonSchemaViewer";

const componentModules = import.meta.glob(["~arkitect/src/components/*.jsx", "~user/react/components/*.jsx"], { eager: true });
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
    const header = layout.querySelector(".top-header")?.outerHTML || "";
    const nav = layout.querySelector(".left-nav")?.outerHTML || "";
    console.log("App v1.26: Nav content:", nav);
    console.log("App v1.26: Layout found, hydration complete");
    setLayoutData({ header, nav });
  }, []);

  if (!layoutData) return null;
  if (layoutData.error) return <div>Error: {layoutData.error}</div>;

  return (
    <BrowserRouter>
      <div className="layout">
        <header className="top-header" dangerouslySetInnerHTML={{ __html: layoutData.header }} />
        <div className="content-wrapper">
          {/* Remove .left-nav render—use Eleventy’s */}
          <div className="main-container">
            <div className="breadcrumb-wrapper">
              <Breadcrumb routes={routes} />
            </div>
            <main className="content">
              <Routes>
                <Route path="/" element={<HomeContent />} />
                <Route path="/sad/" element={<SadContent />} />
                <Route path="/sad/introduction/" element={<SadIntroContent />} />
                <Route path="/sad/overview/" element={<SadOverviewContent />} />
                <Route path="*" element={<div>404 - Not Found</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

// Hardcoded for now—dynamic syncing later
const HomeContent = () => <div><h1>Welcome to Arkitect</h1><p>Sample page.</p></div>;
const SadContent = () => <DynamicContent content={`<h1>Simple SAD</h1><p>A basic overview.</p><div data-react="JsonSchemaViewer" schemaPath="/sad/example.json"></div>`} />;
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