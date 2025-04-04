import React, { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}