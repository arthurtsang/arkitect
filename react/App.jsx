import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InsertIntoElement from "./InsertIntoElement.jsx";
import DynamicComponent from "./DynamicComponent.jsx";
import DynamicContent from "./DynamicContent.jsx";
import { components } from "./components.js";

const App = () => {
  console.log("App: Starting render");
  const [layoutData, setLayoutData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("App: useEffect running");
    const maxAttempts = 5;
    let attempts = 0;

    const attemptQuery = () => {
      attempts++;
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

      if (!data.searchBar || !data.themeToggle || !data.breadcrumbWrapper || !data.content) {
        console.error(`App: Missing layout elements (attempt ${attempts}/${maxAttempts}):`, data);
        if (attempts < maxAttempts) {
          setTimeout(attemptQuery, 100);
          return;
        }
        setError("Missing required layout elements");
        return;
      }

      console.log("App: Layout data:", data);
      setLayoutData(data);
    };

    attemptQuery();
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: {error}. Please check the Eleventy template configuration.
      </div>
    );
  }

  if (!layoutData) {
    console.log("App: Waiting for layoutData");
    return <div style={{ padding: "20px" }}>Loading layout...</div>;
  }

  const routes = window.__ARKITECT_ROUTES__ || [];

  return (
    <BrowserRouter>
      <DynamicComponent componentName="SearchBar" element={layoutData.searchBar} />
      <DynamicComponent componentName="ThemeToggle" element={layoutData.themeToggle} />
      <DynamicComponent componentName="Breadcrumb" element={layoutData.breadcrumbWrapper} props={{ routes }} />
      <InsertIntoElement element={layoutData.content} preserveContent={true}>
        <Suspense fallback={<div>Loading...</div>}>
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
        </Suspense>
      </InsertIntoElement>
    </BrowserRouter>
  );
};

export default App;