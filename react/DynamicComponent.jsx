import React, { Suspense } from "react";
import InsertIntoElement from "./InsertIntoElement.jsx";
import { components } from "./components.js";

const DynamicComponent = ({ componentName, element, props = {} }) => {
  console.log(`DynamicComponent: Rendering ${componentName}, element:`, !!element);
  const Component = components[componentName];
  if (!Component) {
    console.error(`DynamicComponent: Component ${componentName} not found`);
    return element ? (
      <InsertIntoElement element={element}>
        <div>Error: Component {componentName} not found</div>
      </InsertIntoElement>
    ) : (
      <div>Error: Component {componentName} not found</div>
    );
  }

  if (!element) {
    console.warn(`DynamicComponent: No element for ${componentName}, rendering directly`);
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    );
  }

  return (
    <InsertIntoElement element={element} preserveContent={true}>
      <Suspense fallback={<div>Loading...</div>}>
        <Component element={element} {...props} />
      </Suspense>
    </InsertIntoElement>
  );
};

export default DynamicComponent;