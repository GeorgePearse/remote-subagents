# Contributing

We welcome contributions to the Remote Subagents project!

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- E2B and OpenAI API keys for testing

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/remote-subagents.git
   cd remote-subagents
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with your API keys

5. Build:
   ```bash
   npm run build
   ```

## Project Structure

```
remote-subagents/
├── src/
│   └── index.ts      # Main MCP server implementation
├── dist/             # Compiled JavaScript
├── docs/             # Documentation (mkdocs)
├── package.json
├── tsconfig.json
└── mkdocs.yml
```

## Making Changes

### Code Style

- Use TypeScript
- Follow existing code patterns
- Add JSDoc comments for public APIs

### Testing Changes

1. Build the project:
   ```bash
   npm run build
   ```

2. Test locally by configuring your MCP client to use your local build

3. Verify the tool works as expected

## Submitting Changes

### Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Add: description of changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/my-feature
   ```

4. Open a Pull Request against the `main` branch

### Commit Message Format

- `Add:` New features
- `Fix:` Bug fixes
- `Update:` Improvements to existing features
- `Docs:` Documentation changes
- `Refactor:` Code refactoring

## Documentation

Documentation is built with MkDocs Material.

### Local Preview

```bash
pip install mkdocs-material
mkdocs serve
```

Then visit `http://localhost:8000`

### Building Docs

```bash
mkdocs build
```

## Questions?

Open an issue on GitHub for questions or discussions.
