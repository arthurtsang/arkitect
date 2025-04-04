#!/usr/bin/env node
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { execSync } from "child_process";

// Get __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      "_data": {}
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
        "@arthurtsang/arkitect": "^1.0.0"
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
  execSync(`cd ${projectDir} && npm install --force`, { stdio: "inherit" });
  console.log(`Initialized ${projectDir}. Run 'cd ${projectDir} && npm run build' to get started.`);
}

async function addTemplate(templateName) {
  const templateDir = path.join(__dirname, "../src/templates", templateName);
  const destDir = path.join(process.cwd(), "src/content", templateName);
  await fs.cp(templateDir, destDir, { recursive: true });
  console.log(`Added template ${templateName} to ${destDir}`);
}

function runBuild() {
  console.log("Running build...");
  execSync("node " + path.join(__dirname, "../scripts/generate-routes.js"), { stdio: "inherit" });
  execSync("vite build", { stdio: "inherit" });
  execSync("eleventy", { stdio: "inherit" });
  console.log("Build complete.");
}

if (command === "init-project" && arg) {
  initProject(arg).catch(console.error);
} else if (command === "add-template" && arg) {
  addTemplate(arg).catch(console.error);
} else if (command === "build") {
  runBuild();
} else if (command === "start") {
  execSync("vite", { stdio: "inherit" });
} else {
  console.log("Usage: npx @arthurtsang/arkitect [init-project|add-template] <name>");
}