import React, { useEffect } from "react";
import styled from "@emotion/styled";

const Button = styled.button`
  padding: 8px 16px;
  cursor: pointer;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ThemeToggle = ({ element }) => {
  console.log("ThemeToggle: Rendering, element:", !!element);

  useEffect(() => {
    console.log("ThemeToggle: useEffect running");
    if (!element) {
      console.warn("ThemeToggle: No element provided");
      return;
    }

    const themeSheet = document.querySelector("#theme");
    if (!themeSheet) {
      console.error("ThemeToggle: Theme stylesheet (#theme) not found");
      return;
    }

    const toggleTheme = () => {
      const isDark = document.documentElement.classList.toggle("dark");
      document.documentElement.classList.toggle("light", !isDark);
      console.log("ThemeToggle: Toggled to", isDark ? "dark" : "light");
    };

    element.addEventListener("click", toggleTheme);
    return () => element.removeEventListener("click", toggleTheme);
  }, [element]);

  if (!element) {
    return <Button disabled>Toggle Theme</Button>;
  }

  return null;
};

export default ThemeToggle;