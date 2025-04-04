# How the Breadcrumb Works

## Overview

The breadcrumb in @arthurtsang/arkitect-app/Breadcrumb dynamically displays the navigation trail based on the current URL and routes.json, with dropdown menus for parent routes that have child pages. It integrates with React Router in App.jsx to ensure URL changes update both the breadcrumb and content.

## Key Components

1. Breadcrumb.jsx (@arthurtsang/arkitect-app):
    * Imports: Uses useLocation from react-router-dom for the current path, and MUI components (Breadcrumbs, Link, Typography, Menu, etc.) for rendering.
    * Logic:
        * Hides on / (homepage).
        * Splits the URL into segments (e.g., /sad/overview/ → ["sad", "overview"]).
        * Matches segments against routes.json to build the trail (e.g., /, /sad/, /sad/overview/).
        * Renders each segment:
            * Non-last items are Links (clickable).
            * Items with toc (child pages) get a dropdown (Menu) via IconButton, unless a deeper path is active.
            * Last item is Typography (plain text) if no deeper path exists.
        * Dropdown: Triggered by hasChildren && (!isLast || !isDeeperPath), showing toc entries as MenuItems linked via RouterLink.
    * routes.json (Generated):
        * Created by generate-routes.js during npm run prebuild.
        * Structure: Array of objects with path, breadcrumb, and toc (child pages).
        * Example:

        ```json
        [
          { "path": "/", "breadcrumb": "Home", "toc": [] },
          { "path": "/sad/", "breadcrumb": "Software Architecture Document (Simple)", "toc": [
            { "url": "/sad/introduction/", "title": "Introduction" },
            { "url": "/sad/overview/", "title": "Overview" }
          ] },
          { "path": "/sad/overview/", "breadcrumb": "Overview", "toc": [] }
        ]
        ```

        * toc is populated by scanning child paths (e.g., /sad/introduction/ under /sad/).
    * App.jsx (remcs2/react):
        * Uses BrowserRouter, Routes, and Route to map URLs to content components.
        * Renders <Breadcrumb routes={routes} /> in .breadcrumb-wrapper.
        * Hydrates static header and nav from .layout, but content updates dynamically via routing.
    * styles.css (remcs2/public):
        * Modernizes the look: Inter font, dark slate header, blue links, shadows.
        * Positions breadcrumb below header, right of nav, above content with flex-direction: column in .main-container.

## Flow

    * User visits /sad/overview/:
        * useLocation gets /sad/overview/.
        * Breadcrumb matches /, /sad/, /sad/overview/ from routes.json.
        * Renders Home / Software Architecture Document (Simple) / Overview:
            * Home and “Software Architecture Document (Simple)” are links.
            * “Software Architecture Document (Simple)” has a dropdown (Introduction, Overview).
            * “Overview” is plain text (last item).
        * Clicking “Introduction” updates URL to /sad/introduction/, Routes re-renders content, breadcrumb adjusts.

## Important Gotchas

    * npm link Context Issues:
        * Problem: Using npm link for @arthurtsang/arkitect-app caused multiple react-router-dom instances, breaking the router context (useLocation failed).
        * Fix: Published to GitHub Packages, installed via npm install --force, and used resolutions to enforce one react-router-dom@7.4.1.
        * Lesson: Avoid npm link for libraries with React hooks—use published packages or file dependencies.
    * Static Hydration vs. Routing:
        * Problem: Initial App.jsx hydrated content from .content on mount, not updating with URL changes.
        * Fix: Switched to Routes/Route for dynamic content rendering.
        * Lesson: Use React Router’s routing for navigation-driven content, not DOM parsing.
    * Breadcrumb Trail Truncation:
        * Problem: Breadcrumb stopped at the first toc item, omitting deeper segments (e.g., no “Overview” on /sad/overview/).
        * Fix: Updated logic to include all matching routes, not just up to toc.
        * Lesson: Ensure breadcrumb logic reflects the full URL path, not just parent nodes.
    * Dropdown Disappearance:
        * Problem: Last item with toc (e.g., /sad/) lost its dropdown due to !isLast condition.
        * Fix: Added !isDeeperPath to show dropdowns for toc items unless a child is active.
        * Lesson: Balance isLast with path depth to preserve interactivity.
    * Layout Misalignment:
        * Problem: Breadcrumb appeared above header or in columns with content.
        * Fix: Moved <Breadcrumb /> to .breadcrumb-wrapper and set .main-container { flex-direction: column; }.
        * Lesson: Sync React rendering with template structure (e.g., layout.njk) and CSS.
    * TOC Generation:
        * Problem: generate-routes.js included self-references in toc (e.g., /sad/ in /sad/’s toc).
        * Fix: Added route.path !== parentRoute.path to exclude self.
        * Lesson: Validate hierarchical data to avoid circular references.