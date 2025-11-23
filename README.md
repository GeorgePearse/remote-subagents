# Remote Sub-agents MCP Server

[![npm version](https://img.shields.io/npm/v/remote-subagents.svg)](https://www.npmjs.com/package/remote-subagents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/GeorgePearse/remote-subagents/actions/workflows/test.yml/badge.svg)](https://github.com/GeorgePearse/remote-subagents/actions)

An MCP (Model Context Protocol) server that enables your local AI agent to spawn ephemeral, remote sub-agents using E2B sandboxes.

## Features

- **Ephemeral Sandboxes**: Each task runs in an isolated E2B cloud environment
- **Secure Execution**: Risky operations happen remotely, not on your machine
- **Claude Code Integration**: Sub-agents use Claude Code for complex task execution
- **Configurable Timeouts**: Customizable timeouts for sandbox, install, and execution phases
- **Structured Logging**: JSON-formatted logs for easy parsing and monitoring
- **Graceful Shutdown**: Proper cleanup of sandboxes on termination

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│                  (Claude Desktop / claude-code)                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ MCP Protocol (stdio)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Remote Sub-agents Server                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   Metrics   │  │   Logging    │  │   Shutdown Handler     │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              spawn_remote_agent Tool                        ││
│  │  • Input validation (Zod)                                   ││
│  │  • Shell argument escaping                                  ││
│  │  • Sandbox lifecycle management                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────┬───────────────────────────────────┘
                              │ E2B API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      E2B Cloud Sandbox                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  1. npm install @anthropic-ai/claude-code                   ││
│  │  2. claude --dangerously-skip-permissions -p "<task>"       ││
│  │  3. Return stdout/stderr                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                        (Auto-terminated)                         │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. MCP client sends `spawn_remote_agent` tool call
2. Server validates input using Zod schema
3. E2B sandbox is created with configured timeout
4. Claude Code is installed in the sandbox
5. Task is executed with properly escaped arguments
6. Results (stdout/stderr) are returned to client
7. Sandbox is terminated and cleaned up

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GeorgePearse/remote-subagents.git
cd remote-subagents

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
E2B_API_KEY=your_e2b_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
EOF

# Build and start
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `E2B_API_KEY` | Yes | - | Your E2B API key for sandbox access |
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key for Claude |
| `SANDBOX_TIMEOUT_MS` | No | `600000` | Sandbox lifetime (10 minutes) |
| `INSTALL_TIMEOUT_MS` | No | `120000` | npm install timeout (2 minutes) |
| `EXECUTE_TIMEOUT_MS` | No | `300000` | Claude execution timeout (5 minutes) |
| `CLAUDE_PACKAGE` | No | `@anthropic-ai/claude-code` | Claude package to install |
| `MAX_TASK_LENGTH` | No | `51200` | Maximum task description length (50KB) |

### Example `.env` File

```env
# Required
E2B_API_KEY=e2b_xxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

# Optional - Custom timeouts
SANDBOX_TIMEOUT_MS=900000      # 15 minutes
INSTALL_TIMEOUT_MS=180000      # 3 minutes
EXECUTE_TIMEOUT_MS=600000      # 10 minutes
MAX_TASK_LENGTH=102400         # 100KB
```

### MCP Client Configuration

Add to your Claude Desktop or claude-code configuration:

```json
{
  "mcpServers": {
    "remote-subagents": {
      "command": "node",
      "args": ["/path/to/remote-subagents/dist/index.js"],
      "env": {
        "E2B_API_KEY": "your_e2b_api_key",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key"
      }
    }
  }
}
```

## Usage

### Tool: `spawn_remote_agent`

Spawns an ephemeral remote sub-agent to execute a complex task.

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `task_description` | string | Yes | The goal or task for the remote agent |
| `requirements` | string | No | Additional requirements or context |

**Example:**

```typescript
// From your MCP client
const result = await client.callTool("spawn_remote_agent", {
  task_description: "Create a Python script that fetches weather data from OpenWeatherMap API",
  requirements: "Use requests library, handle errors gracefully, output as JSON"
});
```

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- E2B account and API key
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build TypeScript
npm run build

# Run locally
npm start
```

### Project Structure

```
remote-subagents/
├── src/
│   ├── index.ts        # Main MCP server entry point
│   ├── utils.ts        # Utility functions (escaping, logging, validation)
│   ├── utils.test.ts   # Unit tests
│   ├── types.ts        # TypeScript interfaces
│   ├── errors.ts       # Custom error classes
│   ├── constants.ts    # Configuration constants
│   ├── metrics.ts      # Metrics collection
│   ├── retry.ts        # Retry utility with backoff
│   └── shutdown.ts     # Graceful shutdown handling
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/utils.test.ts

# Watch mode
npm run test:watch
```

## Troubleshooting

### Common Issues

#### Sandbox Creation Fails

**Symptom:** `Failed to create sandbox` error

**Solutions:**
- Verify your `E2B_API_KEY` is valid
- Check E2B service status at [status.e2b.dev](https://status.e2b.dev)
- Ensure you have available sandbox quota

#### Claude Installation Timeout

**Symptom:** `Package installation timed out` error

**Solutions:**
- Increase `INSTALL_TIMEOUT_MS` (default is 2 minutes)
- Check network connectivity in sandbox region

#### Task Execution Timeout

**Symptom:** `Claude execution timed out` error

**Solutions:**
- Increase `EXECUTE_TIMEOUT_MS` for complex tasks
- Break down large tasks into smaller sub-tasks
- Check if the task is stuck (infinite loop, waiting for input)

#### Invalid API Key

**Symptom:** `ANTHROPIC_API_KEY is required` or authentication errors

**Solutions:**
- Verify the API key is correct and active
- Ensure the key has appropriate permissions
- Check for extra whitespace in the `.env` file

### Debug Mode

Enable verbose logging by checking stderr output:

```bash
npm start 2>debug.log
```

### Getting Help

- [GitHub Issues](https://github.com/GeorgePearse/remote-subagents/issues)
- [E2B Documentation](https://e2b.dev/docs)
- [MCP Specification](https://modelcontextprotocol.io)

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with a descriptive message
6. Push and create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier)
- Add JSDoc comments for public functions
- Write unit tests for new functionality

### Commit Messages

Use conventional commit format:

```
feat: add retry logic for sandbox creation
fix: handle unicode characters in task description
docs: update configuration section
test: add edge cases for shell escaping
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Request review from maintainers

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [GitHub Repository](https://github.com/GeorgePearse/remote-subagents)
- [Issue Tracker](https://github.com/GeorgePearse/remote-subagents/issues)
- [E2B Platform](https://e2b.dev)
- [MCP Specification](https://modelcontextprotocol.io)
