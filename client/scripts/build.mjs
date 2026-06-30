import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outdir = path.join(projectRoot, "dist");

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [path.join(projectRoot, "src/main.jsx")],
  bundle: true,
  outdir,
  format: "esm",
  splitting: false,
  sourcemap: true,
  target: ["es2022"],
  loader: { ".css": "css" },
  entryNames: "main",
  assetNames: "assets/[name]",
  publicPath: "/",
  logLevel: "info",
});

const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
const output = html
  .replace('<script type="module" src="/src/main.jsx"></script>', '<link rel="stylesheet" href="/main.css" />\n    <script type="module" src="/main.js"></script>');

await writeFile(path.join(outdir, "index.html"), output, "utf8");

console.log("Client build complete");
