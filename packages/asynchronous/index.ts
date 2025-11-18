/**
 * 单位时间异步请求缓存
 * @param fn 底层异步函数
 * @param keyFn 从调用参数生成单一 key（返回 string|number）
 * @param cacheTtlMs 缓存保活时长（毫秒），<=0 表示不自动过期，默认 1000ms
 */
export function useAsyncCache<Args extends any[], R>(
  fn: (...args: Args) => Promise<R>,
  keyFn: (...args: Args) => string | number,
  cacheTtlMs = 1_000
) {
  const cache = new Map<string | number, { promise: Promise<R>; timeoutId?: ReturnType<typeof setTimeout> }>();

  return (...args: Args): Promise<R> => {
    const key = keyFn(...args);
    const hit = cache.get(key);
    if (hit) return hit.promise;

    const promise = fn(...args).catch((err) => {
      const e = cache.get(key);
      if (e) {
        if (e.timeoutId) clearTimeout(e.timeoutId);
        cache.delete(key);
      }
      throw err;
    });

    const timeoutId = cacheTtlMs > 0 ? setTimeout(() => cache.delete(key), cacheTtlMs) : undefined;
    cache.set(key, { promise, timeoutId });

    return promise;
  };
}