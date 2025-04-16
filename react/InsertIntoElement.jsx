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

    const liveElement = document.getElementById(element.id) || element;
    if (!liveElement) {
      console.error("InsertIntoElement: Live element not found");
      return;
    }

    if (!preserveContent) {
      liveElement.innerHTML = "";
    }
    liveElement.appendChild(containerRef.current);
    console.log("InsertIntoElement: Appended to live element:", liveElement.id || liveElement.className);

    return () => {
      if (liveElement.contains(containerRef.current)) {
        liveElement.removeChild(containerRef.current);
      }
    };
  }, [element, preserveContent]);

  return <div ref={containerRef}>{children}</div>;
};

export default InsertIntoElement;