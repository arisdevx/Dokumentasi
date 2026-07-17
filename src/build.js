import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";
import fse from "fs-extra";
import matter from "gray-matter";
import hljs from "highlight.js";
import yaml from "js-yaml";
import { marked } from "marked";
import dotenv from "dotenv";

dotenv.config();

const root = process.cwd();
const distDir = path.join(root, "dist");
const docsDir = path.join(root, "docs");
const openapiPath = path.join(root, "openapi", "openapi.yaml");
const publicDir = path.join(root, "public");
const visibility = process.env.DOCS_VISIBILITY || "public";

function normalizeBasePath(value) {
  const raw = String(value || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}

const config = {
  title: process.env.DOCS_TITLE || "Dokumentasi",
  description: process.env.DOCS_DESCRIPTION || "Lightweight API documentation for humans and AI agents.",
  version: process.env.DOCS_VERSION || "v0.1.0",
  basePath: normalizeBasePath(process.env.DOCS_BASE_PATH || "/"),
  logo: process.env.DOCS_LOGO || "/assets/logo.svg",
  logoDark: process.env.DOCS_LOGO_DARK || "/assets/logo-dark.svg",
  logoAlt: process.env.DOCS_LOGO_ALT || "Dokumentasi",
  defaultEnv: process.env.DOCS_DEFAULT_ENV || "production",
  enableTryIt: (process.env.DOCS_ENABLE_TRY_IT || "true") === "true",
  environments: {
    development: process.env.DOCS_API_DEV_URL || "https://dev-api.example.com",
    staging: process.env.DOCS_API_STAGING_URL || "https://staging-api.example.com",
    production: process.env.DOCS_API_PROD_URL || "https://api.example.com"
  }
};

marked.setOptions({
  gfm: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
    return hljs.highlightAuto(code).value;
  }
});

function titleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pageUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/").replace(/\.md$/, "");
  if (normalized === "index") return "/";
  if (normalized.endsWith("/index")) return `/${normalized.replace(/\/index$/, "")}/`;
  return `/${normalized}/`;
}

function publicUrl(url) {
  const value = String(url || "");
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(value)) return value;

  const clean = value.replace(/^\/+/, "");
  if (config.basePath === "/") return `/${clean}`;
  if (!clean) return config.basePath;
  return `${config.basePath}${clean}`;
}

function prefixRootRelativeUrls(html) {
  return html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (_match, attr, value) => {
    return `${attr}="${publicUrl(`/${value}`)}"`;
  });
}

function outputPathForUrl(url) {
  if (url === "/") return path.join(distDir, "index.html");
  return path.join(distDir, url.replace(/^\//, ""), "index.html");
}

function isVisible(itemVisibility) {
  if (visibility === "internal") return true;
  return (itemVisibility || "public") === "public";
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeIconName(name) {
  return String(name || "book")
    .replace(/^Icon/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/_/g, "-");
}

function icon(name, className = "h-5 w-5") {
  const key = normalizeIconName(name);
  const tablerPath = path.join(root, "node_modules", "@tabler", "icons", "icons", "outline", `${key}.svg`);

  if (existsSync(tablerPath)) {
    return readFileSync(tablerPath, "utf8")
      .replace(/<svg\b[^>]*>/, `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`)
      .replace(/\s(width|height)="[^"]*"/g, "");
  }

  const attrs = `class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const paths = {
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    search: '<path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
    moon: '<path d="M12 3c.132 0 .263 .003 .393 .008a7.5 7.5 0 0 0 7.92 10.554a9 9 0 1 1 -8.313 -10.562z"/>',
    sun: '<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="M12 3v1"/><path d="M12 20v1"/><path d="M5.6 5.6l.7 .7"/><path d="M17.7 17.7l.7 .7"/><path d="M18.4 5.6l-.7 .7"/><path d="M6.3 17.7l-.7 .7"/>',
    chevron: '<path d="M9 6l6 6l-6 6"/>',
    "chevron-right": '<path d="M9 6l6 6l-6 6"/>',
    "chevron-down": '<path d="M6 9l6 6l6 -6"/>',
    folder: '<path d="M5 19h14a2 2 0 0 0 2 -2v-9a2 2 0 0 0 -2 -2h-7l-2 -2h-5a2 2 0 0 0 -2 2v11a2 2 0 0 0 2 2z"/>',
    book: '<path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/>',
    "file-text": '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 9h1"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    rocket: '<path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"/><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"/><path d="M15 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
    lock: '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M8 11v-4a4 4 0 0 1 8 0v4"/>',
    "shield-check": '<path d="M12 3l7 4v5c0 5 -3.5 8 -7 9c-3.5 -1 -7 -4 -7 -9v-5z"/><path d="M9 12l2 2l4 -4"/>',
    server: '<path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M3 14m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"/><path d="M7 8h.01"/><path d="M7 18h.01"/>',
    "alert-circle": '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    gauge: '<path d="M12 14l3 -3"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="M9 19h6"/>',
    history: '<path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 1 2.64 6.36"/><path d="M3 17v-6h6"/>',
    code: '<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>',
    users: '<path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
    "list-details": '<path d="M13 5h8"/><path d="M13 9h5"/><path d="M13 15h8"/><path d="M13 19h5"/><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/>',
    copy: '<path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"/>',
    send: '<path d="M10 14l11 -11"/><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1z"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path d="M9 7v-3h6v3"/>'
  };
  return `<svg ${attrs}>${paths[key] || paths.book}</svg>`;
}

async function readCategoryMeta(dir) {
  const file = path.join(dir, "_category.json");
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readMarkdownPages() {
  const files = await fg("**/*.md", { cwd: docsDir });
  const pages = [];
  const categoryCache = new Map();

  for (const file of files) {
    const source = await fs.readFile(path.join(docsDir, file), "utf8");
    const parsed = matter(source);
    const url = pageUrl(file);
    const html = prefixRootRelativeUrls(marked.parse(parsed.content));
    const folder = path.dirname(file) === "." ? "" : path.dirname(file);
    const folderMeta = {};

    if (folder) {
      let currentFolder = "";
      for (const segment of folder.split("/")) {
        currentFolder = currentFolder ? `${currentFolder}/${segment}` : segment;
        if (!categoryCache.has(currentFolder)) {
          categoryCache.set(currentFolder, await readCategoryMeta(path.join(docsDir, currentFolder)));
        }
        folderMeta[currentFolder] = categoryCache.get(currentFolder);
      }
    }

    if (!isVisible(parsed.data.visibility)) continue;

    pages.push({
      type: "page",
      source: file,
      folder,
      url,
      title: parsed.data.title || titleCase(path.basename(file, ".md")),
      description: parsed.data.description || "",
      order: parsed.data.order ?? 50,
      icon: parsed.data.icon || "book",
      folderMeta,
      visibility: parsed.data.visibility || "public",
      html,
      text: parsed.content
    });
  }

  return pages.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

async function readOpenApi() {
  const source = await fs.readFile(openapiPath, "utf8");
  return { source, spec: yaml.load(source) };
}

function getOperations(spec) {
  const operations = [];
  const methods = new Set(["get", "post", "put", "patch", "delete"]);

  for (const [apiPath, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (!methods.has(method)) continue;
      if (!isVisible(operation["x-visibility"])) continue;

      const tag = operation.tags?.[0] || "Endpoints";
      const operationId = operation.operationId || slugify(`${method}-${apiPath}`);
      operations.push({
        type: "endpoint",
        method: method.toUpperCase(),
        path: apiPath,
        tag,
        operationId,
        slug: slugify(operation.summary || operationId),
        summary: operation.summary || operationId,
        description: operation.description || "",
        operation,
        visibility: operation["x-visibility"] || "public",
        url: `/endpoints/${slugify(tag)}/${slugify(operation.summary || operationId)}/`
      });
    }
  }

  return operations.sort((a, b) => a.tag.localeCompare(b.tag) || a.summary.localeCompare(b.summary));
}

function filteredSpec(spec) {
  if (visibility === "internal") return spec;

  const clone = structuredClone(spec);
  const methods = new Set(["get", "post", "put", "patch", "delete"]);

  for (const [apiPath, pathItem] of Object.entries(clone.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem || {})) {
      if (methods.has(method) && !isVisible(operation["x-visibility"])) {
        delete pathItem[method];
      }
    }

    const hasOperation = Object.keys(pathItem).some((key) => methods.has(key));
    if (!hasOperation) delete clone.paths[apiPath];
  }

  return clone;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function jsonBlock(value, label = "JSON") {
  const raw = JSON.stringify(value, null, 2);
  const highlighted = hljs.highlight(raw, { language: "json" }).value;
  return `
    <div class="code-panel">
      <div class="code-panel-header">
        <span>${label}</span>
        <button class="code-copy-button" type="button" data-copy-code="${escapeAttribute(raw)}">${icon("copy", "h-4 w-4")} Copy</button>
      </div>
      <pre><code class="language-json hljs">${highlighted}</code></pre>
    </div>
  `;
}

function parameterRows(operation) {
  return (operation.parameters || []).map((param) => `
    <tr>
      <td class="whitespace-nowrap px-4 py-3 font-mono text-sm">${param.name}</td>
      <td class="px-4 py-3">${param.in}</td>
      <td class="px-4 py-3">${param.required ? "Yes" : "No"}</td>
      <td class="px-4 py-3">${param.schema?.type || "unknown"}</td>
      <td class="min-w-64 px-4 py-3">${param.description || ""}</td>
    </tr>
  `).join("");
}

function responseRows(operation) {
  return Object.entries(operation.responses || {}).map(([status, response]) => `
    <tr>
      <td class="whitespace-nowrap px-4 py-3"><span class="rounded border px-2 py-1 text-xs font-semibold ${status.startsWith("2") ? "border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200" : "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"}">${status}</span></td>
      <td class="px-4 py-3">${response.description || ""}</td>
      <td class="px-4 py-3 font-mono text-sm">application/json</td>
    </tr>
  `).join("");
}

function firstExample(operation, statusPrefix = "2") {
  const response = Object.entries(operation.responses || {}).find(([status]) => status.startsWith(statusPrefix))?.[1];
  return response?.content?.["application/json"]?.example || null;
}

function endpointHtml(endpoint) {
  const { operation } = endpoint;
  const params = parameterRows(operation);
  const responses = responseRows(operation);
  const successExample = firstExample(operation, "2");
  const errorExample = firstExample(operation, "4");
  const ai = operation["x-ai"];

  return `
    <div class="mb-6 text-sm text-slate-500 dark:text-slate-400">Endpoints / ${endpoint.tag} / ${endpoint.summary}</div>
    <div class="mb-5 flex flex-wrap items-center gap-3">
      <h1 class="mr-auto text-3xl font-bold tracking-normal text-slate-950 dark:text-white">${endpoint.summary}</h1>
      <button class="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900" type="button" onclick="navigator.clipboard.writeText('${endpoint.path}')">${icon("copy", "h-4 w-4")} Copy path</button>
    </div>
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <span class="method-${endpoint.method.toLowerCase()} rounded-md border px-3 py-1.5 text-sm font-bold">${endpoint.method}</span>
      <code class="text-base">${endpoint.path}</code>
    </div>
    <p class="mb-8 text-slate-600 dark:text-slate-300">${endpoint.description}</p>

    <section class="mb-8 border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 class="mb-3 text-xl font-semibold">Authentication</h2>
      <p class="text-slate-600 dark:text-slate-300">${operation.security ? "This endpoint requires a valid bearer access token." : "This endpoint does not require authentication."}</p>
    </section>

    <section class="mb-8 border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 class="mb-3 text-xl font-semibold">Parameters</h2>
      ${params ? `<div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800"><table class="w-full min-w-[720px] text-left text-sm"><thead class="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300"><tr><th class="px-4 py-3">Name</th><th class="px-4 py-3">In</th><th class="px-4 py-3">Required</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">Description</th></tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800">${params}</tbody></table></div>` : `<p class="text-slate-600 dark:text-slate-300">This endpoint does not define parameters.</p>`}
    </section>

    <section class="mb-8 border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 class="mb-3 text-xl font-semibold">Responses</h2>
      <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800"><table class="w-full min-w-[680px] text-left text-sm"><thead class="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300"><tr><th class="px-4 py-3">Code</th><th class="px-4 py-3">Description</th><th class="px-4 py-3">Content Type</th></tr></thead><tbody class="divide-y divide-slate-200 dark:divide-slate-800">${responses}</tbody></table></div>
    </section>

    ${successExample ? `<section class="mb-8"><h2 class="mb-3 text-xl font-semibold">Example Response</h2>${jsonBlock(successExample, "200 response")}</section>` : ""}
    ${errorExample ? `<section class="mb-8"><h2 class="mb-3 text-xl font-semibold">Example Error</h2>${jsonBlock(errorExample, "Error response")}</section>` : ""}

    ${ai ? `<section class="mb-8 rounded-lg border border-purple-200 bg-purple-50 p-5 text-purple-950 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-100"><h2 class="mb-2 text-lg font-semibold">AI integration notes</h2><p class="mb-2">${ai.usage || ""}</p><p class="text-sm">${ai.frontendFlow || ""}</p></section>` : ""}
  `;
}

function tryItData(endpoint) {
  if (!config.enableTryIt) return null;
  const params = endpoint.operation.parameters || [];
  return {
    method: endpoint.method,
    path: endpoint.path,
    defaultEnv: config.defaultEnv,
    environments: config.environments,
    query: params.filter((item) => item.in === "query").map((item) => ({
      name: item.name,
      description: item.description || "",
      example: item.example || ""
    })),
    headers: params.filter((item) => item.in === "header").map((item) => ({
      name: item.name,
      description: item.description || "",
      example: item.example || ""
    })),
    requestBodyExample: endpoint.operation.requestBody?.content?.["application/json"]?.example
      ? JSON.stringify(endpoint.operation.requestBody.content["application/json"].example, null, 2)
      : "{\n  \n}"
  };
}

function folderMetaFromPages(pages, folderPath) {
  return pages.find((page) => page.folderMeta?.[folderPath])?.folderMeta?.[folderPath] || {};
}

function createNavNode(segment = "", folderPath = "") {
  return {
    segment,
    folderPath,
    children: new Map(),
    pages: []
  };
}

function insertPageInNavTree(rootNode, page) {
  if (!page.folder) {
    rootNode.pages.push(page);
    return;
  }

  let node = rootNode;
  let currentFolder = "";
  for (const segment of page.folder.split("/")) {
    currentFolder = currentFolder ? `${currentFolder}/${segment}` : segment;
    if (!node.children.has(segment)) {
      node.children.set(segment, createNavNode(segment, currentFolder));
    }
    node = node.children.get(segment);
  }
  node.pages.push(page);
}

function sortNavPages(pages) {
  return [...pages].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function navNodeOrder(node, pages) {
  const meta = folderMetaFromPages(pages, node.folderPath);
  if (Number.isFinite(meta.order)) return meta.order;

  const pageOrders = node.pages.map((page) => page.order);
  const childOrders = [...node.children.values()].map((child) => navNodeOrder(child, pages));
  return Math.min(...pageOrders, ...childOrders, 50);
}

function renderMarkdownNavNode(node, pages, currentUrl, depth = 0) {
  const meta = folderMetaFromPages(pages, node.folderPath);
  const title = meta.title || titleCase(node.segment);
  const folderIcon = meta.icon || "folder";
  const childHtml = [
    ...sortNavPages(node.pages).map((page) => navLink(page.url, page.title, currentUrl, { child: true, iconName: page.icon })),
    ...[...node.children.values()]
      .sort((a, b) => navNodeOrder(a, pages) - navNodeOrder(b, pages) || titleCase(a.segment).localeCompare(titleCase(b.segment)))
      .map((child) => renderMarkdownNavNode(child, pages, currentUrl, depth + 1))
  ].join("");

  return `
    <div class="${depth === 0 ? "mt-1" : "mt-1"}" x-data="{ open: true }">
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" type="button" @click="open = !open" :aria-expanded="open.toString()">
        ${icon(folderIcon, "h-5 w-5 shrink-0 text-slate-500")}
        <span class="min-w-0 truncate">${title}</span>
        <span class="ml-auto grid h-4 w-4 shrink-0 place-items-center text-slate-500">
          <span class="transition-transform" :class="open ? 'rotate-90' : ''">${icon("chevron-right", "h-4 w-4")}</span>
        </span>
      </button>
      <div class="ml-5 border-l border-slate-200 pl-3 dark:border-slate-800" x-show="open">
        ${childHtml}
      </div>
    </div>
  `;
}

function buildNav(pages, endpoints, currentUrl) {
  const navTree = createNavNode();
  for (const page of pages) insertPageInNavTree(navTree, page);

  const rootHtml = sortNavPages(navTree.pages).map((page) => navLink(page.url, page.title, currentUrl, { iconName: page.icon })).join("");
  const folderHtml = [...navTree.children.values()]
    .sort((a, b) => navNodeOrder(a, pages) - navNodeOrder(b, pages) || titleCase(a.segment).localeCompare(titleCase(b.segment)))
    .map((node) => renderMarkdownNavNode(node, pages, currentUrl))
    .join("");

  const endpointGroups = Map.groupBy ? Map.groupBy(endpoints, (endpoint) => endpoint.tag) : endpoints.reduce((map, endpoint) => {
    map.set(endpoint.tag, [...(map.get(endpoint.tag) || []), endpoint]);
    return map;
  }, new Map());

  const endpointsHtml = [...endpointGroups.entries()].map(([tag, items]) => `
    <div class="ml-5 border-l border-slate-200 pl-3 dark:border-slate-800" x-data="{ open: true }">
      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" type="button" @click="open = !open" :aria-expanded="open.toString()">
        ${icon("folder", "h-4 w-4 shrink-0 text-purple-900 dark:text-purple-300")}
        <span class="min-w-0 truncate">${tag}</span>
        <span class="ml-auto grid h-4 w-4 shrink-0 place-items-center text-slate-500">
          <span class="transition-transform" :class="open ? 'rotate-90' : ''">${icon("chevron-right", "h-4 w-4")}</span>
        </span>
      </button>
      <div x-show="open">
      ${items.map((endpoint) => navLink(endpoint.url, `<span class="mr-2 text-[10px] font-bold text-green-700">${endpoint.method}</span>${endpoint.summary}`, currentUrl, { child: true, iconName: "code" })).join("")}
      </div>
    </div>
  `).join("");

  const endpointSection = endpoints.length ? `
    <div class="mt-2" x-data="{ open: true }">
      <button class="flex w-full items-center gap-2 rounded-md bg-purple-50 px-3 py-2.5 text-left text-sm font-semibold text-purple-900 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-950" type="button" @click="open = !open" :aria-expanded="open.toString()">
        ${icon("folder", "h-5 w-5 shrink-0")}
        <span class="min-w-0 truncate">Endpoints</span>
        <span class="ml-auto grid h-4 w-4 shrink-0 place-items-center">
          <span class="transition-transform" :class="open ? 'rotate-90' : ''">${icon("chevron-right", "h-4 w-4")}</span>
        </span>
      </button>
      <div x-show="open">
      ${endpointsHtml}
      </div>
    </div>
  ` : "";

  return `
    ${rootHtml}
    ${folderHtml}
    ${endpointSection}
  `;
}

function navLink(url, label, currentUrl, options = {}) {
  const child = Boolean(options.child);
  const iconName = options.iconName || "book";
  const active = url === currentUrl;
  return `<a href="${publicUrl(url)}" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${child ? "" : "font-medium"} ${active ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-100" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}">${icon(iconName, `${child ? "h-4 w-4" : "h-5 w-5"} shrink-0 text-slate-500`)}<span class="truncate">${label}</span></a>`;
}

function tryItPanel() {
  return `
    <aside class="lg:sticky lg:top-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <div class="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
        <h2 class="mb-5 text-xl font-semibold">Try It</h2>
        <div class="space-y-5" x-data="tryIt">
          <label class="block text-sm font-semibold">Environment
            <select class="form-control mt-2 w-full" x-model="env">
              <template x-for="(_, key) in page.environments" :key="key">
                <option :value="key" x-text="key"></option>
              </template>
            </select>
          </label>
          <label class="block text-sm font-semibold">Authorization
            <input class="form-control mt-2 w-full" x-model="token" placeholder="Bearer your_access_token">
          </label>
          <div>
            <div class="mb-2 text-sm font-semibold">Query Parameters</div>
            <template x-for="(param, index) in query" :key="index">
              <div class="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem]">
                <input class="form-control min-w-0" x-model="param.name" placeholder="key">
                <input class="form-control min-w-0" x-model="param.value" placeholder="value">
                <button class="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" type="button" @click="removeQuery(index)" aria-label="Remove query parameter">${icon("trash", "h-4 w-4")}</button>
              </div>
            </template>
            <button class="btn-secondary w-full" type="button" @click="addQuery()">Add query parameter</button>
          </div>
          <div>
            <div class="mb-2 text-sm font-semibold">Headers</div>
            <template x-for="(header, index) in headers" :key="index">
              <div class="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem]">
                <input class="form-control min-w-0" x-model="header.name" placeholder="key">
                <input class="form-control min-w-0" x-model="header.value" placeholder="value">
                <button class="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900" type="button" @click="removeHeader(index)" aria-label="Remove header">${icon("trash", "h-4 w-4")}</button>
              </div>
            </template>
            <button class="btn-secondary w-full" type="button" @click="addHeader()">Add header</button>
          </div>
          <label class="block text-sm font-semibold">Request Body
            <textarea class="form-control mt-2 min-h-40 w-full font-mono" x-model="requestBody"></textarea>
          </label>
          <button class="btn-primary w-full" type="button" @click="send()" :disabled="isLoading">${icon("send", "h-4 w-4")} <span x-text="isLoading ? 'Sending...' : 'Send request'"></span></button>
          <div x-show="responseStatus" class="rounded-lg border border-slate-200 dark:border-slate-800">
            <div class="border-b border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-800" x-text="responseStatus"></div>
            <pre class="max-h-64 overflow-auto bg-slate-950 p-3 text-xs text-slate-100"><code x-text="responseBody"></code></pre>
          </div>
        </div>
      </div>
    </aside>
  `;
}

function renderLayout({ title, description, content, currentUrl, nav, search, tryIt }) {
  const pageTitle = `${title} - ${config.title}`;
  const data = JSON.stringify({ search, tryIt }).replace(/</g, "\\u003c");
  const hasTryIt = Boolean(tryIt);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description || config.description}">
  <title>${pageTitle}</title>
  <script>try{const t=localStorage.getItem('dokumentasi-theme');const d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch{}</script>
  <link rel="stylesheet" href="${publicUrl("/assets/styles.css")}">
  <link rel="icon" href="${publicUrl(config.logo)}">
</head>
<body>
  <script>window.__DOKUMENTASI__=${data}</script>
  <div x-data="dokumentasi()" class="h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <div x-show="navOpen" x-cloak class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" @click="navOpen=false"></div>
    <aside class="fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white transition dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0" :class="navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <div class="flex h-20 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
        <img src="${publicUrl(config.logo)}" alt="${config.logoAlt}" class="h-10 w-10 dark:hidden">
        <img src="${publicUrl(config.logoDark)}" alt="${config.logoAlt}" class="hidden h-10 w-10 dark:block">
        <div class="min-w-0">
          <div class="truncate text-xl font-bold">${config.title}</div>
          <div class="text-xs text-slate-500">${config.version}</div>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto p-4">${nav}</nav>
      <div class="border-t border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">Built for humans and AI agents.</div>
    </aside>

    <main class="flex h-screen flex-col lg:pl-72">
      <header class="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800 sm:px-6">
        <button class="rounded-full border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200 lg:hidden" type="button" @click="navOpen=true" aria-label="Open navigation">${icon("menu")}</button>
        <div class="relative w-full max-w-xl">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${icon("search", "h-4 w-4")}</span>
          <input class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-900 focus:ring-2 focus:ring-purple-200 dark:border-slate-800 dark:bg-slate-900" x-model="searchQuery" @focus="searchOpen=true" placeholder="Search docs...">
          <div x-show="searchOpen && searchQuery" x-cloak @click.outside="searchOpen=false" class="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <template x-if="searchResults.length === 0"><div class="p-4 text-sm text-slate-500">No results found.</div></template>
            <template x-for="item in searchResults" :key="item.url">
              <a class="block border-b border-slate-100 p-4 last:border-0 hover:bg-purple-50 dark:border-slate-800 dark:hover:bg-purple-950/30" :href="item.url">
                <div class="font-semibold" x-text="item.title"></div>
                <div class="text-sm text-slate-500" x-text="item.description"></div>
              </a>
            </template>
          </div>
        </div>
        <button class="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900" type="button" @click="toggleTheme()" aria-label="Toggle theme">
          <span x-show="theme === 'light'">${icon("moon", "h-5 w-5")}</span>
          <span x-show="theme === 'dark'">${icon("sun", "h-5 w-5")}</span>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto grid w-full max-w-[1500px] gap-8 px-4 py-8 sm:px-6 ${hasTryIt ? "lg:grid-cols-[minmax(0,1fr)_430px]" : "lg:grid-cols-1"}">
          <article class="min-w-0 ${hasTryIt ? "" : "max-w-4xl"}">${content}</article>
          ${hasTryIt ? tryItPanel() : ""}
        </div>
      </div>
    </main>
  </div>
  <script type="module" src="${publicUrl("/assets/app.js")}"></script>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-code]");
      if (!button) return;
      const original = button.innerHTML;
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy-code"));
        button.textContent = "Copied";
        setTimeout(() => { button.innerHTML = original; }, 1200);
      } catch {
        button.textContent = "Copy failed";
        setTimeout(() => { button.innerHTML = original; }, 1200);
      }
    });
  </script>
  <script defer src="${publicUrl("/assets/alpine.min.js")}"></script>
</body>
</html>`;
}

async function writePage(url, html) {
  const file = outputPathForUrl(url);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
}

function searchIndex(pages, endpoints) {
  return [
    ...pages.map((page) => ({
      title: page.title,
      description: page.description,
      url: publicUrl(page.url),
      content: page.text.slice(0, 2000)
    })),
    ...endpoints.map((endpoint) => ({
      title: endpoint.summary,
      description: endpoint.description,
      url: publicUrl(endpoint.url),
      method: endpoint.method,
      path: endpoint.path,
      content: `${endpoint.summary} ${endpoint.description} ${endpoint.path} ${endpoint.tag}`
    }))
  ];
}

function emptyStateHtml() {
  return `
    <div class="docs-prose">
      <h1>${config.title}</h1>
      <p>This documentation starter does not include source Markdown pages yet.</p>
      <p>Add Markdown files under <code>docs/</code> and API operations in <code>openapi/openapi.yaml</code>, then run the build again.</p>
    </div>
  `;
}

function endpointIndex(endpoints) {
  return endpoints.map((endpoint) => ({
    operationId: endpoint.operationId,
    method: endpoint.method,
    path: endpoint.path,
    summary: endpoint.summary,
    tags: [endpoint.tag],
    visibility: endpoint.visibility,
    auth: endpoint.operation.security ? "bearer" : "none",
    requestBody: endpoint.operation.requestBody ? "defined" : null,
    successResponse: Object.keys(endpoint.operation.responses || {}).find((status) => status.startsWith("2")) || null,
    docUrl: publicUrl(endpoint.url),
    ai: endpoint.operation["x-ai"] || null
  }));
}

async function writeAiArtifacts(specSource, spec, pages, endpoints) {
  const aiDir = path.join(distDir, "ai");
  const visibleSpec = filteredSpec(spec);
  await fs.mkdir(aiDir, { recursive: true });
  await fs.writeFile(path.join(distDir, "openapi.yaml"), yaml.dump(visibleSpec, { noRefs: true, lineWidth: 120 }));
  await fs.writeFile(path.join(distDir, "openapi.json"), JSON.stringify(visibleSpec, null, 2));

  const endpointsJson = endpointIndex(endpoints);
  await fs.writeFile(path.join(aiDir, "endpoints.json"), JSON.stringify(endpointsJson, null, 2));
  await fs.writeFile(path.join(aiDir, "api-summary.json"), JSON.stringify({
    title: spec.info?.title || config.title,
    version: spec.info?.version || config.version,
    description: spec.info?.description || config.description,
    visibility,
    endpointCount: endpoints.length,
    docs: pages.map((page) => ({ title: page.title, url: publicUrl(page.url), description: page.description }))
  }, null, 2));

  await fs.writeFile(path.join(aiDir, "examples.json"), JSON.stringify(Object.fromEntries(endpoints.map((endpoint) => [
    endpoint.operationId,
    {
      curl: `curl "${config.environments.production}${endpoint.path}" -H "Authorization: Bearer <token>" -H "Accept: application/json"`,
      successResponse: firstExample(endpoint.operation, "2"),
      errorResponse: firstExample(endpoint.operation, "4")
    }
  ])), null, 2));

  const importantEndpoints = endpoints.length
    ? endpoints.map((endpoint) => `- \`${endpoint.method} ${endpoint.path}\`: ${endpoint.summary}`).join("\n")
    : `No endpoints are documented yet. Add operations to \`${publicUrl("/openapi.json")}\` before generating client code.`;

  const guide = `# AI Integration Guide

Use this API contract when building frontend or client integrations.

Start with:

- OpenAPI: ${publicUrl("/openapi.json")}
- Endpoint index: ${publicUrl("/ai/endpoints.json")}
- Human docs: ${publicUrl("/")}

## Recommended frontend flow

1. Read the OpenAPI contract.
2. Read authentication and environment documentation.
3. Use endpoint-specific request and response schemas from OpenAPI.
4. Follow endpoint-specific \`x-ai\` guidance when present.
5. Do not invent endpoints, fields, status codes, or authentication behavior.

## Important endpoints

${importantEndpoints}
`;
  await fs.writeFile(path.join(aiDir, "integration-guide.md"), guide);

  const llms = `# ${config.title}

${config.description}

Main resources:

- OpenAPI JSON: ${publicUrl("/openapi.json")}
- OpenAPI YAML: ${publicUrl("/openapi.yaml")}
- Full AI context: ${publicUrl("/llms-full.txt")}
- Endpoint index: ${publicUrl("/ai/endpoints.json")}
- Integration guide: ${publicUrl("/ai/integration-guide.md")}

Authentication and endpoint behavior are defined by the OpenAPI contract and
Markdown documentation in this build.
`;
  await fs.writeFile(path.join(distDir, "llms.txt"), llms);

  const docsContext = pages.length
    ? pages.map((page) => `### ${page.title}\n\n${page.description}\n\nURL: ${publicUrl(page.url)}\n\n${page.text}`).join("\n\n")
    : "No Markdown documentation pages are included in this build.";

  const endpointsContext = endpoints.length
    ? endpoints.map((endpoint) => `### ${endpoint.method} ${endpoint.path}\n\n${endpoint.summary}\n\n${endpoint.description}\n\nAI guidance: ${JSON.stringify(endpoint.operation["x-ai"] || {})}`).join("\n\n")
    : "No OpenAPI operations are included in this build.";

  const full = `# ${config.title}

${config.description}

## Documentation Pages

${docsContext}

## Endpoints

${endpointsContext}
`;
  await fs.writeFile(path.join(distDir, "llms-full.txt"), full);
}

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(path.join(distDir, "assets"), { recursive: true });
  await fse.copy(publicDir, distDir);
  await fse.copy(path.join(root, "src", "client"), path.join(distDir, "assets"));
  await fse.copy(path.join(root, "node_modules", "alpinejs", "dist", "cdn.min.js"), path.join(distDir, "assets", "alpine.min.js"));

  const pages = await readMarkdownPages();
  const { source: specSource, spec } = await readOpenApi();
  const endpoints = getOperations(spec);
  const search = searchIndex(pages, endpoints);

  if (!pages.length) {
    const nav = buildNav(pages, endpoints, "/");
    const html = renderLayout({
      title: config.title,
      description: config.description,
      content: emptyStateHtml(),
      currentUrl: "/",
      nav,
      search,
      tryIt: null
    });
    await writePage("/", html);
  }

  for (const page of pages) {
    const nav = buildNav(pages, endpoints, page.url);
    const html = renderLayout({
      title: page.title,
      description: page.description,
      content: `<div class="docs-prose">${page.html}</div>`,
      currentUrl: page.url,
      nav,
      search,
      tryIt: null
    });
    await writePage(page.url, html);
  }

  for (const endpoint of endpoints) {
    const nav = buildNav(pages, endpoints, endpoint.url);
    const html = renderLayout({
      title: endpoint.summary,
      description: endpoint.description,
      content: endpointHtml(endpoint),
      currentUrl: endpoint.url,
      nav,
      search,
      tryIt: tryItData(endpoint)
    });
    await writePage(endpoint.url, html);
  }

  await writeAiArtifacts(specSource, spec, pages, endpoints);
}

await main();
