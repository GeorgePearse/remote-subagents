/**
 * Graceful shutdown handling for the remote-subagents MCP server
 * @module shutdown
 */

import type { Sandbox } from "@e2b/code-interpreter";

/**
 * Shutdown configuration options
 */
export interface ShutdownOptions {
  /** Timeout for graceful shutdown in milliseconds (default: 10000) */
  gracefulTimeoutMs?: number;
  /** Timeout for forced shutdown in milliseconds (default: 5000) */
  forceTimeoutMs?: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Sandbox registry entry
 */
interface SandboxEntry {
  sandbox: Sandbox;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Registry of active sandboxes
const sandboxRegistry = new Map<string, SandboxEntry>();

// Shutdown state
let isShuttingDown = false;
let shutdownPromise: Promise<void> | null = null;

// Default options
const defaultOptions: Required<ShutdownOptions> = {
  gracefulTimeoutMs: 10000,
  forceTimeoutMs: 5000,
  verbose: false,
};

/**
 * Logger that respects verbose setting
 */
function log(
  message: string,
  verbose: boolean,
  level: "info" | "warn" | "error" = "info"
): void {
  if (verbose || level === "error") {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: "shutdown",
    };
    console.error(JSON.stringify(entry));
  }
}

/**
 * Register a sandbox for tracking
 *
 * @param id - Unique identifier for the sandbox
 * @param sandbox - The sandbox instance
 * @param metadata - Optional metadata for tracking
 */
export function registerSandbox(
  id: string,
  sandbox: Sandbox,
  metadata?: Record<string, unknown>
): void {
  sandboxRegistry.set(id, {
    sandbox,
    metadata,
    createdAt: new Date(),
  });
}

/**
 * Unregister a sandbox from tracking
 *
 * @param id - Unique identifier for the sandbox
 * @returns True if the sandbox was found and removed
 */
export function unregisterSandbox(id: string): boolean {
  return sandboxRegistry.delete(id);
}

/**
 * Get count of active sandboxes
 */
export function getActiveSandboxCount(): number {
  return sandboxRegistry.size;
}

/**
 * Check if shutdown is in progress
 */
export function isShutdownInProgress(): boolean {
  return isShuttingDown;
}

/**
 * Shutdown all active sandboxes gracefully
 *
 * @param options - Shutdown configuration options
 * @returns Promise that resolves when all sandboxes are terminated
 */
export async function shutdownAll(
  options: ShutdownOptions = {}
): Promise<void> {
  // Return existing shutdown promise if already in progress
  if (shutdownPromise) {
    return shutdownPromise;
  }

  isShuttingDown = true;
  const opts = { ...defaultOptions, ...options };

  shutdownPromise = (async () => {
    const sandboxIds = Array.from(sandboxRegistry.keys());
    log(
      `Starting graceful shutdown of ${sandboxIds.length} sandbox(es)`,
      opts.verbose
    );

    if (sandboxIds.length === 0) {
      log("No active sandboxes to terminate", opts.verbose);
      return;
    }

    // Create shutdown promises for all sandboxes
    const shutdownPromises = sandboxIds.map(async (id) => {
      const entry = sandboxRegistry.get(id);
      if (!entry) return;

      try {
        log(`Terminating sandbox ${id}`, opts.verbose);

        // Create a timeout race
        const killPromise = entry.sandbox.kill();
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Timeout killing sandbox ${id}`)),
            opts.gracefulTimeoutMs
          );
        });

        await Promise.race([killPromise, timeoutPromise]);
        sandboxRegistry.delete(id);
        log(`Sandbox ${id} terminated successfully`, opts.verbose);
      } catch (error) {
        log(
          `Failed to gracefully terminate sandbox ${id}: ${error instanceof Error ? error.message : String(error)}`,
          opts.verbose,
          "warn"
        );
        // Sandbox will be cleaned up by E2B eventually
        sandboxRegistry.delete(id);
      }
    });

    // Wait for all with overall timeout
    try {
      await Promise.race([
        Promise.allSettled(shutdownPromises),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Overall shutdown timeout exceeded")),
            opts.gracefulTimeoutMs + opts.forceTimeoutMs
          );
        }),
      ]);
    } catch (error) {
      log(
        `Shutdown timeout: ${error instanceof Error ? error.message : String(error)}`,
        opts.verbose,
        "error"
      );
    }

    // Clear any remaining entries
    sandboxRegistry.clear();
    log("Shutdown complete", opts.verbose);
  })();

  return shutdownPromise;
}

/**
 * Initialize signal handlers for graceful shutdown
 *
 * @param options - Shutdown configuration options
 */
export function initializeSignalHandlers(
  options: ShutdownOptions = {}
): void {
  const opts = { ...defaultOptions, ...options };
  let signalCount = 0;

  const handleSignal = async (signal: string) => {
    signalCount++;
    log(`Received ${signal} signal (${signalCount})`, opts.verbose);

    if (signalCount > 1) {
      log("Forcing immediate exit", opts.verbose, "warn");
      process.exit(1);
    }

    try {
      await shutdownAll(opts);
      process.exit(0);
    } catch (error) {
      log(
        `Shutdown failed: ${error instanceof Error ? error.message : String(error)}`,
        opts.verbose,
        "error"
      );
      process.exit(1);
    }
  };

  process.on("SIGINT", () => handleSignal("SIGINT"));
  process.on("SIGTERM", () => handleSignal("SIGTERM"));

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error) => {
    log(`Uncaught exception: ${error.message}`, true, "error");
    try {
      await shutdownAll(opts);
    } catch {
      // Ignore cleanup errors
    }
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason) => {
    log(
      `Unhandled rejection: ${reason instanceof Error ? reason.message : String(reason)}`,
      true,
      "error"
    );
    try {
      await shutdownAll(opts);
    } catch {
      // Ignore cleanup errors
    }
    process.exit(1);
  });

  log("Signal handlers initialized", opts.verbose);
}
