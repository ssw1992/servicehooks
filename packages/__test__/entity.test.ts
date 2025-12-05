import { ref } from "vue";
import { useEntityManager, useDataSearch } from "../entity/index";
import { describe, it, expect } from "vitest";
describe("useEntityManager", () => {
  it("should return correct result", async () => {
    const config = {
      isReturnEntity: true,
      rules: {
        name: [
          (val: any) => {
            if (!val) {
              throw "请填写";
            }
          },
          (val: string) => {
            if (val.length < 2) {
              throw "名称至少为2个字符";
            }
          },
        ],
      },
      requestAdd: async (entity: TheObject) => {
        return {
          id: 1,
          ...entity,
        };
      },
      requestEdit: async (entity: TheObject) => {
        return { ...entity };
      },
      requestDel: async (id: string | number) => {
        return {
          id,
        };
      },
    };
    const {
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
    } = useEntityManager(config);

    entity.value = {
      name: "test",
    };
    await add();
    expect(entity.value.id).toBe(1);
    expect(entity.value.name).toBe("test");
    expect(isLoading.value).toBe(false);
    expect(isAdding.value).toBe(false);
    expect(isEditing.value).toBe(false);
    expect(isDeling.value).toBe(false);
    expect(isValidating.value).toBe(false);
    expect(errorTipMap.value).toEqual({});

    entity.value.name = 't'
    await validate();
    expect(isValidating.value).toBe(false);
    expect(errorTipMap.value).toEqual({ name: "名称至少为2个字符" });

    clearValidate();
    expect(errorTipMap.value).toEqual({});

    entity.value.name = 'test'
    entity.value.age = 3
    await edit();
    expect(entity.value.id).toBe(1);
    expect(entity.value.age).toBe(3);
    expect(entity.value.name).toBe("test");
    expect(isLoading.value).toBe(false);
    expect(isAdding.value).toBe(false);
    expect(isEditing.value).toBe(false);
    expect(isDeling.value).toBe(false);
    expect(isValidating.value).toBe(false);
    expect(errorTipMap.value).toEqual({});

    entity.value = {
      id: 1,
      name: "test",
    };
    await del();
    expect(entity.value).toEqual({});
    expect(isLoading.value).toBe(false);
    expect(isAdding.value).toBe(false);
    expect(isEditing.value).toBe(false);
    expect(isDeling.value).toBe(false);
    expect(isValidating.value).toBe(false);
    expect(errorTipMap.value).toEqual({});
  });
});

describe("useDataSearch", () => {
  it("initializes data from defaultData and performs search (loading state)", async () => {
    const defaultData = { a: 1 } as TheObject;
    const params = { q: 1 };

    const searchRequest = async (p: TheObject) => {
      return new Promise<TheObject>((resolve) =>
        setTimeout(() => resolve({ ok: true, received: p }), 10)
      );
    };

    const { data, isLoading, search, reset } = useDataSearch(searchRequest, {
      params,
      defaultData,
      immediate: false,
    });

    expect(data.value).toEqual(defaultData);

    const promise = search();
    // isLoading set synchronously when search() is called
    expect(isLoading.value).toBe(true);
    await promise;
    expect(isLoading.value).toBe(false);
    expect(data.value).toEqual({ ok: true, received: params });

    // reset should restore a deep copy of defaultData
    data.value.a = 999;
    expect(data.value.a).toBe(999);
    reset();
    expect(data.value).toEqual(defaultData);
  });

  it("accepts params as a ref and sends latest params to request", async () => {
    const params = ref({ id: 1 });
    let received: TheObject | null = null;
    const searchRequest = async (p: TheObject) => {
      received = { ...p };
      return { result: true };
    };

    const { search } = useDataSearch(searchRequest, { params });

    // update params before calling search
    params.value = { id: 2 };
    await search();
    expect(received).toEqual({ id: 2 });
  });

  it("immediate option triggers search and calls afterSearch with isImmediateSearch=true", async () => {
    const params = { foo: "bar" };
    let afterArg: any = null;
    const searchRequest = async () => {
      return { value: 1 };
    };

    useDataSearch(searchRequest, {
      params,
      immediate: true,
      afterSearch: (cfg) => {
        afterArg = cfg;
      },
    });

    // wait microtask / next tick for the immediate search to complete
    await new Promise((r) => setTimeout(r, 0));
    expect(afterArg).toBeTruthy();
    expect(afterArg.isImmediateSearch).toBe(true);
  });

  it("handles searchRequest rejection without throwing and preserves default data", async () => {
    const defaultData = { foo: "init" };
    const searchRequest = async () => {
      return new Promise((_, rej) => setTimeout(() => rej(new Error("fail")), 10));
    };

    const { data, isLoading, search } = useDataSearch(searchRequest, {
      defaultData,
    });

    const p = search();
    expect(isLoading.value).toBe(true);
    await p;
    expect(isLoading.value).toBe(false);
    // on error data should remain default (no assignment on failure)
    expect(data.value).toEqual(defaultData);
  });

  it("initializes empty object when defaultData is not provided", () => {
    const searchRequest = async () => ({ a: 1 });
    const { data } = useDataSearch(searchRequest, {});
    expect(data.value).toEqual({});
  });
});
