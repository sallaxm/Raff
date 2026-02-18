import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const ALLOWED_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".md"]);
const markers = ["<<<<<<<", "=======", ">>>>>>>"];
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);

    if (st.isDirectory()) {
      walk(full);
      continue;
    }

    const dot = name.lastIndexOf(".");
    const ext = dot === -1 ? "" : name.slice(dot);
    if (!ALLOWED_EXT.has(ext)) continue;

    const content = readFileSync(full, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, i) => {
      if (markers.some((m) => line.includes(m))) {
        problems.push(`${full}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}

walk(ROOT);

if (problems.length > 0) {
  console.error("Merge conflict markers found:\n");
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}

console.log("No merge conflict markers found.");
