import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const scanRoots = ["src", "public", "e2e"];
const directFiles = ["index.html", "package.json", "vite.config.ts", "playwright.config.ts"];
const bannedOrigins = [
  { label: "legacy Gemini reference", pattern: /\\bgemini\\b/i },

  /generativelanguage\.googleapis\.com/i,
  /api\.openai\.com/i,
  /api\.anthropic\.com/i,
  /api\.groq\.com/i,
  /api\.mistral\.ai/i,
  /openrouter\.ai\/api\/v1/i,
  /api\.together\.(?:xyz|ai)/i,
  /api\.cohere\.ai/i
];
const exposedGoogleKey = /AIza[0-9A-Za-z_-]{30,}/;
const prohibitedPackages = new Set([
  "@google/generative-ai",
  "@anthropic-ai/sdk",
  "openai",
  "groq-sdk",
  "@mistralai/mistralai",
  "@ai-sdk/openai",
  "@ai-sdk/google",
  "@ai-sdk/anthropic",
  "@cohere-ai/cohere-sdk"
]);
const files = [];

async function visit(path) {
  let entries;
  try { entries = await readdir(path, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    const filePath = join(path, entry.name);
    if (entry.isDirectory()) await visit(filePath);
    else if ([".ts", ".tsx", ".js", ".mjs", ".html", ".json"].includes(extname(entry.name))) files.push(filePath);
  }
}

for (const rootPath of scanRoots) await visit(join(root, rootPath));
for (const filePath of directFiles) files.push(join(root, filePath));

const findings = [];
for (const filePath of [...new Set(files)]) {
  let text;
  try { text = await readFile(filePath, "utf8"); }
  catch { continue; }
  const label = relative(root, filePath);
  if (exposedGoogleKey.test(text)) findings.push(label + ": looks like an embedded Google API key.");
  for (const item of bannedOrigins) if (item.pattern.test(text)) findings.push(label + ": contains " + item.label + ".");
}

try {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"]) {
    for (const name of Object.keys(pkg[section] || {})) {
      if (prohibitedPackages.has(name)) findings.push("package.json: hosted LLM SDK dependency " + name + " is not allowed.");
    }
  }
} catch (error) {
  findings.push("package.json: could not parse dependencies (" + String(error) + ").");
}

if (findings.length) {
  console.error("Local-first policy check failed:");
  for (const finding of findings) console.error(" - " + finding);
  process.exitCode = 1;
} else {
  console.log("Local-first policy check passed: no legacy Gemini references, known hosted-LLM endpoints, prohibited SDKs, or embedded Google API keys found in active app files.");
}
