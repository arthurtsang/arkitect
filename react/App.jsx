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
    const attemptQuery = () => {
      const layoutElement = document.querySelector(".layout");
      if (!layoutElement) {
        console.error("App: Layout element not found");
        setError("Layout element not found");
        return;
      }

      const data = {
        searchBar: layoutElement.querySelector("#search-bar"),
        themeToggle: layoutElement.querySelector("#theme-toggle"),
        breadcrumbWrapper: layoutElement.querySelector(".breadcrumb-wrapper"),
        content: layoutElement.querySelector(".content")
      };

      console.log("App: Layout data:", data);
      setLayoutData(data);
    };

    // Try immediately
    attemptQuery();

    // Retry after a short delay to handle slow DOM loading
    const timeout = setTimeout(attemptQuery, 100);
    return () => clearTimeout(timeout);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!layoutData) {
    console.log("App: Waiting for layoutData");
    return <div>Loading layout...</div>;
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