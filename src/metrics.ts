/**
 * Metrics collection utility for the remote-subagents MCP server
 * @module metrics
 */

/**
 * Histogram statistics
 */
export interface HistogramStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
}

/**
 * Complete metrics snapshot
 */
export interface MetricsSnapshot {
  counters: Record<string, number>;
  histograms: Record<string, HistogramStats>;
  timestamp: string;
}

// Counter names
type CounterName = "tasks_spawned" | "tasks_succeeded" | "tasks_failed";

// Histogram names
type HistogramName =
  | "sandbox_creation_time"
  | "install_time"
  | "execution_time";

// Internal storage
const counters: Record<CounterName, number> = {
  tasks_spawned: 0,
  tasks_succeeded: 0,
  tasks_failed: 0,
};

const histograms: Record<HistogramName, number[]> = {
  sandbox_creation_time: [],
  install_time: [],
  execution_time: [],
};

// Lock for thread-safe operations
let lockPromise: Promise<void> = Promise.resolve();

/**
 * Acquire lock for thread-safe operations
 */
async function withLock<T>(fn: () => T): Promise<T> {
  const currentLock = lockPromise;
  let resolve: () => void;
  lockPromise = new Promise((r) => {
    resolve = r;
  });

  await currentLock;
  try {
    return fn();
  } finally {
    resolve!();
  }
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

/**
 * Calculate histogram statistics
 */
function calculateStats(values: number[]): HistogramStats {
  if (values.length === 0) {
    return { count: 0, min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    median: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

/**
 * Increment a counter by the specified amount
 *
 * @param name - Counter name
 * @param amount - Amount to increment (default: 1)
 */
export async function incrementCounter(
  name: CounterName,
  amount: number = 1
): Promise<void> {
  await withLock(() => {
    counters[name] += amount;
  });
}

/**
 * Record a value in a histogram
 *
 * @param name - Histogram name
 * @param value - Value to record (typically milliseconds for timing)
 */
export async function recordHistogram(
  name: HistogramName,
  value: number
): Promise<void> {
  await withLock(() => {
    histograms[name].push(value);
  });
}

/**
 * Measure execution time of an async function and record to histogram
 *
 * @param name - Histogram name to record timing
 * @param fn - Async function to measure
 * @returns Result of the function
 *
 * @example
 * ```typescript
 * const result = await measureTime('execution_time', async () => {
 *   return await someAsyncOperation();
 * });
 * ```
 */
export async function measureTime<T>(
  name: HistogramName,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    await recordHistogram(name, duration);
  }
}

/**
 * Get current value of a counter
 *
 * @param name - Counter name
 * @returns Current counter value
 */
export async function getCounter(name: CounterName): Promise<number> {
  return withLock(() => counters[name]);
}

/**
 * Get raw histogram values
 *
 * @param name - Histogram name
 * @returns Array of recorded values
 */
export async function getHistogramValues(
  name: HistogramName
): Promise<number[]> {
  return withLock(() => [...histograms[name]]);
}

/**
 * Get complete metrics snapshot with statistics
 *
 * @returns Metrics snapshot with all counters and histogram statistics
 */
export async function getMetrics(): Promise<MetricsSnapshot> {
  return withLock(() => ({
    counters: { ...counters },
    histograms: {
      sandbox_creation_time: calculateStats(histograms.sandbox_creation_time),
      install_time: calculateStats(histograms.install_time),
      execution_time: calculateStats(histograms.execution_time),
    },
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Reset all metrics to initial state (useful for testing)
 */
export async function resetMetrics(): Promise<void> {
  await withLock(() => {
    counters.tasks_spawned = 0;
    counters.tasks_succeeded = 0;
    counters.tasks_failed = 0;
    histograms.sandbox_creation_time.length = 0;
    histograms.install_time.length = 0;
    histograms.execution_time.length = 0;
  });
}
