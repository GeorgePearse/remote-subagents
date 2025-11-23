/**
 * Custom error classes for the remote-subagents MCP server
 * @module errors
 */

/**
 * Base error class for all remote agent errors
 */
export class RemoteAgentError extends Error {
  /** Timestamp when the error occurred */
  readonly timestamp: Date;
  /** Error code for categorization */
  readonly code: string;
  /** Additional context about the error */
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "RemoteAgentError";
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serialize error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when sandbox creation fails
 */
export class SandboxCreationError extends RemoteAgentError {
  /** Optional sandbox ID if available */
  readonly sandboxId?: string;
  /** Exit code from sandbox creation */
  readonly exitCode?: number;
  /** Standard error from sandbox creation */
  readonly stderr?: string;

  constructor(
    message: string,
    options: {
      sandboxId?: string;
      exitCode?: number;
      stderr?: string;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, "SANDBOX_CREATION_ERROR", options.context);
    this.name = "SandboxCreationError";
    this.sandboxId = options.sandboxId;
    this.exitCode = options.exitCode;
    this.stderr = options.stderr;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      sandboxId: this.sandboxId,
      exitCode: this.exitCode,
      stderr: this.stderr,
    };
  }
}

/**
 * Error thrown when Claude Code installation fails
 */
export class ClaudeInstallError extends RemoteAgentError {
  /** Package that failed to install */
  readonly packageName: string;
  /** Exit code from npm install */
  readonly exitCode: number;
  /** Standard output from install */
  readonly stdout?: string;
  /** Standard error from install */
  readonly stderr?: string;

  constructor(
    message: string,
    options: {
      packageName: string;
      exitCode: number;
      stdout?: string;
      stderr?: string;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, "CLAUDE_INSTALL_ERROR", options.context);
    this.name = "ClaudeInstallError";
    this.packageName = options.packageName;
    this.exitCode = options.exitCode;
    this.stdout = options.stdout;
    this.stderr = options.stderr;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      packageName: this.packageName,
      exitCode: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr,
    };
  }
}

/**
 * Error thrown when Claude Code execution fails
 */
export class ClaudeExecutionError extends RemoteAgentError {
  /** Command that was executed */
  readonly command?: string;
  /** Exit code from execution */
  readonly exitCode?: number;
  /** Standard output from execution */
  readonly stdout?: string;
  /** Standard error from execution */
  readonly stderr?: string;
  /** Signal that terminated the process */
  readonly signal?: string;
  /** Duration of execution in milliseconds */
  readonly durationMs?: number;

  constructor(
    message: string,
    options: {
      command?: string;
      exitCode?: number;
      stdout?: string;
      stderr?: string;
      signal?: string;
      durationMs?: number;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, "CLAUDE_EXECUTION_ERROR", options.context);
    this.name = "ClaudeExecutionError";
    this.command = options.command;
    this.exitCode = options.exitCode;
    this.stdout = options.stdout;
    this.stderr = options.stderr;
    this.signal = options.signal;
    this.durationMs = options.durationMs;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      command: this.command,
      exitCode: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr,
      signal: this.signal,
      durationMs: this.durationMs,
    };
  }
}

/**
 * Error thrown for input validation failures
 */
export class ValidationError extends RemoteAgentError {
  /** Field that failed validation */
  readonly field?: string;
  /** Value that failed validation */
  readonly value?: unknown;
  /** Constraint that was violated */
  readonly constraint?: string;
  /** Array of validation errors for batch failures */
  readonly validationErrors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;

  constructor(
    message: string,
    options: {
      field?: string;
      value?: unknown;
      constraint?: string;
      validationErrors?: Array<{
        field: string;
        message: string;
        value?: unknown;
      }>;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message, "VALIDATION_ERROR", options.context);
    this.name = "ValidationError";
    this.field = options.field;
    this.value = options.value;
    this.constraint = options.constraint;
    this.validationErrors = options.validationErrors;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      constraint: this.constraint,
      validationErrors: this.validationErrors,
    };
  }
}

/**
 * Error thrown when an operation times out
 */
export class TimeoutError extends RemoteAgentError {
  /** Operation that timed out */
  readonly operation: string;
  /** Configured timeout in milliseconds */
  readonly timeoutMs: number;
  /** Elapsed time before timeout in milliseconds */
  readonly elapsedMs?: number;
  /** Resource ID associated with the timeout */
  readonly resourceId?: string;

  constructor(
    message: string,
    options: {
      operation: string;
      timeoutMs: number;
      elapsedMs?: number;
      resourceId?: string;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, "TIMEOUT_ERROR", options.context);
    this.name = "TimeoutError";
    this.operation = options.operation;
    this.timeoutMs = options.timeoutMs;
    this.elapsedMs = options.elapsedMs;
    this.resourceId = options.resourceId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      operation: this.operation,
      timeoutMs: this.timeoutMs,
      elapsedMs: this.elapsedMs,
      resourceId: this.resourceId,
    };
  }
}

/**
 * Type guard to check if an error is a RemoteAgentError
 */
export function isRemoteAgentError(error: unknown): error is RemoteAgentError {
  return error instanceof RemoteAgentError;
}

/**
 * Convert any error to a RemoteAgentError
 */
export function toRemoteAgentError(error: unknown): RemoteAgentError {
  if (isRemoteAgentError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new RemoteAgentError(error.message, "UNKNOWN_ERROR", {
      originalName: error.name,
      originalStack: error.stack,
    });
  }
  return new RemoteAgentError(String(error), "UNKNOWN_ERROR");
}
