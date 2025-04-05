#!/usr/bin/env node
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read arkitect’s package.json version
const arkitectPackageJson = JSON.parse(await fs.readFile(path.join(__dirname, "../package.json"), "utf8"));
const arkitectVersion = arkitectPackageJson.version;

const command = process.argv[2];
const arg = process.argv[3];

async function initProject(projectName) {
  const projectDir = path.join(process.cwd(), projectName);
  await fs.mkdir(projectDir, { recursive: true });

  const structure = {
    "src": {
      "content": {
        "index.md": await fs.readFile(path.join(__dirname, "../templates/index.md"), "utf8")
      },
      "_data": {
        "nav.json": JSON.stringify([
          { "title": "Home", "url": "/", "icon": "home" }
        ], null, 2)
      }
    },
    "package.json": JSON.stringify({
      name: projectName,
      version: "1.0.0",
      type: "module",
      scripts: {
        "build": "arkitect build",
        "start": "arkitect start",
        "arkitect": "arkitect"
      },
      dependencies: {
        "@arthurtsang/arkitect": `^${arkitectVersion}`,
        "react": "18.2.0", // Pin React
        "react-dom": "18.2.0" // Pin React DOM
      }
    }, null, 2),
    "vite.config.js": await fs.readFile(path.join(__dirname, "../templates/vite.config.js"), "utf8")
  };

  async function writeStructure(dir, obj) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path.join(dir, key);
      if (typeof value === "string") {
        await fs.writeFile(fullPath, value);
      } else {
        await fs.mkdir(fullPath, { recursive: true });
        await writeStructure(fullPath, value);
      }
      console.log(`Created: ${fullPath}`);
    }
  }

  await writeStructure(projectDir, structure);

  console.log("Installing dependencies...");
  execSync(`cd ${projectDir} && npm install`, { stdio: "inherit" });
  console.log(`Initialized ${projectDir}. Run 'cd ${projectDir} && npm run build' to get started.`);
}

async function addTemplate(templateName) {
  const templateDir = path.join(__dirname, "../src/templates", templateName);
  const destDir = path.join(process.cwd(), "src/content", templateName);
  await fs.cp(templateDir, destDir, { recursive: true });
  console.log(`Added template ${templateName} to ${destDir}`);

  // Update nav.json with template metadata
  const templateConfigPath = path.join(templateDir, "template.json");
  const navPath = path.join(process.cwd(), "src/_data/nav.json");
  let navData = [];
  try {
    navData = JSON.parse(await fs.readFile(navPath, "utf8"));
  } catch (e) {
    console.log("No existing nav.json, using default.");
  }

  try {
    const templateConfig = JSON.parse(await fs.readFile(templateConfigPath, "utf8"));
    if (templateConfig.nav) {
      if (!navData.some(item => item.url === templateConfig.nav.url)) {
        navData.push(templateConfig.nav);
        await fs.writeFile(navPath, JSON.stringify(navData, null, 2));
        console.log(`Updated nav.json with ${templateName} entry:`, templateConfig.nav);
      } else {
        console.log(`Nav entry for ${templateConfig.nav.url} already exists, skipping.`);
      }
    }
  } catch (e) {
    console.error(`Failed to read or parse ${templateConfigPath}:`, e.message);
  }
}

function runBuild() {
  console.log("Running build...");
  execSync("node " + path.join(__dirname, "../scripts/generate-routes.js"), { stdio: "inherit" });
  execSync("vite build", { stdio: "inherit" });
  execSync(`eleventy --config=${path.join(__dirname, "../.eleventy.js")}`, { stdio: "inherit" });
  console.log("Build complete.");
}

function runStart() {
  console.log("Starting server...");
  execSync("npx serve _site", { stdio: "inherit" });
}

if (command === "init-project" && arg) {
  initProject(arg).catch(console.error);
} else if (command === "add-template" && arg) {
  addTemplate(arg).catch(console.error);
} else if (command === "build") {
  runBuild();
} else if (command === "start") {
  runStart();
} else {
  console.log("Usage: npx @arthurtsang/arkitect [init-project|add-template] <name>");
}