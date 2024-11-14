// 对实体维护
// 把校验和ui框架form组件解耦
// 整合分散的常用的实体操作业务
// 各种业务操作状态可感知
// 各种业务操作默认支持防抖，防重复提交

import { computed, ref } from "vue";

type TheObject = { [key: string]: any };

type EntityManageConfig = {
  requestAdd?: (entity: TheObject) => Promise<TheObject | null>;
  requestEdit?: (entity: TheObject) => Promise<TheObject | null>;
  requestDel?: (id: string) => Promise<any>;
  requestDetail?: (id: string) => Promise<TheObject>;
  rules?: { [key: string]: ((value: any) => Promise<any> | any)[] };
  isReturnEntity?: boolean;
  entity?: TheObject;
};

/**
 * 异步任务链执行函数
 *
 * @param taskQueue 任务队列，每个任务都是一个返回 Promise 的函数
 */
const asyncChainTask = async (
  taskQueue: ((params?: any) => Promise<any>)[]
) => {
  let i = 0;
  let length = taskQueue.length;
  let lastResult: any = null;
  while (i < length) {
    lastResult = await taskQueue[i](lastResult);
    i++;
  }
};

/**
 * 实体管理自定义钩子
 *
 * @param config 实体管理配置对象
 * @returns 返回实体管理相关的响应式引用和方法
 */
export const useEntityManager = (config: EntityManageConfig) => {
  const entity = ref<TheObject>(config.entity || {});
  const errorTipMap = ref<TheObject>({});
  const validateLoadingMap = ref<TheObject>({});
  const isValidating = ref(false);
  const validate = async () => {
    if (config.rules) {
      isValidating.value = true;
      await Promise.all(
        Object.keys(config.rules).map(async (key) => {
          const keyRules = (config.rules && config.rules[key]) || [];
          validateLoadingMap.value[key] = true;
          try {
            await asyncChainTask(
              keyRules.map((rule) => () => rule(entity.value[key]))
            );
          } catch (error) {
            errorTipMap.value[key] = error;
          } finally {
            validateLoadingMap.value[key] = false;
          }
        })
      );
      isValidating.value = false;
    } else {
      throw new Error("请配置rules");
    }
  };

  const clearValidate = () => {
    errorTipMap.value = {};
  };

  const isAdding = ref(false);
  const add = async () => {
    await validate();
    isAdding.value = true;
    if (config.requestAdd) {
      try {
        const data = await config.requestAdd(entity.value);
        console.log("ss", data);
        if (config.isReturnEntity && data) {
          entity.value = data;
        }
      } catch (error) {
        throw error;
      } finally {
        isAdding.value = false;
      }
    } else {
      throw new Error("请配置requestAdd方法");
    }
  };

  const isEditing = ref(false);
  const edit = async () => {
    await validate();
    isEditing.value = true;
    if (config.requestEdit) {
      try {
        const data = await config.requestEdit(entity.value);
        if (config.isReturnEntity && data) {
          entity.value = entity.value;
        }
      } catch (error) {
        throw error;
      } finally {
        isEditing.value = false;
      }
    } else {
      throw new Error("请配置requestEdit方法");
    }
  };

  const isDeling = ref(false);
  const del = async () => {
    if (config.requestDel) {
      try {
        await config.requestDel(entity.value.id);
        entity.value = {};
      } catch (error) {
        throw error;
      } finally {
        isDeling.value = false;
      }
    } else {
      throw new Error("请配置requestDel方法");
    }
  };

  const isLoading = computed(
    () => isAdding.value || isEditing.value || isDeling.value || isValidating.value
  );

  return {
    entity,
    isLoading,

    isAdding,
    add,
    isEditing,
    edit,

    isDeling,
    del,

    isValidating,
    errorTipMap,
    validate,
    clearValidate,
  };
};
