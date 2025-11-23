/**
 * Constants for the remote-subagents MCP server
 * @module constants
 */

/**
 * Server identification
 */
export const SERVER_NAME = "remote-subagents" as const;
export const SERVER_VERSION = "1.0.0" as const;

/**
 * Tool identification
 */
export const TOOL_NAME = "spawn_remote_agent" as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  /** Default sandbox timeout in milliseconds (10 minutes) */
  SANDBOX_TIMEOUT_MS: 600000,
  /** Default package installation timeout in milliseconds (2 minutes) */
  INSTALL_TIMEOUT_MS: 120000,
  /** Default execution timeout in milliseconds (5 minutes) */
  EXECUTE_TIMEOUT_MS: 300000,
  /** Default Claude package to install */
  CLAUDE_PACKAGE: "@anthropic-ai/claude-code",
  /** Default maximum task description length (50KB) */
  MAX_TASK_LENGTH: 51200,
  /** Default graceful shutdown timeout in milliseconds */
  GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10000,
  /** Default retry attempts */
  MAX_RETRIES: 3,
  /** Default base delay for retry backoff in milliseconds */
  RETRY_BASE_DELAY_MS: 1000,
  /** Default maximum delay for retry backoff in milliseconds */
  RETRY_MAX_DELAY_MS: 30000,
} as const;

/**
 * Environment variable names
 */
export const ENV_VARS = {
  /** E2B API key for sandbox access */
  E2B_API_KEY: "E2B_API_KEY",
  /** Anthropic API key for Claude */
  ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
  /** Custom sandbox timeout */
  SANDBOX_TIMEOUT_MS: "SANDBOX_TIMEOUT_MS",
  /** Custom installation timeout */
  INSTALL_TIMEOUT_MS: "INSTALL_TIMEOUT_MS",
  /** Custom execution timeout */
  EXECUTE_TIMEOUT_MS: "EXECUTE_TIMEOUT_MS",
  /** Custom Claude package */
  CLAUDE_PACKAGE: "CLAUDE_PACKAGE",
  /** Custom max task length */
  MAX_TASK_LENGTH: "MAX_TASK_LENGTH",
  /** Log level */
  LOG_LEVEL: "LOG_LEVEL",
  /** Node environment */
  NODE_ENV: "NODE_ENV",
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  SANDBOX_CREATION_ERROR: "SANDBOX_CREATION_ERROR",
  CLAUDE_INSTALL_ERROR: "CLAUDE_INSTALL_ERROR",
  CLAUDE_EXECUTION_ERROR: "CLAUDE_EXECUTION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Standardized error message templates
 * Use {{placeholder}} syntax for dynamic values
 */
export const ERROR_MESSAGES = {
  // Environment errors
  MISSING_E2B_KEY: "E2B_API_KEY environment variable is required",
  MISSING_ANTHROPIC_KEY: "ANTHROPIC_API_KEY environment variable is required",

  // Sandbox errors
  SANDBOX_CREATE_FAILED:
    "Failed to create sandbox: {{error}}",
  SANDBOX_TIMEOUT:
    "Sandbox creation timed out after {{timeout}}ms",

  // Installation errors
  INSTALL_FAILED:
    "Failed to install {{package}} (exit code {{exitCode}}): {{error}}",
  INSTALL_TIMEOUT:
    "Package installation timed out after {{timeout}}ms",

  // Execution errors
  EXECUTION_FAILED:
    "Claude execution failed (exit code {{exitCode}}): {{error}}",
  EXECUTION_TIMEOUT:
    "Claude execution timed out after {{timeout}}ms",

  // Validation errors
  INVALID_INPUT: "Invalid input: {{error}}",
  TASK_EMPTY: "task_description cannot be empty",
  TASK_TOO_LONG:
    "task_description exceeds maximum length of {{maxLength}} characters",

  // Unknown tool
  UNKNOWN_TOOL: "Unknown tool: {{toolName}}",

  // Shutdown errors
  SHUTDOWN_TIMEOUT: "Graceful shutdown timed out after {{timeout}}ms",
  SANDBOX_KILL_FAILED: "Failed to terminate sandbox {{sandboxId}}: {{error}}",
} as const;

/**
 * Log levels
 */
export const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
} as const;

/**
 * MCP tool schema definition
 */
export const TOOL_SCHEMA = {
  name: TOOL_NAME,
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
        description:
          "Any specific requirements or context to pass to the agent",
      },
    },
    required: ["task_description"],
  },
} as const;

/**
 * Type exports derived from constants
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type EnvVar = (typeof ENV_VARS)[keyof typeof ENV_VARS];
