// arkitect/src/components/ThemeToggle.jsx
import React, { useState, useEffect } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const lightSheet = document.getElementById("light-theme");
    const darkSheet = document.getElementById("dark-theme");
    if (isDarkMode) {
      lightSheet.disabled = true;
      darkSheet.disabled = false;
    } else {
      lightSheet.disabled = false;
      darkSheet.disabled = true;
    }
  }, [isDarkMode]);

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  return (
    <DarkModeSwitch
      checked={isDarkMode}
      onChange={toggleDarkMode}
      size={32}
      sunColor="#f39c12"
      moonColor="#7f8c8d"
    />
  );
};

export default ThemeToggle;