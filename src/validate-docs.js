import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";
import matter from "gray-matter";
import yaml from "js-yaml";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const openapiFile = path.join(root, "openapi", "openapi.yaml");
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function scanForSecrets(file, content) {
  const patterns = [
    /sk-[A-Za-z0-9_-]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/,
    /Bearer\s+[A-Za-z0-9._-]{24,}/,
    /password\s*[:=]\s*["']?[^"'\s<>]{8,}/i,
    /https?:\/\/[^/\s:]+:[^@\s]+@/
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) fail(`${file}: possible secret detected (${pattern})`);
  }
}

function scanForPlaceholders(file, content) {
  const blocked = [/\bTODO\b/i, /\bTBD\b/i, /lorem ipsum/i];
  for (const pattern of blocked) {
    if (pattern.test(content)) fail(`${file}: publishable placeholder text detected`);
  }
}

function validateJsonCodeBlocks(file, content) {
  const blocks = content.matchAll(/```json\s+([\s\S]*?)```/g);
  for (const block of blocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      fail(`${file}: invalid JSON code block (${error.message})`);
    }
  }
}

async function validateMarkdown() {
  const files = await fg("**/*.md", { cwd: docsDir });
  const required = ["title", "description", "visibility"];

  for (const file of files) {
    const fullPath = path.join(docsDir, file);
    const content = await fs.readFile(fullPath, "utf8");
    const parsed = matter(content);

    for (const key of required) {
      assert(parsed.data[key], `${file}: missing frontmatter field "${key}"`);
    }

    if (parsed.data.visibility) {
      assert(["public", "internal"].includes(parsed.data.visibility), `${file}: invalid visibility "${parsed.data.visibility}"`);
    }

    validateJsonCodeBlocks(file, content);
    scanForSecrets(file, content);
    scanForPlaceholders(file, content);
  }
}

function validateOpenApiOperation(apiPath, method, operation) {
  const prefix = `${method.toUpperCase()} ${apiPath}`;
  assert(operation.operationId, `${prefix}: missing operationId`);
  assert(operation.summary, `${prefix}: missing summary`);
  assert(operation.description, `${prefix}: missing description`);
  assert(operation.tags?.length, `${prefix}: missing tags`);
  assert(operation.responses && Object.keys(operation.responses).length, `${prefix}: missing responses`);
  assert(Object.keys(operation.responses || {}).some((status) => status.startsWith("2")), `${prefix}: missing success response`);

  if (operation["x-visibility"]) {
    assert(["public", "internal"].includes(operation["x-visibility"]), `${prefix}: invalid x-visibility`);
  }

  for (const [status, response] of Object.entries(operation.responses || {})) {
    assert(response.description, `${prefix} response ${status}: missing description`);
    const example = response.content?.["application/json"]?.example;
    if (example !== undefined) {
      try {
        JSON.stringify(example);
      } catch {
        fail(`${prefix} response ${status}: example is not JSON serializable`);
      }
    }
  }

  if (!operation["x-ai"]) {
    warn(`${prefix}: missing x-ai guidance`);
  }
}

async function validateOpenApi() {
  const content = await fs.readFile(openapiFile, "utf8");
  scanForSecrets("openapi/openapi.yaml", content);
  scanForPlaceholders("openapi/openapi.yaml", content);

  let spec;
  try {
    spec = yaml.load(content);
  } catch (error) {
    fail(`openapi/openapi.yaml: invalid YAML (${error.message})`);
    return;
  }

  assert(spec.openapi, "openapi/openapi.yaml: missing openapi version");
  assert(spec.info?.title, "openapi/openapi.yaml: missing info.title");
  assert(spec.info?.version, "openapi/openapi.yaml: missing info.version");
  assert(spec.paths && typeof spec.paths === "object", "openapi/openapi.yaml: missing paths object");

  const methods = new Set(["get", "post", "put", "patch", "delete"]);
  for (const [apiPath, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (methods.has(method)) validateOpenApiOperation(apiPath, method, operation);
    }
  }
}

async function validateCategoryFiles() {
  const files = await fg("**/_category.json", { cwd: docsDir });
  for (const file of files) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(docsDir, file), "utf8"));
      if (data.visibility) {
        assert(["public", "internal"].includes(data.visibility), `${file}: invalid visibility "${data.visibility}"`);
      }
    } catch (error) {
      fail(`${file}: invalid category JSON (${error.message})`);
    }
  }
}

await validateMarkdown();
await validateCategoryFiles();
await validateOpenApi();

for (const message of warnings) {
  console.warn(`Warning: ${message}`);
}

if (errors.length) {
  for (const message of errors) {
    console.error(`Error: ${message}`);
  }
  process.exit(1);
}

console.log("Documentation validation passed.");
