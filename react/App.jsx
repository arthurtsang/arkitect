import React, { useEffect, useState, useRef, memo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InsertIntoElement from "./InsertIntoElement.jsx";
import DynamicComponent from "./DynamicComponent.jsx";
import DynamicContent from "./DynamicContent.jsx";
import { components } from "./components.js";

const App = memo(() => {
  console.log("App: Starting render");
  const [layoutData, setLayoutData] = useState(null);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const savedDomRef = useRef(null);

  const root = document.getElementById("root");
  if (root && !savedDomRef.current) {
    savedDomRef.current = root.cloneNode(true);
    console.log("App: Saved initial DOM:", savedDomRef.current.innerHTML.substring(0, 200) + "...");
    console.log("App: Saved DOM .layout exists:", !!savedDomRef.current.querySelector(".layout"));
  }

  useEffect(() => {
    console.log("App: useEffect running");
    console.log("App: Live DOM content:", document.getElementById("root")?.innerHTML.substring(0, 200) + "...");
    console.log("App: Live DOM .layout exists:", !!document.querySelector(".layout"));

    if (!savedDomRef.current) {
      console.error("App: Saved DOM not available");
      setError("Saved DOM not found");
      return;
    }

    const layoutElement = savedDomRef.current.querySelector(".layout");
    if (!layoutElement) {
      console.error("App: Layout element not found in saved DOM");
      setError("Layout element not found in saved DOM");
      return;
    }

    const data = {
      searchBar: layoutElement.querySelector("#search-bar") || null,
      themeToggle: layoutElement.querySelector("#theme-toggle") || null,
      breadcrumbWrapper: layoutElement.querySelector(".breadcrumb-wrapper") || null,
      content: layoutElement.querySelector(".content") || null
    };

    console.log("App: Queried saved DOM elements:", {
      searchBar: !!data.searchBar,
      themeToggle: !!data.themeToggle,
      breadcrumbWrapper: !!data.breadcrumbWrapper,
      content: !!data.content
    });

    console.log("App: Layout data set:", Object.keys(data));
    setLayoutData(data);

    // Poll for routes
    const checkRoutes = () => {
      if (window.__ARKITECT_ROUTES__ && window.__ARKITECT_ROUTES__.length > 0) {
        console.log("App: Routes loaded:", window.__ARKITECT_ROUTES__);
        setRoutes(window.__ARKITECT_ROUTES__);
      } else {
        setTimeout(checkRoutes, 50);
      }
    };
    checkRoutes();
  }, []);

  if (error) {
    console.log("App: Rendering error state");
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: {error}. Initial DOM had layout: {savedDomRef.current?.querySelector(".layout") ? "yes" : "no"}.
      </div>
    );
  }

  if (!layoutData) {
    console.log("App: Waiting for layoutData");
    return (
      <div id="root">
        <div className="layout">
          <header className="top-header">
            <div className="logo" />
            <div id="search-bar" className="search" />
            <div id="theme-toggle" className="right" />
          </header>
          <div className="content-wrapper">
            <nav className="left-nav" />
            <div className="main-container">
              <div className="breadcrumb-wrapper" />
              <main className="content" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="root">
      <BrowserRouter>
        {layoutData.searchBar && (
          <DynamicComponent componentName="SearchBar" element={layoutData.searchBar} />
        )}
        {layoutData.themeToggle && (
          <DynamicComponent componentName="ThemeToggle" element={layoutData.themeToggle} />
        )}
        {layoutData.breadcrumbWrapper && (
          <DynamicComponent
            componentName="Breadcrumb"
            element={layoutData.breadcrumbWrapper}
            props={{ routes }}
          />
        )}
        {layoutData.content && (
          <InsertIntoElement element={layoutData.content} preserveContent={true}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<DynamicContent />}
                  />
                ))}
                <Route path="*" element={<div>Loading content...</div>} />
              </Routes>
              {routes.length === 0 && <DynamicContent />}
            </React.Suspense>
          </InsertIntoElement>
        )}
      </BrowserRouter>
    </div>
  );
});

export default App;