import React, { useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle("dark-mode");
  };
  return <button onClick={toggleTheme}>{isDark ? "Light" : "Dark"} Mode</button>;
}