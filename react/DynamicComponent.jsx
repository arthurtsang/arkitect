import React, { Suspense } from "react";
import InsertIntoElement from "./InsertIntoElement.jsx";
import { components } from "./components.js";

const DynamicComponent = ({ componentName, element, props = {} }) => {
  console.log(`DynamicComponent: Rendering ${componentName}, element:`, !!element);
  const Component = components[componentName];
  if (!Component) {
    console.error(`DynamicComponent: Component ${componentName} not found`);
    return element ? (
      <Insert kintoElement element={element}>
        <div>Error: Component {componentName} not found</div>
      </InsertIntoElement>
    ) : (
      <div>Error: Component {componentName} not found</div>
    );
  }

  if (!element) {
    console.warn(`DynamicComponent: No element provided for ${componentName}, rendering directly`);
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  }

  return (
    <InsertIntoElement element={element}>
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    </InsertIntoElement>
  );
};

export default DynamicComponent;