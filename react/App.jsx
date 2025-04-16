import React, { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InsertIntoElement from "./InsertIntoElement.jsx";
import DynamicComponent from "./DynamicComponent.jsx";
import DynamicContent from "./DynamicContent.jsx";
import { components } from "./components.js";

const App = () => {
  console.log("App: Starting render");
  const [layoutData, setLayoutData] = useState(null);
  const [error, setError] = useState(null);
  const [initialRootContent, setInitialRootContent] = useState(null);
  const hasMounted = useRef(false);

  // Debug initial DOM
  const root = document.getElementById("root");
  console.log("App: Initial render, root content:", root ? root.innerHTML.substring(0, 200) + "..." : "No root");
  console.log("App: Initial render, .layout exists:", !!document.querySelector(".layout"));

  useEffect(() => {
    if (hasMounted.current) {
      console.log("App: useEffect skipped, already mounted");
      return;
    }
    hasMounted.current = true;

    console.log("App: useEffect running");
    const root = document.getElementById("root");
    console.log("App: useEffect, root content:", root ? root.innerHTML.substring(0, 200) + "..." : "No root");
    console.log("App: useEffect, .layout exists:", !!document.querySelector(".layout"));
    setInitialRootContent(root ? root.innerHTML : "No root");

    const maxAttempts = 5;
    let attempts = 0;

    const attemptQuery = () => {
      attempts++;
      console.log(`App: Attempt ${attempts}/${maxAttempts} to query DOM`);
      const root = document.getElementById("root");
      console.log("App: Current root content:", root ? root.innerHTML.substring(0, 200) + "..." : "No root");
      const layoutElement = document.querySelector(".layout");
      if (!layoutElement) {
        console.error(`App: Layout element not found (attempt ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          setTimeout(attemptQuery, 100);
          return;
        }
        setError("Layout element not found after multiple attempts");
        return;
      }

      const data = {
        searchBar: layoutElement.querySelector("#search-bar"),
        themeToggle: layoutElement.querySelector("#theme-toggle"),
        breadcrumbWrapper: layoutElement.querySelector(".breadcrumb-wrapper"),
        content: layoutElement.querySelector(".content")
      };

      console.log("App: Queried elements:", {
        searchBar: !!data.searchBar,
        themeToggle: !!data.themeToggle,
        breadcrumbWrapper: !!data.breadcrumbWrapper,
        content: !!data.content
      });

      if (!data.content) {
        console.error(`App: Missing .content element (attempt ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          setTimeout(attemptQuery, 100);
          return;
        }
        setError("Missing critical .content element");
        return;
      }

      console.log("App: Layout data set:", Object.keys(data));
      setLayoutData(data);
    };

    attemptQuery();
  }, []);

  if (error) {
    return (
      <div id="root">
        <div style={{ padding: "20px", color: "red" }}>
          Error: {error}. Initial root had layout: {initialRootContent?.includes('class="layout"') ? "yes" : "no"}.
        </div>
      </div>
    );
  }

  if (!layoutData) {
    console.log("App: Waiting for layoutData");
    return <div id="root" />;
  }

  const routes = window.__ARKITECT_ROUTES__ || [];

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
              <Route path="*" element={<div>404 - Not Found</div>} />
            </Routes>
          </React.Suspense>
        </InsertIntoElement>
      </BrowserRouter>
    </div>
  );
};

export default App;