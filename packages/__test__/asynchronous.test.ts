import { useAsyncCache } from '@packages/asynchronous';
import { expect, test } from 'vitest';

test('dedupeAsync: concurrent calls reuse same promise', async () => {
  let calls = 0;
  const asyncFn = async (x: number) => {
    calls++;
    // simulate delay
    await new Promise((r) => setTimeout(r, 50));
    return x * 2;
  };

  const wrapped = useAsyncCache(asyncFn, (x: number) => x, 500);

  const p1 = wrapped(1);
  const p2 = wrapped(1);

  const [r1, r2] = await Promise.all([p1, p2]);
  expect(r1).toBe(2);
  expect(r2).toBe(2);
  expect(calls).toBe(1);
});

test('dedupeAsync: failure clears cache to allow retry', async () => {
  let calls = 0;
  const asyncFn = async (x: number) => {
    calls++;
    if (calls === 1) {
      // first call fails
      throw new Error('fail');
    }
    return x + 1;
  };

  const wrapped = useAsyncCache(asyncFn, (x: number) => x, 500);

  await expect(wrapped(2)).rejects.toThrow('fail');

  // after failure, second call should run the underlying fn again
  const res = await wrapped(2);
  expect(res).toBe(3);
  expect(calls).toBe(2);
});

test('dedupeAsync: ttl expiry allows new invocation', async () => {
  let calls = 0;
  const asyncFn = async (x: number) => {
    calls++;
    return x;
  };

  // short ttl so test runs fast
  const wrapped = useAsyncCache(asyncFn, (x: number) => x, 100);

  const r1 = await wrapped(3);
  expect(r1).toBe(3);
  expect(calls).toBe(1);

  // wait for ttl to expire
  await new Promise((r) => setTimeout(r, 150));

  const r2 = await wrapped(3);
  expect(r2).toBe(3);
  // second call should invoke underlying function again because cache expired
  expect(calls).toBe(2);
});
