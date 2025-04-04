import MarkdownIt from "markdown-it";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("public/favicon.ico");
  eleventyConfig.addPassthroughCopy("public/styles.css");
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy("node_modules/@fortawesome/fontawesome-free/css/all.min.css");
  eleventyConfig.addPassthroughCopy("node_modules/@fortawesome/fontawesome-free/webfonts");
  eleventyConfig.addCollection("allPages", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/content/**/*.md")
  );

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addNunjucksShortcode("react", function (componentName, props = {}) {
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    return `<div data-react="${componentName}" ${propsString}></div>`;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};