/**
 * Retry utility with exponential backoff for the remote-subagents MCP server
 * @module retry
 */

/**
 * Configuration options for the retry utility
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds before first retry (default: 1000) */
  baseDelayMs?: number;
  /** Maximum delay in milliseconds between retries (default: 30000) */
  maxDelayMs?: number;
  /** Custom function to determine if an error should trigger a retry */
  shouldRetry?: (error: Error, attemptNumber: number) => boolean;
  /** Callback invoked before each retry attempt */
  onRetry?: (error: Error, attemptNumber: number, delayMs: number) => void;
}

/**
 * Default retry condition - retries on any error
 */
const defaultShouldRetry = (_error: Error, _attemptNumber: number): boolean =>
  true;

/**
 * Calculate delay with exponential backoff and jitter
 *
 * @param attemptNumber - Current attempt number (0-indexed)
 * @param baseDelayMs - Base delay in milliseconds
 * @param maxDelayMs - Maximum delay cap in milliseconds
 * @returns Delay in milliseconds with jitter applied
 */
function calculateDelay(
  attemptNumber: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  // Exponential backoff: baseDelay * 2^attemptNumber
  const exponentialDelay = baseDelayMs * Math.pow(2, attemptNumber);

  // Cap at maxDelayMs
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  // Add jitter: random value between 0.5 and 1.5 times the capped delay
  const jitter = cappedDelay * (0.5 + Math.random());

  return Math.floor(jitter);
}

/**
 * Executes an async function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries exhausted
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   async () => await fetchData(),
 *   {
 *     maxRetries: 5,
 *     baseDelayMs: 500,
 *     maxDelayMs: 10000,
 *     shouldRetry: (error) => error.message.includes('timeout'),
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if this was the last attempt
      if (attempt >= maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delayMs = calculateDelay(attempt, baseDelayMs, maxDelayMs);

      // Invoke retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1, delayMs);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // All retries exhausted, throw the last error
  throw lastError!;
}
