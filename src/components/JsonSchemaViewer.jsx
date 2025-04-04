// arkitect/src/components/JsonSchemaViewer.jsx
import React, { useState, useEffect } from "react";
import JSONView from "react-json-view-lite"; // Changed from @uiw/react-json-view
import "react-json-view-lite/dist/index.css"; // Import styles

const JsonSchemaViewer = ({ schemaPath }) => {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSchema() {
      try {
        console.log("JsonSchemaViewer: Fetching schema from:", schemaPath);
        const response = await fetch(schemaPath);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const data = await response.json();
        setSchema(data);
        console.log("JsonSchemaViewer: Schema loaded:", data);
      } catch (err) {
        setError(err.message);
        console.error("JsonSchemaViewer: Error:", err);
      }
    }
    if (schemaPath) fetchSchema();
  }, [schemaPath]);

  if (error) {
    return (
      <div style={{ color: "#e53e3e", padding: "15px", border: "1px solid #e53e3e", borderRadius: "6px" }}>
        Error: {error}
      </div>
    );
  }

  if (!schema) {
    return <div style={{ padding: "15px" }}>Loading schema...</div>;
  }

  return (
    <div style={{ padding: "15px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff" }}>
      <h3>JSON Schema Viewer</h3>
      <JSONView
        data={schema}
        shouldExpandNode={() => false} // Collapse by default
        style={{ padding: "10px", borderRadius: "4px", background: "#f7fafc" }}
      />
    </div>
  );
};

export default JsonSchemaViewer;