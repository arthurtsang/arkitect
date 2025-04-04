import MarkdownIt from "markdown-it";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("~arkitect/src/public/favicon.ico");
  eleventyConfig.addPassthroughCopy("~arkitect/src/public/styles.css");
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy("~arkitect/node_modules/@fortawesome/fontawesome-free/css/all.min.css");
  eleventyConfig.addPassthroughCopy("~arkitect/node_modules/@fortawesome/fontawesome-free/webfonts");
  eleventyConfig.addPassthroughCopy({ "src/_includes": "_includes" }, { priority: 1 }); // User overrides
  eleventyConfig.addPassthroughCopy({ "public": "public" }, { priority: 1 }); // User overrides
  eleventyConfig.addPassthroughCopy("src/content/**/*.json");
  eleventyConfig.addCollection("allPages", (collectionApi) => collectionApi.getFilteredByGlob("src/content/**/*.md"));

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addNunjucksShortcode("react", function (componentName, props = {}) {
    const propsString = Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(" ");
    return `<div data-react="${componentName}" ${propsString}></div>`;
  });

  return {
    dir: {
      input: "src/content", // User content
      output: "_site",
      includes: "~arkitect/src/_includes", // Arkitect layouts
      data: "src/_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};