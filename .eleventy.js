import MarkdownIt from "markdown-it";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("[11ty v1.28 Debug] Loading .eleventy.js from:", __dirname);

export default async function (eleventyConfig) {
  const includesPath = "node_modules/@arthurtsang/arkitect/src/_includes";
  console.log("[11ty v1.28 Debug] Includes path:", path.resolve(includesPath));
  
  try {
    await fs.access(path.join(includesPath, "layout.njk"));
    console.log("[11ty v1.28 Debug] layout.njk exists at:", path.join(includesPath, "layout.njk"));
  } catch (err) {
    console.error("[11ty v1.28 Debug] layout.njk not found at:", path.join(includesPath, "layout.njk"), "Error:", err);
  }

  eleventyConfig.addPassthroughCopy({ "node_modules/@arthurtsang/arkitect/src/public": "public" });
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy({ "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "node_modules/@fortawesome/fontawesome-free/css/all.min.css" });
  eleventyConfig.addPassthroughCopy({ "node_modules/@fortawesome/fontawesome-free/webfonts": "node_modules/@fortawesome/fontawesome-free/webfonts" });
  eleventyConfig.addPassthroughCopy({ "src/_includes": "_includes" }, { priority: 1 });
  eleventyConfig.addPassthroughCopy({ "public": "public" }, { priority: 1 });
  eleventyConfig.addPassthroughCopy("src/content/**/*.json");
  eleventyConfig.addPassthroughCopy("src/_data");
  // eleventyConfig.addPassthroughCopy({ "node_modules/@arthurtsang/arkitect/src/public/light.css": "public/light.css" });
  // eleventyConfig.addPassthroughCopy({ "node_modules/@arthurtsang/arkitect/src/public/dark.css": "public/dark.css" });

  let navCache = null;
  eleventyConfig.addGlobalData("nav", async () => {
    if (navCache) {
      console.log("[11ty v1.28 Debug] Returning cached nav data:", navCache);
      return navCache;
    }
    const navPath = path.join(process.cwd(), "src/_data/nav.json");
    navCache = JSON.parse(await fs.readFile(navPath, "utf8"));
    console.log("[11ty v1.28 Debug] Nav data loaded:", navCache);
    console.log("[11ty v1.28 Debug] Nav render count:", navCache.length);
    return navCache;
  });

  eleventyConfig.addCollection("allPages", (collectionApi) => collectionApi.getFilteredByGlob("src/content/**/*.md"));

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  // Add custom concat filter
  eleventyConfig.addFilter("concat", function(array, value) {
    return array.concat(value);
  });

  eleventyConfig.addNunjucksShortcode("react", function (componentName, props = {}) {
    const propsString = Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(" ");
    return `<div data-react="${componentName}" ${propsString}></div>`;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: includesPath,
      data: "src/_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};