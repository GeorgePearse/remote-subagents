# Remote Subagents

**Spawn ephemeral, remote AI sub-agents using E2B sandboxes.**

This MCP server enables your local AI agent (like Claude Code) to spawn isolated, cloud-based sub-agents for executing tasks safely in sandboxed environments.

## Why Remote Subagents?

- **Isolation**: Run risky operations or untrusted code in secure, ephemeral sandboxes
- **Parallelization**: Spawn multiple agents to work on tasks concurrently
- **Resource Offloading**: Heavy computations run remotely, keeping your local environment clean
- **Safe Exploration**: Let sub-agents explore APIs, install packages, or run experiments without affecting your system

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│   MCP Server    │────▶│  E2B Sandbox    │
│  (Orchestrator) │     │ (remote-agents) │     │  (Sub-agent)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Task Execution │
                                               │  + Results      │
                                               └─────────────────┘
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/GeorgePearse/remote-subagents.git
cd remote-subagents
npm install

# Configure
cp .env.example .env
# Edit .env with your API keys

# Build and run
npm run build
npm start
```

## Features

| Feature | Description |
|---------|-------------|
| `spawn_remote_agent` | Create a sandbox, inject an agent, execute a task |
| Ephemeral Sandboxes | Automatic cleanup after task completion |
| Result Streaming | Get structured results back to your local session |

## Next Steps

- [Installation Guide](getting-started/installation.md) - Detailed setup instructions
- [Basic Usage](usage/basic.md) - Learn how to use the tools
- [Examples](usage/examples.md) - See real-world use cases
