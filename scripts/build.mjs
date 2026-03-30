import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const distDir = join(rootDir, "dist");

const rootFiles = [
  "index.html",
  "generic.html",
  "elements.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects"
];

const assetFiles = [
  ["assets", "css", "main.css"],
  ["assets", "js", "main.js"],
  ["assets", "favicon.svg"],
  ["assets", "og-cover.svg"],
  ["assets", "og-cover.png"]
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const file of rootFiles) {
  await cp(join(rootDir, file), join(distDir, file));
}

for (const parts of assetFiles) {
  const source = join(rootDir, ...parts);
  const destination = join(distDir, ...parts);

  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination);
}

console.log(`Built static site into ${distDir}`);
