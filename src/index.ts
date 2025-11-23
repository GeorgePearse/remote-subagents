#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Sandbox } from "@e2b/code-interpreter";
import dotenv from "dotenv";
import { escapeShellArg, log, createSpawnAgentInputSchema } from "./utils.js";

dotenv.config();

// Configuration with environment variable overrides
const CONFIG = {
  sandboxTimeoutMs: parseInt(process.env.SANDBOX_TIMEOUT_MS || "600000", 10),
  installTimeoutMs: parseInt(process.env.INSTALL_TIMEOUT_MS || "120000", 10),
  executeTimeoutMs: parseInt(process.env.EXECUTE_TIMEOUT_MS || "300000", 10),
  claudePackage: process.env.CLAUDE_PACKAGE || "@anthropic-ai/claude-code",
  maxTaskLength: parseInt(process.env.MAX_TASK_LENGTH || "51200", 10), // 50KB default
};

// Environment validation
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

// Input validation schema using zod
const SpawnAgentInputSchema = createSpawnAgentInputSchema(CONFIG.maxTaskLength);

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
        description:
          "Spawns an ephemeral remote sub-agent to execute a complex task using Claude Code",
        inputSchema: {
          type: "object",
          properties: {
            task_description: {
              type: "string",
              description: "The goal or task for the remote agent to accomplish",
            },
            requirements: {
              type: "string",
              description: "Any specific requirements or context to pass to the agent",
            },
          },
          required: ["task_description"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "spawn_remote_agent") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  // Validate input with zod
  const parseResult = SpawnAgentInputSchema.safeParse(request.params.arguments);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((e) => `${String(e.path.join("."))}: ${e.message}`)
      .join(", ");
    return {
      content: [
        {
          type: "text",
          text: `Invalid input: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }

  const { task_description, requirements } = parseResult.data;
  let sandbox: Sandbox | null = null;

  try {
    // 1. Start Sandbox
    log("info", "Starting E2B sandbox", { timeoutMs: CONFIG.sandboxTimeoutMs });
    sandbox = await Sandbox.create({
      timeoutMs: CONFIG.sandboxTimeoutMs,
    });

    // 2. Install Claude Code
    log("info", "Installing Claude Code", { package: CONFIG.claudePackage });
    const installResult = await sandbox.commands.run(
      `sudo npm install -g ${CONFIG.claudePackage}`,
      { timeoutMs: CONFIG.installTimeoutMs }
    );

    if (installResult.exitCode !== 0) {
      throw new Error(
        `Failed to install Claude Code (exit ${installResult.exitCode}): ${installResult.stderr}`
      );
    }
    log("info", "Claude Code installed", { exitCode: installResult.exitCode });

    // 3. Build task prompt with optional requirements
    let prompt = task_description;
    if (requirements) {
      prompt = `${task_description}\n\nRequirements:\n${requirements}`;
    }

    // 4. Run Claude Code with safe shell escaping
    log("info", "Running Claude Code", { taskLength: prompt.length });
    const escapedPrompt = escapeShellArg(prompt);

    const result = await sandbox.commands.run(
      `claude --dangerously-skip-permissions -p ${escapedPrompt}`,
      {
        envs: { ANTHROPIC_API_KEY },
        timeoutMs: CONFIG.executeTimeoutMs,
      }
    );

    log("info", "Claude execution complete", { exitCode: result.exitCode });

    const output = result.stdout || "";
    const errorOutput = result.stderr || "";

    return {
      content: [
        {
          type: "text",
          text: `Remote Agent Result:\n${output}${errorOutput ? `\n\nStderr:\n${errorOutput}` : ""}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("error", "Remote agent execution failed", { error: errorMessage });

    return {
      content: [
        {
          type: "text",
          text: `Error executing remote agent: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  } finally {
    // Always clean up sandbox
    if (sandbox) {
      try {
        await sandbox.kill();
        log("info", "Sandbox terminated");
      } catch (killError) {
        log("warn", "Failed to kill sandbox", {
          error: killError instanceof Error ? killError.message : String(killError),
        });
      }
    }
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
