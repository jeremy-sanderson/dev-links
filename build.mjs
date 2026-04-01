import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { config } from "dotenv";

// Load .env
const envResult = config();
if (envResult.error) {
  console.error("Error: Could not load .env file. Copy .env.example to .env and fill in values.");
  process.exit(1);
}

const env = envResult.parsed;

// Validate required env vars
const required = ["DOMAINS", "JIRA_PREFIXES", "JIRA_BASE_URL"];
for (const key of required) {
  if (!env[key]) {
    console.error(`Error: Missing required env var ${key} in .env`);
    process.exit(1);
  }
}

// Ensure dist/ exists
if (!existsSync("dist")) {
  mkdirSync("dist");
}

// Build defines — esbuild replaces these identifiers with literal values
const define = {
  __JIRA_PREFIXES__: JSON.stringify(env.JIRA_PREFIXES),
  __JIRA_BASE_URL__: JSON.stringify(env.JIRA_BASE_URL),
  __SCAN_INTERVAL__: JSON.stringify(env.SCAN_INTERVAL || "30000"),
};

const isWatch = process.argv.includes("--watch");

// Template the manifest
function writeManifest() {
  const template = readFileSync("src/manifest.template.json", "utf8");
  const manifest = JSON.parse(template);
  manifest.content_scripts[0].matches = env.DOMAINS.split(",").map((d) => d.trim());
  writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));
  console.log("Wrote dist/manifest.json");
}

writeManifest();

// esbuild config
const buildOptions = {
  entryPoints: ["src/content.ts"],
  bundle: true,
  outfile: "dist/content.js",
  format: "iife",
  target: "chrome120",
  define,
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete: dist/content.js");
}
