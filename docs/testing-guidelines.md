测试约定与文件组织
====================

目的：保证测试文件的可发现性与一致性，便于维护与审查。

规则（中文说明）：

- 每个导出的函数或钩子（hook）的测试用例应与其实现文件名保持一致并放置到相应的测试文件中。
  - 例如：`packages/entity/index.ts` 中的 `useDataSearch` 与 `useEntityManager`，其测试应放在 `packages/__test__/entity.test.ts`。
  - 不要为同一模块单独创建多个测试文件（例如 `useDataSearch.test.ts`），而应将该模块相关的所有测试合并到一个以模块名命名的测试文件中（`entity.test.ts`）。

实施说明：

- 新增/合并测试时，请检查 `packages/__test__` 下是否已有对应模块的 `*.test.ts` 文件。
- 若存在，将新测试放入该文件并移除孤立的重复测试文件。
- 提交时在 PR 描述中注明已合并的测试文件路径。

示例：

- 模块：`packages/entity/index.ts`
- 测试文件：`packages/__test__/entity.test.ts`（包含 `useEntityManager` 与 `useDataSearch` 的测试）

理由：

- 减少测试文件爆炸，方便模块级别的测试维护。
- 让测试文件名直接映射至模块名，便于快速定位。

注意：如果模块过大且测试用例很多，可以考虑按功能子分组在同一个文件中使用不同的 `describe` 分块，而不是拆分为额外的测试文件。
