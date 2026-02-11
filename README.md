# Umple for VS Code

A VS Code extension for the [Umple](https://www.umple.org) modeling language. Provides IDE features for `.ump` files.

## Features

- **Diagnostics** - Real-time error and warning detection via the Umple compiler
- **Go-to-definition** - Jump to classes, attributes, state machines, states, and associations
- **Code completion** - Context-aware keyword and symbol suggestions
- **Syntax highlighting** - TextMate grammar for accurate highlighting
- **Cross-file support** - Transitive `use` statement resolution and cross-file diagnostics
- **Import error reporting** - Errors in imported files shown on the `use` statement line

## Requirements

- **Node.js 18+**
- **Java 11+** (optional — only needed for diagnostics)
- **Git** (for fetching the LSP server)

## Installation

Install from the VS Code Marketplace (coming soon), or build from source:

```bash
git clone https://github.com/umple/umple.vscode.git
cd umple.vscode
npm install      # automatically clones, builds, and copies the LSP server
npm run compile
```

To package as `.vsix`:

```bash
npx @vscode/vsce package
```

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `umple.autoUpdate` | boolean | `true` | Automatically update umplesync.jar on startup |

## Development

To test local changes to the LSP server:

1. Clone both repos side by side:

```
workspace/
├── umple-lsp/       # LSP server monorepo
└── umple.vscode/    # This extension
```

2. Build the server:

```bash
cd umple-lsp
npm install
npm run compile
npm run download-jar
```

3. Link the local server into the extension:

```bash
cd umple.vscode
npm install
npm link ../umple-lsp/packages/server
npm run compile
```

4. Press **F5** in VS Code to launch the Extension Development Host.

5. After making changes to the server, recompile and reload:

```bash
cd umple-lsp
npm run compile
```

Then in the dev host: `Cmd+Shift+P` (or `Ctrl+Shift+P`) → **Developer: Reload Window**

## Architecture

This extension is a thin client that launches the [Umple LSP server](https://github.com/umple/umple-lsp). The server handles diagnostics, completion, and go-to-definition.

```
VS Code Extension (this repo)
  |
  +-- (stdio) --> umple-lsp-server --> umplesync.jar (diagnostics)
                    |
                    +-- tree-sitter (go-to-definition, symbol indexing)
```
