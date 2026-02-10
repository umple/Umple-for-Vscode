const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const VSCODE_DIR = path.resolve(__dirname, "..");
const LSP_DIR = path.join(VSCODE_DIR, ".umple-lsp");
const SERVER_NM = path.join(VSCODE_DIR, "node_modules", "umple-lsp-server");

// Already available — nothing to do
if (fs.existsSync(path.join(SERVER_NM, "out"))) {
  process.exit(0);
}

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

// Clone and build umple-lsp
if (fs.existsSync(path.join(LSP_DIR, ".git"))) {
  console.log("postinstall: updating umple-lsp ...");
  run("git pull", LSP_DIR);
} else {
  console.log("postinstall: cloning umple-lsp ...");
  run(`git clone https://github.com/DraftTin/umple-lsp.git "${LSP_DIR}"`);
}

console.log("postinstall: installing dependencies ...");
run("npm install --ignore-scripts", LSP_DIR);

// Copy WASM manually (normally done by postinstall script we skipped)
const wasmSrc = path.join(LSP_DIR, "packages", "tree-sitter-umple", "tree-sitter-umple.wasm");
const wasmDst = path.join(LSP_DIR, "packages", "server", "tree-sitter-umple.wasm");
if (fs.existsSync(wasmSrc)) {
  fs.copyFileSync(wasmSrc, wasmDst);
}

console.log("postinstall: compiling ...");
run("npm run compile", LSP_DIR);

console.log("postinstall: downloading umplesync.jar ...");
run("npm run download-jar", LSP_DIR);

// Copy server + runtime deps into node_modules
const SERVER_DIR = path.join(LSP_DIR, "packages", "server");
const LSP_NM = path.join(LSP_DIR, "node_modules");

console.log("postinstall: copying server into node_modules ...");
fs.rmSync(SERVER_NM, { recursive: true, force: true });
fs.mkdirSync(path.join(SERVER_NM, "out"), { recursive: true });

// Copy server files
for (const file of ["package.json", "tree-sitter-umple.wasm", "umplesync.jar"]) {
  const src = path.join(SERVER_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(SERVER_NM, file));
  }
}
for (const file of fs.readdirSync(path.join(SERVER_DIR, "out"))) {
  fs.copyFileSync(
    path.join(SERVER_DIR, "out", file),
    path.join(SERVER_NM, "out", file)
  );
}

// Copy server runtime deps
const deps = [
  "vscode-languageserver",
  "vscode-languageserver-protocol",
  "vscode-languageserver-types",
  "vscode-jsonrpc",
  "vscode-languageserver-textdocument",
  "web-tree-sitter",
];
for (const dep of deps) {
  const src = path.join(LSP_NM, dep);
  const dst = path.join(VSCODE_DIR, "node_modules", dep);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dst, { recursive: true });
  }
}

console.log("postinstall: done");
