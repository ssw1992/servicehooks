import { ref, watch } from "vue";
import type { Ref } from "vue";




type TheObject = { [key: string]: any }

export const usePagination = (request: (params: TheObject) => Promise<any>, params?: Ref, config?: any) => {
  config = config || {}
  const { listConverter, watchPage = true } = config || {};
  params = params || ref<TheObject>({});
  const num = ref(1);
  const size = ref(config.size || 20);
  const total = ref(0);
  const list = ref<any[]>([]);
  const isLoading = ref(false);


  const getParams = config.getParams || ((params: TheObject) => params)
  const getData = config.getResponse || ((response: TheObject) => response.data)


  const listSolve = (arr: any[] | null) => {
    arr = arr || [];
    return listConverter ? listConverter(arr) : arr;
  };

  const getPagination = async () => {
    isLoading.value = true;
    try {
      const queryParams = getParams({
        ...params.value,
        num: num.value,
        size: size.value
      })
      const response = await request(queryParams);
      const data = getData(response);
      list.value = listSolve(data.data);
      total.value = data.total;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };
  const search = () => {
    num.value = 1;
    return getPagination();
  };

  const refresh = () => getPagination();
  const reset = () => {
    num.value = 1
    total.value = 0
    list.value = []
  };

  const onNumChange = (val: number) => {
    num.value = val;
    return getPagination();
  };
  const onSizeChange = (val: number) => {
    size.value = val;
    return search();
  };


  if (watchPage) {
    watch(() => num.value, onNumChange);
  }
  if (config.immediate) {
    search()
  }

  return {
    params,
    num,
    size,
    total,
    list,
    isLoading,
    search,
    onNumChange,
    onSizeChange,
    refresh,
    reset
  };
};




export const useContinuousPagination = (request: (params: TheObject) => Promise<any>, params?: Ref, config?: any) => {
  config = config || {}
  const { listConverter, watchPage = true } = config;
  params = params || ref<TheObject>({});
  const num = ref(1);
  const size = ref(config.size || 20);
  const total = ref(0);
  const list = ref<any[]>([]);
  const isLoading = ref(false);


  const getParams = config.getParams || ((params: TheObject) => params)
  const getData = config.getResponse || ((response: TheObject) => response.data)


  const listSolve = (arr: any[] | null) => {
    arr = arr || [];
    return listConverter ? listConverter(arr) : arr;
  };

  const getPagination = async () => {
    isLoading.value = true;
    try {
      const queryParams = getParams({
        ...params.value,
        num: num.value,
        size: size.value
      })
      const response = await request(queryParams);
      const data = getData(response);
      if (num.value === 1) {
        list.value = listSolve(data.data);

      } else {
        list.value.push(...listSolve(data.data));
      }
      total.value = data.total;
    } catch (error) {
      console.error(error);
    }
    isLoading.value = false;
  };
  const search = () => {
    num.value = 1;
    return getPagination();
  };

  const loadNext = (val: number) => {
    num.value = val;
    return getPagination();
  };

  const refresh = async () => {
    const lastNum = num.value
    const lastSize = size.value
    size.value = num.value * lastNum
    await search
    num.value = lastNum
    size.value = lastSize

  };
  const reset = () => {
    num.value = 1
    total.value = 0
    list.value = []
  };

  if (watchPage) {
    watch(() => num.value, loadNext);
  }

  if (config.immediate) {
    search()
  }

  return {
    params,
    num,
    size,
    total,
    list,
    isLoading,
    search,
    loadNext,
    refresh,
    reset
  };
};