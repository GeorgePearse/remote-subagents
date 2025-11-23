#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Sandbox } from "@e2b/code-interpreter";
import dotenv from "dotenv";

dotenv.config();

const E2B_API_KEY = process.env.E2B_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!E2B_API_KEY) {
  console.error("Error: E2B_API_KEY is required");
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY is required");
  process.exit(1);
}

const server = new Server(
  {
    name: "remote-subagents",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "spawn_remote_agent",
        description: "Spawns an ephemeral remote sub-agent to execute a complex task using Claude Code",
        inputSchema: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "The goal or task for the remote agent to accomplish",
            },
            requirements: {
              type: "string",
              description: "Any specific requirements or context",
            },
          },
          required: ["task_description"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "spawn_remote_agent") {
    const task = request.params.arguments?.task_description as string;
    
    try {
      // 1. Start Sandbox
      console.error("Starting E2B sandbox...");
      const sandbox = await Sandbox.create({
        timeoutMs: 600_000, // 10 minute timeout for sandbox
      });

      // 2. Install Claude Code
      console.error("Installing Claude Code...");
      const installResult = await sandbox.commands.run("sudo npm install -g @anthropic-ai/claude-code", {
        timeoutMs: 120_000,
      });
      console.error(`Install exit code: ${installResult.exitCode}`);

      // 3. Run Claude Code
      console.error("Running Claude Code...");
      // Escape double quotes in task description
      const escapedTask = task.replace(/"/g, '\\"');

      const process = await sandbox.commands.run(
        `claude --dangerously-skip-permissions -p "${escapedTask}"`,
        {
          envs: {
            ANTHROPIC_API_KEY: ANTHROPIC_API_KEY,
          },
          timeoutMs: 300_000, // 5 minutes
        }
      );

      const output = process.stdout;
      const error = process.stderr;
      
      await sandbox.kill();

      return {
        content: [
          {
            type: "text",
            text: `Remote Agent Result:\n${output}\n${error ? `Errors:\n${error}` : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing remote agent: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
