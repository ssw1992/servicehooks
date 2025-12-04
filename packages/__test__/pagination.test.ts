
import { useContinuousPagination, usePagination } from '../pagination'; // 假设函数在此文件中
import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';


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


describe('usePagination', () => {
    it('should load initial data correctly', async () => {
        const { list, isLoading, total, search } = usePagination(mockRequest, { immediate: true });
        await vi.waitFor(() => {
            if (isLoading.value) {
                throw new Error('Server not started')
            }
        });
        expect(list.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
        expect(total.value).toBe(100);
    });

    it('should change page correctly', async () => {
        const { list, num, onNumChange, search } = usePagination(mockRequest);
        await search();
        await onNumChange(2);
        expect(num.value).toBe(2);
        expect(list.value).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]);
    });

    it('should change size correctly', async () => {
        const { list, size, onSizeChange, search } = usePagination(mockRequest);
        await search();
        await onSizeChange(10);
        expect(size.value).toBe(10);
        expect(list.value).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should reset pagination correctly', async () => {
        const { list, total, num, reset, search } = usePagination(mockRequest, { immediate: true });
        await search();
        reset();
        expect(list.value).toEqual([]);
        expect(total.value).toBe(0);
        expect(num.value).toBe(1);
    });

    it('should handle params change', async () => {
        const params = ref({ keyword: 'a' });
        const req = vi.fn().mockImplementation(mockRequest);
        const { search } = usePagination(req, { params });
        await search();
        expect(req).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'a' }));
        params.value.keyword = 'b';
        await search();
        expect(req).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'b' }));
    });


    it('should support custom getParams and getResponse', async () => {
        const customRequest = vi.fn().mockResolvedValue({ result: { items: [1, 2], count: 2 } });
        const getParams = (params: any) => ({ ...params, custom: true });
        const getResponse = (res: any) => ({ data: res.result.items, total: res.result.count });
        const { list, total, search } = usePagination(customRequest, { getParams, getResponse });
        await search();
        expect(customRequest).toHaveBeenCalledWith(expect.objectContaining({ custom: true }));
        expect(list.value).toEqual([1, 2]);
        expect(total.value).toBe(2);
    });
});


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

    it('isLast type and logic should update correctly', async () => {
        // 请求返回 total=10，数据按 size 填充
        const req = (params: any) =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ data: { data: Array.from({ length: params.size }, (_, i) => i + (params.num - 1) * params.size), total: 10 } });
                }, 50);
            });

        const { isLast, num, loadNext, isLoading } = useContinuousPagination(req, { size: 5 });

        // 类型检查（运行时）：isLast 是一个具有 boolean value 的 ref
        expect(typeof isLast).toBe('object');
        expect(typeof isLast.value).toBe('boolean');

        // 加载第1页：num=1, size=5 -> 1*5 < total(10) => not last
        await loadNext(1);
        await vi.waitFor(() => {
            if (isLoading.value) throw new Error('still loading');
        });
        expect(num.value).toBe(1);
        expect(isLast.value).toBe(false);

        // 加载第2页：num=2, size=5 -> 2*5 == total => last
        await loadNext(2);
        await vi.waitFor(() => {
            if (isLoading.value) throw new Error('still loading');
        });
        expect(num.value).toBe(2);
        expect(isLast.value).toBe(true);
    });

    it('should refresh and restore pagination correctly', async () => {
        const { list, num, size, refresh, loadNext } = useContinuousPagination(mockRequest, { size: 10 });
        await loadNext(1);
        await loadNext(2);
        expect(list.value.length).toBe(20);
        await refresh();
        expect(list.value.length).toBe(20); // refresh 后数据长度应恢复
        expect(num.value).toBe(2);
        expect(size.value).toBe(10);
    });

    it('should react to params change', async () => {
        const params = ref({ keyword: 'a' });
        const req = vi.fn().mockImplementation(mockRequest);
        const { search } = useContinuousPagination(req, { params });
        await search();
        expect(req).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'a' }));
        params.value.keyword = 'b';
        await search();
        expect(req).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'b' }));
    });

    it('should handle size change', async () => {
        const { size, loadNext, list } = useContinuousPagination(mockRequest, { size: 5 });
        await loadNext(1);
        expect(list.value.length).toBe(5);
        size.value = 10;
        await loadNext(2);
        expect(list.value.length).toBe(15); // 第二页 size=10，累计 5+10
    });
    
    it('should support custom getParams and getResponse', async () => {
        const customRequest = vi.fn().mockResolvedValue({ result: { items: [1, 2], count: 2 } });
        const getParams = (params: any) => ({ ...params, custom: true });
        const getResponse = (res: any) => ({ data: res.result.items, total: res.result.count });
        const { list, total, search } = useContinuousPagination(customRequest, { getParams, getResponse });
        await search();
        expect(customRequest).toHaveBeenCalledWith(expect.objectContaining({ custom: true }));
        expect(list.value).toEqual([1, 2]);
        expect(total.value).toBe(2);
    });
});