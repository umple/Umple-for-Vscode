#!/bin/sh
# Prepare a self-contained umple.vscode/ for vsce packaging.
#
# Usage:
#   UMPLE_LSP_DIR=/path/to/umple-lsp ./scripts/prepare-vsix.sh
#
# Or pass as argument:
#   ./scripts/prepare-vsix.sh /path/to/umple-lsp
#
# The umple-lsp directory must already be built (npm install && npm run compile).
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VSCODE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve umple-lsp directory from argument, env var, or default sibling
UMPLE_LSP_DIR="${1:-${UMPLE_LSP_DIR:-$(cd "$VSCODE_DIR/../umple-lsp" 2>/dev/null && pwd)}}"

if [ -z "$UMPLE_LSP_DIR" ] || [ ! -d "$UMPLE_LSP_DIR" ]; then
  echo "Error: Cannot find umple-lsp directory." >&2
  echo "Set UMPLE_LSP_DIR or pass it as an argument." >&2
  exit 1
fi

SERVER_DIR="$UMPLE_LSP_DIR/packages/server"
ROOT_NM="$UMPLE_LSP_DIR/node_modules"

if [ ! -d "$SERVER_DIR/out" ]; then
  echo "Error: Server not built. Run 'npm run compile' in $UMPLE_LSP_DIR first." >&2
  exit 1
fi

echo "prepare-vsix: using umple-lsp at $UMPLE_LSP_DIR"

# Clean install extension's own deps (vscode-languageclient, etc.)
rm -rf "$VSCODE_DIR/node_modules"
(cd "$VSCODE_DIR" && npm install --production)

# Copy server package (real copy, not symlink)
SERVER_NM="$VSCODE_DIR/node_modules/umple-lsp-server"
mkdir -p "$SERVER_NM/out"
cp "$SERVER_DIR/package.json" "$SERVER_NM/"
cp "$SERVER_DIR/out/"*.js "$SERVER_NM/out/"
cp "$SERVER_DIR/out/"*.js.map "$SERVER_NM/out/" 2>/dev/null || true
cp "$SERVER_DIR/out/"*.d.ts "$SERVER_NM/out/" 2>/dev/null || true
cp "$SERVER_DIR/tree-sitter-umple.wasm" "$SERVER_NM/" 2>/dev/null || true
cp "$SERVER_DIR/umplesync.jar" "$SERVER_NM/" 2>/dev/null || true

# Copy server runtime dependencies from umple-lsp's node_modules
for dep in vscode-languageserver vscode-languageserver-protocol \
           vscode-languageserver-types vscode-jsonrpc \
           vscode-languageserver-textdocument \
           web-tree-sitter; do
  if [ -d "$ROOT_NM/$dep" ]; then
    cp -R "$ROOT_NM/$dep" "$VSCODE_DIR/node_modules/$dep"
  else
    echo "Warning: $dep not found in $ROOT_NM" >&2
  fi
done

echo "prepare-vsix: done"
