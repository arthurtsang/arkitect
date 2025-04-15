import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

async function generateRoutes() {
  const contentDir = path.join(process.cwd(), "src/content");
  const routes = [];

  async function walkDir(dir, parentPath = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(contentDir, fullPath);
      if (entry.isDirectory()) {
        await walkDir(fullPath, `${parentPath}/${entry.name}`);
      } else if (entry.name.endsWith(".md")) {
        const content = await fs.readFile(fullPath, "utf8");
        const { data, content: markdown } = matter(content);
        const routePath = data.permalink || `/${relativePath.replace(".md", "").replace(/\/index$/, "") || "/"}/`;
        const toc = extractTOC(markdown);
        routes.push({
          path: routePath,
          breadcrumb: data.title || entry.name.replace(".md", ""),
          toc,
          parent: data.parent || null
        });
      }
    }
  }

  function extractTOC(markdown) {
    const toc = [];
    const lines = markdown.split("\n");
    lines.forEach(line => {
      const match = line.match(/^(##+)\s+(.+)/);
      if (match) {
        const level = match[1].length - 1;
        const title = match[2].trim();
        const url = "#" + title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
        toc.push({ level, title, url });
      }
    });
    return toc;
  }

  await walkDir(contentDir);

  // Build hierarchical TOC for parent routes
  for (const route of routes) {
    if (route.parent) {
      const parentRoute = routes.find(r => r.path === route.parent);
      if (parentRoute) {
        parentRoute.toc = parentRoute.toc || [];
        if (!parentRoute.toc.some(t => t.url === route.path)) {
          parentRoute.toc.push({
            title: route.breadcrumb,
            url: route.path
          });
        }
      }
    }
  }

  // Remove self-references in TOC
  for (const route of routes) {
    route.toc = route.toc.filter(t => t.url !== route.path);
  }

  const outputPath = path.join(process.cwd(), "src/_data/routes.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(routes, null, 2));
  console.log("Generated routes:", routes);
}

generateRoutes().catch(console.error);