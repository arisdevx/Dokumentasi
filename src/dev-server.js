import { spawn, spawnSync } from "node:child_process";
import { existsSync, statSync, watch } from "node:fs";
import path from "node:path";

const root = process.cwd();
const watchTargets = ["docs", "openapi", "public", "src", "tailwind.config.js", "postcss.config.js"];
const buildCommand = ["npm", ["run", "build"]];
const serverCommand = ["npx", ["vite", "--host", "0.0.0.0", "dist"]];

let buildProcess = null;
let queued = false;
let debounceTimer = null;

function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...options,
  });
}

function runBuild() {
  if (buildProcess) {
    queued = true;
    return;
  }

  buildProcess = run(...buildCommand);
  buildProcess.on("exit", (code) => {
    buildProcess = null;

    if (code !== 0) {
      console.error(`Build failed with exit code ${code}. Waiting for the next file change.`);
    }

    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

function scheduleBuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runBuild, 200);
}

const initialBuild = spawnSync(...buildCommand, {
  cwd: root,
  stdio: "inherit",
  shell: false,
});

if (initialBuild.status !== 0) {
  console.error("Initial build failed. Fix the build error and change a watched file to retry.");
}

const server = run(...serverCommand);

for (const target of watchTargets) {
  const targetPath = path.join(root, target);

  if (!existsSync(targetPath)) {
    continue;
  }

  watch(targetPath, { recursive: statSync(targetPath).isDirectory() }, scheduleBuild);
}

process.on("SIGTERM", () => {
  server.kill("SIGTERM");
  buildProcess?.kill("SIGTERM");
});

process.on("SIGINT", () => {
  server.kill("SIGINT");
  buildProcess?.kill("SIGINT");
});
