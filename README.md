# Umple for VS Code

A VS Code extension for the [Umple](https://www.umple.org) modeling language. Provides IDE features for `.ump` files.

## Features

- **Diagnostics** - Real-time error and warning detection via the Umple compiler
- **Go-to-definition** - Jump to classes, attributes, state machines, states, and associations
- **Code completion** - Context-aware keyword and symbol suggestions
- **Syntax highlighting** - TextMate grammar for accurate highlighting
- **Cross-file support** - Transitive `use` statement resolution and cross-file diagnostics
- **Import error reporting** - Errors in imported files shown on the `use` statement line

## Prerequisites

- **Node.js 18+**
- **Java 11+** (for the Umple compiler)

## Installation

Install from the VS Code Marketplace (coming soon) or build from source:

```bash
# Clone this repo and the LSP server
git clone https://github.com/DraftTin/umple.vscode.git
git clone https://github.com/DraftTin/umple-lsp.git

# Build the LSP server
cd umple-lsp
npm install
npm run compile
npm run download-jar
cd ..

# Build the extension
cd umple.vscode
npm install
npm link ../umple-lsp/packages/server
npm run compile
```

## Development

```bash
# Link the local server package for development
npm link ../umple-lsp/packages/server

# Compile
npm run compile

# Watch mode
npm run watch
```

Test by pressing `F5` in VS Code to launch the Extension Development Host, then open a `.ump` file.

## Packaging

To build a `.vsix` for distribution:

```bash
UMPLE_LSP_DIR=../umple-lsp ./scripts/prepare-vsix.sh
npx @vscode/vsce package
```

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `umple.autoUpdate` | boolean | `true` | Automatically update umplesync.jar on startup |

## Architecture

This extension is a thin client that launches the [Umple LSP server](https://github.com/DraftTin/umple-lsp). The server handles diagnostics, completion, and go-to-definition.

```
VS Code Extension (this repo)
  |
  +-- (stdio) --> umple-lsp-server --> umplesync.jar (diagnostics)
                    |
                    +-- tree-sitter (go-to-definition, symbol indexing)
```
