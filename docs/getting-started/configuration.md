# Configuration

## MCP Client Configuration

To use the remote subagents server, you need to configure your MCP client to connect to it.

### Claude Code

Add to your Claude Code MCP settings (`~/.claude/claude_desktop_config.json` or project-level config):

```json
{
  "mcpServers": {
    "remote-subagents": {
      "command": "node",
      "args": ["/path/to/remote-subagents/dist/index.js"],
      "env": {
        "E2B_API_KEY": "your_e2b_key",
        "OPENAI_API_KEY": "your_openai_key"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "remote-subagents": {
      "command": "node",
      "args": ["/absolute/path/to/remote-subagents/dist/index.js"],
      "env": {
        "E2B_API_KEY": "your_e2b_key",
        "OPENAI_API_KEY": "your_openai_key"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `E2B_API_KEY` | Yes | Your E2B API key for sandbox creation |
| `OPENAI_API_KEY` | Yes | OpenAI API key used by the remote sub-agent |

## E2B Configuration

### Getting an E2B API Key

1. Sign up at [e2b.dev](https://e2b.dev)
2. Navigate to your dashboard
3. Copy your API key

### Sandbox Defaults

The server uses default E2B sandbox settings:

- **Timeout**: 5 minutes (free tier default)
- **Template**: Base Python environment
- **Auto-cleanup**: Enabled

!!! tip "Extending timeout"
    For longer-running tasks, you may need an E2B paid plan with extended timeouts.

## OpenAI Configuration

The remote sub-agent uses OpenAI's API for task execution. Ensure your API key has sufficient quota for the tasks you plan to run.

### Recommended Model

The sub-agent uses GPT-4 by default for best results on complex coding tasks.
