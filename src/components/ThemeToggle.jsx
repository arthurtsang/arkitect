import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  console.log("ThemeToggle: Rendering");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const lightSheet = document.getElementById("light-theme");
    const darkSheet = document.getElementById("dark-theme");
    if (isDarkMode) {
      lightSheet.disabled = true;
      darkSheet.disabled = false;
      localStorage.setItem("theme", "dark");
    } else {
      lightSheet.disabled = false;
      darkSheet.disabled = true;
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.5rem"
      }}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;