# IntelliTokens - Language Server Extension

A Visual Studio Code extension that provides language server protocol (LSP) support for design token management. This extension offers intelligent IntelliSense, diagnostics, navigation, and validation for design tokens used across your codebase.

## 🎯 Overview

Token Language Extension helps development teams maintain consistency in their design systems by providing IDE-level support for design tokens. It validates token usage, provides auto-completion, enables jump-to-definition, and offers real-time diagnostics to catch token-related issues early in the development process.

## ✨ Features

### 🔍 **Intelligent Token Detection**
- Automatically identifies design tokens across multiple file types (JavaScript, TypeScript, CSS, SCSS, JSON, and more)
- Supports custom regex matchers for flexible token identification
- Works seamlessly with your existing design token workflow

### 💡 **IntelliSense & Auto-completion**
- Context-aware token suggestions as you type
- Smart completion for token names and values
- Reduces typos and speeds up development

### 🚨 **Real-time Diagnostics**
- **Duplicate Token Detection**: Identifies tokens defined multiple times
- **Invalid Token Validation**: Catches malformed or incorrect token definitions
- **Alias Token Checking**: Validates token aliases and references
- **Value Token Verification**: Ensures token values are properly formatted
- Configurable problem limit (default: 100 issues per file)

### 🎯 **Code Navigation**
- **Go to Definition**: Jump directly to token source definitions
- **Find All References**: Locate all usages of a token across your workspace
- **Hover Information**: View token details, values, and metadata on hover

### 🔄 **Live Updates**
- Watches for file changes in your token source files
- Automatically rebuilds and updates IntelliSense when tokens change
- Supports custom build commands for token generation

## 📋 Requirements

### System Requirements
- **Visual Studio Code**: Version 1.101.0 or higher
- **Node.js**: Version 20.x or higher
- **pnpm**: Version 10.11.1 or higher (recommended package manager)

### Recommended Extensions
Install these VS Code extensions for the best development experience:
- `dbaeumer.vscode-eslint` - ESLint support
- `ms-vscode.extension-test-runner` - For running extension tests (development)

## 🚀 Installation

### For Users (TBC)
1. Download the `.vsix` file from the releases page
2. Open VS Code
3. Go to Extensions view (`Cmd+Shift+X` on macOS or `Ctrl+Shift+X` on Windows/Linux)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### For Development

#### 1. Clone the Repository
```bash
git clone https://github.com/mbao01/token-language.git
cd token-language
```

#### 2. Install Dependencies
```bash
# Install project dependencies
pnpm install
```

#### 3. Build the Project
```bash
# Compile all packages
pnpm compile

# Or use the build command
pnpm -r build
```

#### 4. Run in Development Mode
- Press `F5` in VS Code to open a new Extension Development Host window
- The extension will be automatically loaded and ready for testing

## 🏗️ Project Structure

This is a monorepo project with three main packages:

```
token-language/
├── packages/
│   ├── client/          # VS Code extension client
│   ├── server/          # Language server implementation
│   └── tokens/          # Token utilities and helpers
├── scripts/             # Build and test scripts
└── package.json         # Root workspace configuration
```

### Package Details

#### **Client** (`packages/client`)
- VS Code extension activation and client-side logic
- Communicates with the language server via Language Server Protocol
- Handles document synchronization and file watching

#### **Server** (`packages/server`)
- Language server implementation using `vscode-languageserver`
- Provides token diagnostics, completion, hover, definitions, and references
- Processes token files and maintains token storage

#### **Tokens** (`packages/tokens`)
- Utility library for token manipulation and processing
- Hierarchical token organization with D3.js
- Token transformation and validation helpers
- Markdown rendering for token documentation

## ⚙️ Configuration

Configure the extension through VS Code settings (`settings.json`):

### `tokenLanguage.maxNumberOfProblems`
- **Type**: `number`
- **Default**: `100`
- **Description**: Controls the maximum number of problems produced by the server

### `tokenLanguage.build.command`
- **Type**: `string`
- **Description**: Command to build your tokens JSON file. Ideally, use a watch command for automatic rebuilds
- **Example**: `"pnpm build:tokens -- --watch"`

### `tokenLanguage.tokens.json`
- **Type**: `string`
- **Description**: Path to the JSON file containing your token distribution (should be an array of token objects)
- **Example**: `"${workspaceFolder}/dist/tokens.json"`

### `tokenLanguage.tokens.srcPackage`
- **Type**: `string`
- **Description**: Absolute path to the tokens package where the build command runs. Used to exclude the tokens project from certain diagnostics
- **Example**: `"${workspaceFolder}/packages/design-tokens"`

### `tokenLanguage.tokens.matchers`
- **Type**: `array`
- **Description**: Custom regex patterns to identify tokens in your code
- **Example**: 
  ```json
  [
    "token\\.[a-zA-Z0-9._-]+",
    "\\$[a-zA-Z0-9-_]+"
  ]
  ```

### `tokenLanguage.trace.server`
- **Type**: `string`
- **Values**: `"off"`, `"messages"`, `"verbose"`
- **Default**: `"off"`
- **Description**: Traces communication between VS Code and the language server (useful for debugging)

### Example Configuration

```json
{
  "tokenLanguage.maxNumberOfProblems": 100,
  "tokenLanguage.build.command": "pnpm build:tokens -- --watch",
  "tokenLanguage.tokens.json": "${workspaceFolder}/dist/tokens.json",
  "tokenLanguage.tokens.srcPackage": "${workspaceFolder}/packages/tokens",
  "tokenLanguage.tokens.matchers": [
    "tokens?\\.[a-zA-Z0-9._-]+",
    "\\$[a-zA-Z0-9-_]+"
  ],
  "tokenLanguage.trace.server": "off"
}
```

## 🔧 Technology Stack

### Core Technologies
- **TypeScript**: `5` - Type-safe development
- **VS Code Extension API**: `>=1.101.0` - Extension framework
- **Language Server Protocol**: `>=9.0.1` - LSP implementation

### Development Tools
- **pnpm**: `10` - Fast, disk-efficient package manager
- **Mocha**: `>=10.3.0` - Test framework

### Key Dependencies
- **vscode-languageclient**: Client-side LSP implementation
- **vscode-languageserver**: Server-side LSP implementation
- **vscode-languageserver-textdocument**: Text document utilities
- **fast-glob**: Fast file globbing
- **d3**: Data visualization for token hierarchy
- **puppeteer**: Browser automation for token visualization

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

This will:
1. Compile the project
2. Set up the test environment
3. Run end-to-end tests in a VS Code instance

### Run Tests with Watch Mode
```bash
# Start the watch task
pnpm watch

# In VS Code, use the Testing view to run tests
```

### Test Structure
- Client tests: `packages/client/src/test/`
  - `completion.test.ts` - Auto-completion tests
  - `diagnostics.test.ts` - Diagnostics validation tests
- Test fixtures: `packages/client/testFixture/`

## 🛠️ Development Workflow

### 1. Make Changes
Edit files in `packages/client`, `packages/server`, or `packages/tokens`

### 2. Build
```bash
# Build all packages
pnpm compile

# Or build in watch mode for auto-rebuild
pnpm watch
```

### 3. Test in Extension Host
- Press `F5` to launch the Extension Development Host
- The extension will reload automatically in watch mode
- Or manually reload with `Cmd+R` (macOS) / `Ctrl+R` (Windows/Linux)

### 4. Debug
- Set breakpoints in TypeScript source files
- View logs in the Debug Console
- Use `tokenLanguage.trace.server: "verbose"` for detailed LSP communication logs

### 5. Lint
```bash
pnpm lint
```

## 📦 Building for Production

### Create VSIX Package
```bash
# Prepare for production
pnpm vscode:prepublish

# Package the extension (requires vsce)
pnpm add -g @vscode/vsce
vsce package
```

This creates a `.vsix` file that can be installed or published to the VS Code Marketplace.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Write tests** for new features
3. **Follow the existing code style** (ESLint will help)
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Development Guidelines
- Use TypeScript for type safety
- Follow the established project structure
- Add tests for new functionality
- Keep commits atomic and well-described
- Update the CHANGELOG for notable changes

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm compile` | Build all packages |
| `pnpm watch` | Build in watch mode |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run end-to-end tests |
| `pnpm vscode:prepublish` | Prepare for publishing |

## 🐛 Known Issues

- The extension currently activates on `plaintext` files by default
- Large token files (>10,000 tokens) may experience slight performance delays
- Custom matchers require regex knowledge for optimal configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Ayomide Bakare** (@mbao01)
- Publisher: ayomide-bakare
- GitHub: [@mbao01](https://github.com/mbao01)

## 🔗 Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## 📮 Feedback & Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/mbao01/token-language/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/mbao01/token-language/discussions)

---

**Happy coding with IntelliTokens! 🎨✨**
