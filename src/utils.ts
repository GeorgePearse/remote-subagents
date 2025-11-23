/**
 * @module utils
 * @description Utility functions for shell argument escaping, structured logging, and schema validation
 */

import { z } from "zod";

/**
 * Escapes a string argument for safe use in shell commands by wrapping it in single quotes
 * and escaping any existing single quotes within the string.
 *
 * This function prevents command injection by ensuring special characters are properly escaped
 * when constructing shell commands. It uses the POSIX shell escaping method where single quotes
 * preserve literal values, and embedded single quotes are handled by ending the quoted string,
 * adding an escaped quote, and starting a new quoted string.
 *
 * @param {string} arg - The string argument to escape for shell execution
 * @returns {string} The escaped string safe for use in shell commands, wrapped in single quotes
 *
 * @example
 * // Simple string without special characters
 * escapeShellArg("hello");
 * // Returns: "'hello'"
 *
 * @example
 * // String containing single quotes
 * escapeShellArg("it's working");
 * // Returns: "'it'\\''s working'"
 *
 * @example
 * // String with potential command injection attempt
 * escapeShellArg("data'; rm -rf /");
 * // Returns: "'data'\\'; rm -rf /'"
 *
 * @example
 * // Prevent variable expansion
 * escapeShellArg("$HOME");
 * // Returns: "'$HOME'" (variable not expanded)
 *
 * @example
 * // Prevent command substitution
 * escapeShellArg("$(whoami)");
 * // Returns: "'$(whoami)'" (command not executed)
 */
export function escapeShellArg(arg: string): string {
  return "'" + arg.replace(/'/g, "'\\''") + "'";
}

/**
 * Logs a structured JSON message to stderr with timestamp, level, message, and optional metadata.
 *
 * This function creates structured log entries that can be easily parsed by log aggregation systems.
 * All logs are written to stderr to keep stdout clean for program output (MCP convention).
 * The log entry includes an ISO 8601 timestamp, the specified log level, the message,
 * and any additional metadata fields.
 *
 * @param {("info" | "warn" | "error")} level - The severity level of the log entry
 * @param {string} message - The main log message describing the event
 * @param {Record<string, unknown>} [meta] - Optional additional metadata to include in the log entry
 * @returns {void}
 *
 * @example
 * // Basic info log
 * log("info", "Application started");
 * // Outputs: {"timestamp":"2025-11-23T10:30:00.000Z","level":"info","message":"Application started"}
 *
 * @example
 * // Warning with metadata
 * log("warn", "High memory usage detected", { memoryUsage: "85%", pid: 1234 });
 * // Outputs: {"timestamp":"...","level":"warn","message":"High memory usage detected","memoryUsage":"85%","pid":1234}
 *
 * @example
 * // Error log with context
 * log("error", "Failed to connect to database", {
 *   host: "localhost",
 *   port: 5432,
 *   error: "ECONNREFUSED"
 * });
 */
export function log(
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  console.error(JSON.stringify(entry));
}

/**
 * Creates a Zod schema for validating spawn agent input with configurable task description length limits.
 *
 * This factory function generates a Zod object schema that validates input for spawning new agents.
 * The schema enforces that the task_description is a non-empty string and does not exceed the
 * specified maximum length. The requirements field is optional and can contain additional context.
 * The dynamic max length parameter allows different validation rules based on the use case.
 *
 * @param {number} maxTaskLength - The maximum allowed length for the task_description field
 * @returns {z.ZodObject} A Zod schema object that validates spawn agent input structure
 *
 * @example
 * // Create schema with 1000 character limit
 * const schema = createSpawnAgentInputSchema(1000);
 * const result = schema.parse({
 *   task_description: "Deploy the application to production",
 *   requirements: "Use blue-green deployment strategy"
 * });
 * // Returns validated object
 *
 * @example
 * // Validation failure - empty task_description
 * const schema = createSpawnAgentInputSchema(500);
 * schema.parse({ task_description: "" });
 * // Throws ZodError: "task_description cannot be empty"
 *
 * @example
 * // Validation failure - exceeds max length
 * const schema = createSpawnAgentInputSchema(10);
 * schema.parse({ task_description: "This is a very long task description" });
 * // Throws ZodError: "task_description exceeds maximum length of 10"
 *
 * @example
 * // Optional requirements field
 * const schema = createSpawnAgentInputSchema(200);
 * const result = schema.parse({ task_description: "Run tests" });
 * // Returns: { task_description: "Run tests" }
 */
export function createSpawnAgentInputSchema(maxTaskLength: number) {
  return z.object({
    task_description: z
      .string()
      .min(1, "task_description cannot be empty")
      .max(
        maxTaskLength,
        `task_description exceeds maximum length of ${maxTaskLength}`
      ),
    requirements: z.string().optional(),
  });
}
