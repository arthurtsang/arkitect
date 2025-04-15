// arkitect/src/components/JsonSchemaViewer.jsx
import React, { useState, useEffect } from "react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

const JsonSchemaViewer = ({ schemaPath }) => {
  console.log("JsonSchemaViewer: Rendering with schemaPath:", schemaPath);
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

  if (error) return <div>Error: {error}</div>;
  if (!schema) return <div style={{ padding: "15px" }}>Loading schema...</div>;

  return <JsonView data={schema} shouldExpandNode={() => false} />;
};

export default JsonSchemaViewer;