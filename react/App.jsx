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
    const maxAttempts = 10;
    let attempts = 0;

    const attemptQuery = () => {
      attempts++;
      console.log(`App: Attempt ${attempts}/${maxAttempts} to query DOM`);
      const layoutElement = document.querySelector(".layout");
      if (!layoutElement) {
        console.error(`App: Layout element not found (attempt ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          setTimeout(attemptQuery, 200);
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
        console.error(`App: Missing critical .content element (attempt ${attempts}/${maxAttempts})`);
        if (attempts < maxAttempts) {
          setTimeout(attemptQuery, 200);
          return;
        }
        setError("Missing critical .content element");
        return;
      }

      console.log("App: Layout data set:", data);
      setLayoutData(data);
    };

    attemptQuery();
  }, []);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: {error}. Check if Eleventy’s layout.njk includes .layout.
      </div>
    );
  }

  if (!layoutData) {
    console.log("App: Waiting for layoutData");
    return null; // Avoid rendering until DOM is ready
  }

  const routes = window.__ARKITECT_ROUTES__ || [];

  return (
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
  );
};

export default App;