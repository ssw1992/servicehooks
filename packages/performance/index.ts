/**
 * 浏览器性能工具函数
 * - formatBytes: 将字节数转换为尽可能大的单位，保留 2 位小数
 * - getBrowserMemory: 读取 `performance.memory`（若可用），并返回格式化及原始数值
 */

type MemoryInfo = {
  supported: boolean;
  jsHeapSizeLimit?: string;
  totalJSHeapSize?: string;
  usedJSHeapSize?: string;
  raw?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  message?: string;
};

/**
 * 将字节数转换为最大合适单位，保留 2 位小数
 * @param bytes 字节数
 * @returns 格式化后的字符串，例如 "1.23 GB"
 */
export function formatBytes(bytes: number): string {
  if (!isFinite(bytes) || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  let value = Math.abs(bytes);
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const sign = bytes < 0 ? '-' : '';
  return `${sign}${value.toFixed(2)} ${units[i]}`;
}

/**
 * 获取浏览器内存信息并转换为最大单位（保留 2 位小数）
 * 返回对象包含格式化字符串与原始数值
 */
export function getBrowserMemory(): MemoryInfo {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return { supported: false, message: 'performance.memory not supported in this environment' };
  }

  const mem = (performance as any).memory;
  const jsHeapSizeLimit = Number(mem.jsHeapSizeLimit) || 0;
  const totalJSHeapSize = Number(mem.totalJSHeapSize) || 0;
  const usedJSHeapSize = Number(mem.usedJSHeapSize) || 0;

  return {
    supported: true,
    jsHeapSizeLimit: formatBytes(jsHeapSizeLimit),
    totalJSHeapSize: formatBytes(totalJSHeapSize),
    usedJSHeapSize: formatBytes(usedJSHeapSize),
    raw: {
      jsHeapSizeLimit,
      totalJSHeapSize,
      usedJSHeapSize,
    },
  };
}

