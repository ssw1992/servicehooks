servicehooks
===========

简体中文说明文档（中文版）

**项目概述**
- **名称**: `servicehooks`：一组用于常见服务场景的 Vue 3 Hooks（组合式函数）。
- **目的**: 提供一组轻量、可组合的工具函数，简化常见数据处理、订阅、分页、实体管理等场景下的逻辑复用。
- **适用范围**: Vue 3 + TypeScript 项目，支持打包为 UMD/ES 模块并发布到 npm。

**主要特性**
- **模块化**: 按功能拆分（如 `computed`、`asynchronous`、`entity`、`pagination`、`dict`、`subscribe` 等），可按需引入。
- **TypeScript 支持**: 提供类型定义文件（`types` 目录）。
- **测试覆盖**: 使用 `vitest` 编写单元测试（位于 `packages/__test__/`）。
- **构建/发布**: 集成 `vite` 与 `tsup`，支持 npm 发布流程。

**仓库结构（主要）**
- **根目录**: 包含 `package.json`、`vite.config.ts`、`tsup.config.ts` 等构建与发布配置。
- **`packages/`**: 各功能模块源码与测试，例如：
	- `asynchronous/`
	- `computed/`
	- `dict/`
	- `entity/`
	- `pagination/`
	- `subscribe/`
	- 以及其他子包目录（详见仓库 `packages/` 目录）。

**快速开始**

1. 克隆仓库

```
git clone https://github.com/ssw1992/servicehooks.git
cd servicehooks
```

2. 安装依赖（推荐使用 `pnpm`，也可用 `npm` 或 `yarn`）

```
pnpm install
# 或
npm install
```

3. 本地开发

```
pnpm run dev
# 或
npm run dev
```

4. 运行测试

```
pnpm test
# 或
npm test
```

5. 打包（发布前）

```
pnpm run build
# 或
npm run build
```

**安装（作为依赖）**

```
npm install servicehooks
# 或
pnpm add servicehooks
```

**使用示例**

下面示例展示如何在 Vue 3 组件中按需引入并使用（示例为伪代码，实际导出名请参考具体包的类型定义）：

```ts
import { ref } from 'vue'
import { usePagination } from 'servicehooks/pagination'

export default {
	setup() {
		const { page, next, prev } = usePagination({ pageSize: 10 })
		return { page, next, prev }
	}
}
```

**API 概览**
- 仓库以子包形式组织，具体导出与使用方式请参见相应子包的 `index.ts` 与类型定义（`types/`）。
- 若需要完整的 API 文档，可在仓库根目录下补充 `docs/` 或开启自动化文档生成流程。

**测试**
- 本项目使用 `vitest` 编写测试用例，测试文件位于 `packages/__test__/`。
- 运行 `pnpm test` 或 `npm test` 执行测试，使用 `pnpm run coverage` 生成覆盖率报告。

**贡献指南**
- 欢迎贡献：请先创建 issue 讨论大改动，然后提交 PR。
- 提交前请确保：
	- 通过 `pnpm test` 或 `npm test`，
	- 代码风格与现有格式一致，
	- 更新对应的类型定义（如有）。

**发布流程**
- 使用 `npm run build` 进行构建（`vite` + `tsup`），然后执行 `npm run publish-main`（或 `npm run publish-beta` 带 `beta` tag）。

**常见问题（FAQ）**
- Q: 需要支持 Vue 2 吗？
	- A: 当前设计基于 Vue 3 组合式 API，如需兼容 Vue 2 需额外适配层并非默认支持。

**许可证 & 联系方式**
- **许可证**: 请在仓库根目录查看 `LICENSE`（如果存在）。
- **联系**: 如有问题请在 GitHub 上提交 issue，或联系仓库维护者。

---

