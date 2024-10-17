import { ref, watch } from "vue";
import type { Ref } from "vue";




type TheObject = { [key: string]: any }

export const usePagination = (request: (params: TheObject) => Promise<any>, params?: Ref, config?: any) => {
  const { listConverter, watchPage = true, afterQuery } = config || {};
  params = params || ref<TheObject>({});
  const pageNum = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  const list = ref<[]>([]);
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
        pageNum: pageNum.value,
        pageSize: pageSize.value
      })
      const { data, total } = getData(await request(queryParams));
      list.value = listSolve(data);
      total.value = total;
      if (afterQuery) {
        afterQuery();
      }
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };
  const search = () => {
    pageNum.value = 1;
    return getPagination();
  };

  const refresh = () => getPagination();
  const reset = () => {
    pageNum.value = 0
    total.value = 0
    list.value = []
  };

  const onPageChange = (num: number) => {
    pageNum.value = num;
    return getPagination();
  };
  const onSizeChange = (num: number) => {
    pageSize.value = num;
    pageNum.value = 1;
    return getPagination();
  };


  if (watchPage) {
    watch(() => pageNum.value, onPageChange);
  }

  if (config.immediate) {
    search()
  }

  return {
    params,
    pageNum,
    pageSize,
    total,
    list,
    isLoading,
    search,
    onPageChange,
    onSizeChange,
    refresh,
    reset
  };
};




export const useContinuous = () => {

}