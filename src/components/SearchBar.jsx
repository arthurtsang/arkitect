// arkitect/src/components/SearchBar.jsx
import React from "react";

const SearchBar = () => {
  return (
    <input
      type="text"
      placeholder="Search..."
      style={{
        width: "100%", // Stretch to container
        maxWidth: "400px", // Reasonable max
        padding: "0.5rem 1rem",
        fontSize: "1rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxSizing: "border-box"
      }}
    />
  );
};

export default SearchBar;