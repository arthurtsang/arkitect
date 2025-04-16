#!/usr/bin/env node
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read arkitect’s package.json version and peerDependencies
const arkitectPackageJson = JSON.parse(await fs.readFile(path.join(__dirname, "../package.json"), "utf8"));
const arkitectVersion = arkitectPackageJson.version;
const peerDependencies = Object.keys(arkitectPackageJson.peerDependencies);

const command = process.argv[2];
const arg = process.argv[3];

async function initProject(projectName) {
  const projectDir = path.join(process.cwd(), projectName);
  await fs.mkdir(projectDir, { recursive: true });

  // Override the version in the package.json template
  const packageJsonTemplatePath = path.join(__dirname, "../templates/package.json");
  const packageJsonTemplate = JSON.parse(await fs.readFile(packageJsonTemplatePath, "utf8"));
  packageJsonTemplate.version = arkitectVersion;

  const indexJsxTemplatePath = path.join(__dirname, "../templates/index.jsx");
  const viteConfigTemplatePath = path.join(__dirname, "../templates/vite.config.js");
  let viteConfigContent = await fs.readFile(viteConfigTemplatePath, "utf8");

  // Replace external array with peerDependencies, excluding react, react-dom, and react-router-dom
  // const externalList = JSON.stringify(
  //   peerDependencies.filter(dep => !["react", "react-dom", "react-router-dom"].includes(dep))
  // );
  // viteConfigContent = viteConfigContent.replace(
  //   /external: \[\]/,
  //   `external: ${externalList}`
  // );

  const structure = {
    "src": {
      "content": {
        "index.md": await fs.readFile(path.join(__dirname, "../templates/index.md"), "utf8")
      },
      "_data": {
        "nav.json": JSON.stringify([
          { "title": "Home", "url": "/", "icon": "home" }
        ], null, 2),
        "routes.json": JSON.stringify([], null, 2)
      },
      "index.jsx": await fs.readFile(indexJsxTemplatePath, "utf8")
    },
    "public": {
      "light.css": await fs.readFile(path.join(__dirname, "../src/public/light.css"), "utf8"),
      "dark.css": await fs.readFile(path.join(__dirname, "../src/public/dark.css"), "utf8")
    },
    "_includes": {
      "layout.njk": await fs.readFile(path.join(__dirname, "../src/_includes/layout.njk"), "utf8"),
      "header.njk": await fs.readFile(path.join(__dirname, "../src/_includes/header.njk"), "utf8"),
      "nav.njk": await fs.readFile(path.join(__dirname, "../src/_includes/nav.njk"), "utf8"),
      "toc.njk": await fs.readFile(path.join(__dirname, "../src/_includes/toc.njk"), "utf8")
    },
    "package.json": JSON.stringify({
      ...packageJsonTemplate,
      name: projectName,
      description: `${projectName} generated by Arkitect`,
      type: "module",
      dependencies: {
        ...arkitectPackageJson.peerDependencies,
        "@arthurtsang/arkitect": `^${arkitectVersion}`
      }
    }, null, 2),
    "vite.config.js": viteConfigContent,
    ".eleventy.js": await fs.readFile(path.join(__dirname, "../.eleventy.js"), "utf8")
  };

  async function writeStructure(dir, obj) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path.join(dir, key);
      if (typeof value === "string") {
        await fs.writeFile(fullPath, value);
        console.log(`Created file: ${fullPath}`);
      } else {
        await fs.mkdir(fullPath, { recursive: true });
        console.log(`Created directory: ${fullPath}`);
        await writeStructure(fullPath, value);
      }
    }
  }

  await writeStructure(projectDir, structure);

  // Copy favicon.ico as a binary file
  const faviconSrc = path.join(__dirname, "../src/public/favicon.ico");
  const faviconDest = path.join(projectDir, "public/favicon.ico");
  try {
    await fs.copyFile(faviconSrc, faviconDest);
    console.log(`Copied favicon: ${faviconDest}`);
  } catch (e) {
    console.error(`Failed to copy favicon.ico: ${e.message}`);
  }

  console.log("Installing dependencies...");
  execSync(`cd ${projectDir} && npm install --force`, { stdio: "inherit" });
  console.log(`Initialized ${projectDir}. Run 'cd ${projectDir} && npm run build' to get started.`);
}

async function addTemplate(templateName) {
  const templateDir = path.join(__dirname, "../src/templates", templateName);
  const destDir = path.join(process.cwd(), "src/content", templateName);
  
  try {
    await fs.access(templateDir);
  } catch (e) {
    console.error(`Template ${templateName} not found at ${templateDir}`);
    return;
  }

  await fs.cp(templateDir, destDir, { recursive: true });
  console.log(`Added template ${templateName} to ${destDir}`);
  const copiedFiles = await fs.readdir(destDir);
  console.log(`Copied files: ${copiedFiles.join(", ")}`);
  const indexMdPath = path.join(destDir, "index.md");
  try {
    const indexMdContent = await fs.readFile(indexMdPath, "utf8");
    console.log(`index.md content:\n${indexMdContent}`);
  } catch (e) {
    console.error(`Failed to read ${indexMdPath}: ${e.message}`);
  }

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
    console.warn(`No template.json found for ${templateName}, skipping nav update.`);
  }
}

function runBuild() {
  console.log("Running build...");
  console.log("Generating routes...");
  execSync("node " + path.join(__dirname, "../scripts/generate-routes.js"), { stdio: "inherit" });
  console.log("Running Vite build...");
  execSync("vite build", { stdio: "inherit" });
  console.log("Running Eleventy build...");
  execSync(`eleventy`, { stdio: "inherit" });
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
  console.log("Usage: npx @arthurtsang/arkitect [init-project|add-template|build|start] <name>");
}