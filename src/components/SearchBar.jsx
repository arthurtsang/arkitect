import React, { useState, useEffect } from "react";

const SearchBar = () => {
  console.log("SearchBar: Rendering");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Load routes for search
    import("~user/_data/routes.json")
      .then((module) => {
        setRoutes(module.default);
        console.log("SearchBar: Routes loaded:", module.default);
      })
      .catch((err) => console.error("SearchBar: Failed to load routes:", err));
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    const filtered = routes.filter((route) =>
      route.breadcrumb.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, routes]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleSearch}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxSizing: "border-box"
        }}
      />
      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxWidth: "400px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            listStyle: "none",
            margin: 0,
            padding: 0,
            zIndex: 1000
          }}
        >
          {results.map((result) => (
            <li key={result.path}>
              <a
                href={result.path}
                style={{
                  display: "block",
                  padding: "0.5rem 1rem",
                  textDecoration: "none",
                  color: "#333"
                }}
              >
                {result.breadcrumb}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;