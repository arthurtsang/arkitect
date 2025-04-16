import React, { Suspense } from "react";
import InsertIntoElement from "./InsertIntoElement.jsx";
import { components } from "./components.js";

const DynamicComponent = ({ componentName, element, props = {} }) => {
  const Component = components[componentName];
  if (!Component) {
    console.error(`DynamicComponent: Component ${componentName} not found`);
    return (
      <InsertIntoElement element={element}>
        <div>Error: Component {componentName} not found</div>
      </InsertIntoElement>
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