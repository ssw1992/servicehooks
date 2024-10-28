import { useContinuousPagination } from '../pagination'; // 假设函数在此文件中
import { describe, it, expect, vi } from 'vitest';

// 模拟请求函数
const mockRequest = (params: any) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const result = {
                data: {
                    data: Array.from({ length: params.size }, (_, i) => i + (params.num - 1) * params.size),
                    total: 100, // 假设总共有100条数据
                }
            }
            resolve(result);
        }, 100);
    });
};


describe('useContinuousPagination', () => {
    it('should load initial data correctly', async () => {
        const { list, isLoading, total } = useContinuousPagination(mockRequest, { immediate: true });
        await vi.waitFor(() => {
            if (isLoading.value) {
                throw new Error('Server not started')
            }
        });
        expect(list.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        expect(total.value).toBe(100);
    });

    it('should load next page correctly', async () => {
        const { list, num, loadNext } = useContinuousPagination(mockRequest);

        // 初始加载
        expect(list.value).toEqual([]); // 因为没有设置immediate，所以初始为空

        // 加载第一页
        await loadNext(1);
        expect(list.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        expect(num.value).toBe(1);

        // 加载第二页
        await loadNext(2);
        expect(list.value).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        ]);
        expect(num.value).toBe(2);
    });

    it('should reset pagination correctly', async () => {
        const { list, total, num, reset } = useContinuousPagination(mockRequest, { immediate: true });
        // 执行重置操作
        reset();
        expect(list.value).toEqual([]);
        expect(total.value).toBe(0);
        expect(num.value).toBe(1);
    });
});