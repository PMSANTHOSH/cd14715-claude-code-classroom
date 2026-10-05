import { describe, expect, it } from 'vitest';
import { withRetry, withTimeout } from '../src/utils/error-handler.js';

describe('Error handling utilities', () => {
  it('should retry a failing operation and eventually succeed', async () => {
    let attempts = 0;

    const result = await withRetry(
      async () => {
        attempts += 1;

        if (attempts < 3) {
          throw new Error('temporary failure');
        }

        return 'success';
      },
      3,
      1
    );

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should reject after all retry attempts are exhausted', async () => {
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw new Error('permanent failure');
        },
        2,
        1
      )
    ).rejects.toThrow();

    expect(attempts).toBe(2);
  });

  it('should resolve when the operation finishes before the timeout', async () => {
    const result = await withTimeout(
      Promise.resolve('completed'),
      100
    );

    expect(result).toBe('completed');
  });

  it('should reject when the operation exceeds the timeout', async () => {
    await expect(
      withTimeout(
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        }),
        10
      )
    ).rejects.toThrow('Operation timed out after 10ms');
  });
});
