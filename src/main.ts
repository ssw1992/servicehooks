import { useContinuousPagination } from '../packages/index';

console.log(useContinuousPagination);

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


(async () => {
    const res = await mockRequest({ num: 1, size: 20 })
    console.log('res111111', res)
})()