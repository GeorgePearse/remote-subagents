# Examples

Real-world examples of using remote subagents.

## Code Generation

### LRU Cache Implementation

```
Task: Write a Python function that implements a simple LRU cache
      from scratch without using functools. Include unit tests.

Requirements: Use only standard library. Include at least 5 test
              cases covering edge cases.
```

**Result**: Complete implementation with O(1) operations using hashmap + doubly linked list, plus 18 passing unit tests.

---

### Rate Limiter

```
Task: Implement a simple rate limiter class in Python using the
      token bucket algorithm.

Requirements: Should be thread-safe and include example usage.
```

**Result**: Thread-safe implementation with blocking and non-blocking modes.

---

## Documentation & Research

### Async Patterns Comparison

```
Task: Create a markdown document comparing async/await patterns
      in Python vs JavaScript, with code examples for each.

Requirements: Include examples for basic async function, parallel
              execution, error handling, and timeouts.
```

**Result**: Comprehensive comparison document with side-by-side code examples.

---

## Data Processing

### CSV Analysis

```
Task: Write a Python script that reads a CSV file, performs
      statistical analysis, and outputs a summary report.

Requirements: Use pandas. Include mean, median, std dev for
              numeric columns. Handle missing values gracefully.
```

---

## Testing

### Test Suite Generation

```
Task: Generate a comprehensive test suite for a REST API client class.

Requirements: Use pytest. Include tests for success cases, error
              handling, retries, and edge cases. Mock external calls.
```

---

## Parallel Execution

You can spawn multiple agents simultaneously for independent tasks:

```python
# From your AI assistant, spawn 3 agents in parallel:
# 1. Generate data models
# 2. Write API routes
# 3. Create test fixtures
```

Each agent runs in its own isolated sandbox, completing tasks concurrently.

## Tips for Better Results

1. **Be explicit about output format**: "Return the code as a single file" or "Create separate files for each class"

2. **Specify testing requirements**: "Include at least 10 unit tests" or "Test edge cases like empty input"

3. **Set constraints**: "Use only standard library" or "Must be compatible with Python 3.9+"

4. **Request documentation**: "Add docstrings to all public methods"
