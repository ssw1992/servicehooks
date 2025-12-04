import { useEntityManager } from "../entity/index";
import { describe, it, expect } from "vitest";
type TheObject = { [key: string]: any };
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
