import React, { useEffect } from "react";

const App = () => {

  useEffect(() => {
    console.log("App: useEffect running");
    const root = document.getElementById("root");
    console.log("App: Live DOM content:", root?.innerHTML.substring(0, 200) + "...");
    console.log("App: Live DOM .layout exists:", !!document.querySelector(".layout"));
  }, []);

  return (
    <div className="layout">
      <header className="top-header">
        <div className="logo">
          <img src="/public/favicon.ico" alt="Arkitect Logo" />
          <span>Arkitect</span>
        </div>
        <div id="search-bar" className="search" />
        <div id="theme-toggle" className="right" />
      </header>
      <div className="content-wrapper">
        <nav className="left-nav" />
        <div className="main-container">
          <div className="breadcrumb-wrapper" />
          <main className="content">
            <div>Debug: Layout Loaded</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;