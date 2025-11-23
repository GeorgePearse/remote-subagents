# Remote Sub-agents MCP Server

This MCP server enables your local AI agent (like `claude-code`) to spawn ephemeral, remote sub-agents using E2B sandboxes.

## Architecture

1.  **Local Manager**: Your local `claude-code` acts as the orchestrator.
2.  **MCP Server**: This server exposes tools to manage remote tasks.
3.  **E2B Sandboxes**: Ephemeral cloud environments where sub-agents run safely.

## Features

-   **`spawn_remote_agent`**: Creates a secure sandbox, injects a lightweight agent, and executes a specific task.
-   **Isolation**: Risky operations or heavy API explorations happen remotely.
-   **Context**: Returns the result of the remote task back to your local session.

## Setup

1.  Clone this repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file:
    ```
    E2B_API_KEY=your_e2b_key
    OPENAI_API_KEY=your_openai_key  # Required for the remote sub-agent
    ```
4.  Build and run:
    ```bash
    npm run build
    npm start
    ```

## Usage

Configure your MCP client (e.g., Claude Desktop, `claude-code` config) to point to this server.

### Tool: `spawn_remote_agent`

Arguments:
- `task_description`: Description of the task to perform.
- `requirements`: (Optional) Any specific requirements or context.
