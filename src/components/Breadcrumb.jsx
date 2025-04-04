// arkitect-app/src/components/Breadcrumb.jsx
import React, { useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Breadcrumb = ({ routes }) => {
  console.log("Breadcrumb: Starting render");
  console.log("Breadcrumb: useLocation imported:", typeof useLocation === "function");
  try {
    const location = useLocation();
    console.log("Breadcrumb: useLocation succeeded, pathname:", location.pathname);
    const path = location.pathname;

    if (path === "/") {
      console.log("Breadcrumb: Hiding on homepage");
      return null;
    }

    const pathSegments = path.split("/").filter((segment) => segment);
    const breadcrumbs = [];
    let currentPath = "";

    // Build breadcrumb trail for all matching routes
    for (let i = 0; i <= pathSegments.length; i++) {
      const segmentPath = i === 0 ? "/" : `/${pathSegments.slice(0, i).join("/")}/`;
      const route = routes.find((r) => r.path === segmentPath);
      if (route) {
        breadcrumbs.push({
          path: route.path,
          breadcrumb: route.breadcrumb,
          toc: Array.isArray(route.toc) ? route.toc : [],
        });
      }
    }

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    console.log("Breadcrumb: Rendering breadcrumbs:", breadcrumbs);
    return (
      <Breadcrumbs aria-label="breadcrumb" separator="/">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const hasChildren = crumb.toc.length > 0;
          const isDeeperPath = path.length > crumb.path.length && path.startsWith(crumb.path);

          if (hasChildren && (!isLast || !isDeeperPath)) {
            return (
              <div key={crumb.path} style={{ display: "flex", alignItems: "center" }}>
                <Link
                  component={RouterLink}
                  to={crumb.path}
                  color="inherit"
                  underline="hover"
                >
                  {crumb.breadcrumb}
                </Link>
                <IconButton
                  size="small"
                  onClick={handleClick}
                  aria-controls={open ? "child-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <ArrowDropDownIcon />
                </IconButton>
                <Menu
                  id="child-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{ "aria-labelledby": "child-button" }}
                >
                  {crumb.toc.map((child) => (
                    <MenuItem
                      key={child.url}
                      onClick={handleClose}
                      component={RouterLink}
                      to={child.url}
                    >
                      {child.title}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            );
          }

          return isLast ? (
            <Typography key={crumb.path} color="text.primary">
              {crumb.breadcrumb}
            </Typography>
          ) : (
            <Link
              key={crumb.path}
              component={RouterLink}
              to={crumb.path}
              color="inherit"
              underline="hover"
            >
              {crumb.breadcrumb}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  } catch (error) {
    console.error("Breadcrumb: Error during render:", error.message);
    return <div>Breadcrumb Error: {error.message}</div>;
  }
};

export default Breadcrumb;