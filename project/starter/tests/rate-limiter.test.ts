import { describe, expect, it } from 'vitest';
import {
  RateLimiter,
  withRateLimit
} from '../src/utils/rate-limiter.js';

describe('RateLimiter', () => {
  it('should track an acquired request', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 10000,
      maxConcurrent: 2
    });

    await limiter.acquire(500);

    const status = limiter.getStatus();

    expect(status.activeRequests).toBe(1);
    expect(status.requestsInWindow).toBe(1);
    expect(status.tokensInWindow).toBe(500);

    limiter.release();
  });

  it('should release an active request', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 10000,
      maxConcurrent: 2
    });

    await limiter.acquire(500);
    limiter.release();

    const status = limiter.getStatus();

    expect(status.activeRequests).toBe(0);
    expect(status.requestsInWindow).toBe(1);
  });

  it('should execute a function through withRateLimit', async () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxTokensPerMinute: 10000,
      maxConcurrent: 2
    });

    const result = await withRateLimit(
      limiter,
      async () => 'completed',
      250
    );

    expect(result).toBe('completed');

    const status = limiter.getStatus();
    expect(status.activeRequests).toBe(0);
    expect(status.requestsInWindow).toBe(1);
    expect(status.tokensInWindow).toBe(250);
  });
});
