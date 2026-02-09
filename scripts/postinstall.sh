#!/bin/sh
# Fetch the umple-lsp server and copy it into node_modules/.
# Skipped if umple-lsp-server is already in node_modules.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VSCODE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LSP_DIR="$VSCODE_DIR/.umple-lsp"
SERVER_NM="$VSCODE_DIR/node_modules/umple-lsp-server"

# Already available — nothing to do
if [ -d "$SERVER_NM/out" ]; then
  exit 0
fi

# Clone and build umple-lsp
echo "postinstall: cloning umple-lsp ..."
if [ -d "$LSP_DIR" ]; then
  cd "$LSP_DIR" && git pull
else
  git clone https://github.com/DraftTin/umple-lsp.git "$LSP_DIR"
fi

echo "postinstall: building ..."
cd "$LSP_DIR" && npm install
cd "$LSP_DIR" && npm run compile
cd "$LSP_DIR" && npm run download-jar

# Copy server + runtime deps into node_modules
SERVER_DIR="$LSP_DIR/packages/server"
LSP_NM="$LSP_DIR/node_modules"

echo "postinstall: copying server into node_modules ..."
rm -rf "$SERVER_NM"
mkdir -p "$SERVER_NM/out"
cp "$SERVER_DIR/package.json" "$SERVER_NM/"
cp "$SERVER_DIR/out/"*.js "$SERVER_NM/out/"
cp "$SERVER_DIR/out/"*.js.map "$SERVER_NM/out/" 2>/dev/null || true
cp "$SERVER_DIR/out/"*.d.ts "$SERVER_NM/out/" 2>/dev/null || true
cp "$SERVER_DIR/tree-sitter-umple.wasm" "$SERVER_NM/" 2>/dev/null || true
cp "$SERVER_DIR/umplesync.jar" "$SERVER_NM/" 2>/dev/null || true

for dep in vscode-languageserver vscode-languageserver-protocol \
           vscode-languageserver-types vscode-jsonrpc \
           vscode-languageserver-textdocument web-tree-sitter; do
  if [ -d "$LSP_NM/$dep" ]; then
    cp -R "$LSP_NM/$dep" "$VSCODE_DIR/node_modules/$dep"
  fi
done

echo "postinstall: done"
