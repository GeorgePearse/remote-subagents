# Basic Usage

## The `spawn_remote_agent` Tool

The primary tool provided by this MCP server is `spawn_remote_agent`. It creates an ephemeral E2B sandbox, injects a lightweight AI agent, and executes your specified task.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_description` | string | Yes | Description of the task to perform |
| `requirements` | string | No | Additional context or requirements |

## How It Works

1. **Sandbox Creation**: An E2B sandbox is spun up in the cloud
2. **Agent Injection**: A lightweight agent with OpenAI integration is deployed
3. **Task Execution**: The agent works on your task with full sandbox access
4. **Result Return**: Results are collected and returned to your local session
5. **Cleanup**: The sandbox automatically terminates

## Basic Example

Ask your AI assistant to use the tool:

```
Spawn a remote agent to write a Python script that generates
a random maze and solves it using BFS.
```

The assistant will call:

```json
{
  "task_description": "Write a Python script that generates a random maze and solves it using BFS",
  "requirements": "Include visualization using ASCII art"
}
```

## What the Sub-Agent Can Do

The remote sub-agent has full access to:

- **File System**: Create, read, write, delete files
- **Package Installation**: Install Python packages via pip
- **Code Execution**: Run Python scripts and see output
- **Shell Commands**: Execute bash commands

## Best Practices

!!! tip "Be Specific"
    Provide clear, detailed task descriptions for best results.

!!! tip "Include Requirements"
    Use the `requirements` parameter to specify constraints, languages, or expected outputs.

!!! warning "Ephemeral Environment"
    Remember that sandboxes are temporary. Results are returned as text - files created in the sandbox are not persisted.

## Limitations

- Sandboxes timeout after ~5 minutes (free tier)
- No persistent storage between runs
- Network access may be limited depending on E2B plan
- Results are text-based summaries, not file transfers
