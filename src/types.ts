/**
 * Type definitions for the remote-subagents MCP server
 * @module types
 */

/**
 * Configuration options for the remote-subagents MCP server
 */
export interface Config {
  /** Timeout in milliseconds for sandbox operations */
  sandboxTimeoutMs: number;
  /** Timeout in milliseconds for package installation */
  installTimeoutMs: number;
  /** Timeout in milliseconds for agent execution */
  executeTimeoutMs: number;
  /** Claude package to use (e.g., '@anthropic-ai/claude-code') */
  claudePackage: string;
  /** Maximum length for task descriptions */
  maxTaskLength: number;
}

/**
 * Log severity levels
 */
export type LogLevel = "info" | "warn" | "error";

/**
 * Structured log entry
 */
export interface LogEntry {
  /** ISO 8601 timestamp of the log entry */
  timestamp: string;
  /** Severity level of the log */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Optional additional context data */
  [key: string]: unknown;
}

/**
 * Input parameters for spawning a new agent
 */
export interface SpawnAgentInput {
  /** The task description/prompt for the agent */
  task_description: string;
  /** Optional requirements or context to pass to the agent */
  requirements?: string;
}

/**
 * Content block in agent result
 */
export interface ContentBlock {
  /** Content type (typically 'text') */
  type: string;
  /** The actual content text */
  text: string;
}

/**
 * Result returned from spawning an agent
 */
export interface SpawnAgentResult {
  /** Array of content blocks returned by the agent */
  content: ContentBlock[];
  /** Optional flag indicating if an error occurred */
  isError?: boolean;
}

/**
 * Sandbox execution result
 */
export interface ExecutionResult {
  /** Exit code of the command */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
}
