import React, { useEffect, useRef } from "react";

const InsertIntoElement = ({ element, children, preserveContent = false }) => {
  console.log("InsertIntoElement: Rendering, element:", !!element, "preserveContent:", preserveContent);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!element) {
      console.warn("InsertIntoElement: No element provided");
      return;
    }
    if (!containerRef.current) {
      console.warn("InsertIntoElement: Container ref not set");
      return;
    }

    if (!preserveContent) {
      element.innerHTML = "";
    }
    element.appendChild(containerRef.current);
    console.log("InsertIntoElement: Appended to element");

    return () => {
      if (element.contains(containerRef.current)) {
        element.removeChild(containerRef.current);
      }
    };
  }, [element, preserveContent]);

  return <div ref={containerRef}>{children}</div>;
};

export default InsertIntoElement;