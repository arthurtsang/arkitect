import React from "react";

const InsertIntoElement = ({ element, children, preserveContent = false }) => {
  if (!element) {
    console.warn("InsertIntoElement: No element provided");
    return null;
  }

  // If preserveContent is true, keep existing DOM content
  const content = preserveContent ? (
    <>
      <div dangerouslySetInnerHTML={{ __html: element.innerHTML }} />
      {children}
    </>
  ) : (
    children
  );

  return content;
};

export default InsertIntoElement;