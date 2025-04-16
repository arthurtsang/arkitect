import MarkdownIt from "markdown-it";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const includesPath = path.join(process.cwd(), "_includes");

export default async function (eleventyConfig) {
  console.log("[11ty Debug] Loading .eleventy.js from:", __dirname);
  console.log("[11ty Debug] Includes path:", includesPath);

  try {
    await fs.access(path.join(includesPath, "layout.njk"));
    console.log("[11ty Debug] layout.njk exists at:", path.join(includesPath, "layout.njk"));
  } catch (err) {
    console.error("[11ty Debug] layout.njk not found at:", path.join(includesPath, "layout.njk"), "Error:", err);
  }

  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy({ "dist": "dist" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "node_modules/@fortawesome/fontawesome-free/css/all.min.css" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fortawesome/fontawesome-free/webfonts": "node_modules/@fortawesome/fontawesome-free/webfonts" });
  eleventyConfig.addPassthroughCopy({ "public": "public" });
  eleventyConfig.addPassthroughCopy("src/content/**/*.json");
  eleventyConfig.addPassthroughCopy("src/_data");

  // Global navigation data
  let navCache = null;
  eleventyConfig.addGlobalData("nav", async () => {
    if (navCache) {
      console.log("[11ty Debug] Returning cached nav data:", navCache);
      return navCache;
    }
    const navPath = path.join(process.cwd(), "src/_data/nav.json");
    navCache = JSON.parse(await fs.readFile(navPath, "utf8"));
    console.log("[11ty Debug] Nav data loaded:", navCache);
    return navCache;
  });

  // Add package.json version to global data
  eleventyConfig.addGlobalData("pkgVersion", async () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    return pkg.version;
  });

  // Collection for all markdown pages
  eleventyConfig.addCollection("allPages", (collectionApi) => collectionApi.getFilteredByGlob("src/content/**/*.md"));

  // Configure Markdown
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  // Custom concat filter
  eleventyConfig.addFilter("concat", function (array, value) {
    return array.concat(value);
  });

  // Updated react shortcode to handle named arguments
  eleventyConfig.addNunjucksShortcode("react", function (componentName, ...args) {
    let props = {};
    args.forEach((arg, index) => {
      if (typeof arg === "string" && arg.includes("=")) {
        const [key, value] = arg.split("=", 2);
        props[key.trim()] = value.trim().replace(/^"(.*)"$/, "$1");
      } else if (typeof arg === "object" && arg !== null) {
        Object.assign(props, arg);
      } else {
        props[`arg${index}`] = arg;
      }
    });
    console.log(`[11ty Debug] react shortcode props for ${componentName}:`, props);
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    return `<div data-react="${componentName}" ${propsString}></div>`;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "src/_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};