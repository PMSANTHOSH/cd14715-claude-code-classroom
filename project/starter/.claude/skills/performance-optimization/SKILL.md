# Performance Optimization

## Purpose

Provide focused guidance for reviewing code for unnecessary work, inefficient algorithms, excessive resource usage, and performance regressions.

## Review Areas

### 1. Algorithmic Complexity

Look for:
- Unnecessary nested loops
- Repeated scans of the same data
- O(n^2) or worse operations where a better approach is practical
- Repeated sorting or searching
- Inefficient recursion

Prefer appropriate data structures and algorithms.

### 2. Database and API Calls

Check for:
- Repeated database queries
- N+1 query patterns
- Unnecessary network requests
- Missing batching
- Fetching significantly more data than required

Avoid making expensive external calls inside large loops when batching is possible.

### 3. Memory Usage

Look for:
- Large unnecessary in-memory collections
- Unbounded caches
- Loading entire files when streaming is possible
- Duplicate copies of large data
- Objects retained longer than necessary

### 4. Async and Concurrency

Review:
- Independent operations that are unnecessarily sequential
- Excessive concurrency
- Missing concurrency limits
- Blocking operations inside asynchronous code
- Race conditions introduced by parallel execution

Use concurrency when safe, while respecting resource limits.

### 5. Caching

Consider whether expensive repeated operations could benefit from caching.

Check:
- Cache invalidation
- Cache size
- Cache lifetime
- Stale data risks
- Unbounded cache growth

Do not recommend caching when the added complexity provides little benefit.

### 6. Frontend and I/O Performance

Look for:
- Unnecessary rendering
- Excessive filesystem operations
- Repeated serialization or parsing
- Large payloads
- Unnecessary data transformations

Prefer minimizing expensive I/O and repeated processing.

### 7. Resource Cleanup

Check that:
- Files are closed
- Connections are released
- Timers are cleared
- Event listeners are removed when appropriate
- Temporary resources are cleaned up

## Common Findings

Prioritize concrete issues such as:
- Severe algorithmic inefficiency
- N+1 queries
- Unbounded memory growth
- Excessive network requests
- Blocking operations
- Missing concurrency limits
- Expensive repeated computation

## Severity Guidance

- Critical: Performance issue likely to cause system-wide failure or resource exhaustion.
- High: Major performance regression or realistic resource-exhaustion risk.
- Medium: Significant inefficiency affecting normal workloads.
- Low: Minor optimization opportunity.
- Info: Useful performance observation without a demonstrated issue.

## Review Principle

Report performance findings only when the code provides evidence of unnecessary work or resource usage. Consider realistic workload size before recommending optimization.
