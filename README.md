# LangChain Electron Client

一个基于 React、TypeScript、Vite、Electron 与 LangChain 构建的桌面端 AI 客户端。

项目支持多模型配置、温度切换、短期上下文记忆、历史会话管理，以及基于本地 Git 项目的 AI 代码审查能力。

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- Electron 30
- LangChain 1.x
- Ant Design 6
- Tailwind CSS 4
- TypeORM
- better-sqlite3

## 环境要求

- Node.js >= 22.12.0
- Electron 30.0.1
- 推荐使用 Yarn 或 npm 管理依赖

> 注意：请不要使用 pnpm 安装依赖。Electron 的二进制可执行文件在当前项目环境下可能会被 pnpm 忽略，导致安装或运行异常。

## 安装依赖

```bash
yarn install
```

或：

```bash
npm install
```

## 项目启动

```bash
yarn dev
```

启动后会进入开发模式。项目已配置 VS Code 调试能力，可通过 F5 启动主进程、子进程和渲染进程调试。

如需调整调试配置，请修改：

```text
.vscode/launch.json
```

## 项目构建

```bash
yarn build
```

构建流程会依次执行 TypeScript 编译、Vite 构建和 Electron 打包，产物会输出到 `dist` 及 Electron Builder 对应的构建目录中。

项目理论上支持 Windows、macOS 和 Linux，但当前主要以 Windows 环境为主进行适配和验证。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `yarn dev` | 启动开发环境 |
| `yarn build` | 编译并打包 Electron 应用 |
| `yarn lint` | 执行 ESLint 检查 |
| `yarn preview` | 启动 Vite 预览服务 |
| `yarn rebuilder:sqlite3` | 重新构建 better-sqlite3 的 Electron 原生依赖 |

## 核心功能

1. 模型管理
   - 支持配置多个 AI 模型
   - 支持模型切换
   - 支持温度参数调整

2. 会话能力
   - 支持短期上下文记忆
   - 支持历史会话管理
   - 支持流式输出和手动停止回答

3. 模型接入
   - 支持 DeepSeek、GLM 等模型接入
   - 第三方中转服务建议使用 OpenAI 兼容格式接口

4. 通用配置
   - 支持项目通用设置
   - 开发环境下，electron-store 配置文件指向 `devConfig` 目录

5. AI 代码审查
   - 支持选择本地 Git 项目
   - 支持基于指定 commit 获取变更内容
   - 支持调用 AI 模型生成代码审查结果

## 配置说明

开发环境中，`electron-store` 会读取 `devConfig` 目录下的配置文件，便于将开发配置与正式环境配置隔离。

模型配置中如使用第三方中转服务，请优先确认接口是否兼容 OpenAI Chat Completions 格式，尤其是流式响应格式，否则可能导致 LangChain 无法正确解析模型输出。

## 开发注意事项

- 请优先使用 Yarn 或 npm 安装依赖
- 修改 Electron 主进程或原生依赖后，必要时执行 `yarn rebuilder:sqlite3`
- 修改构建或调试逻辑时，请同步检查 `.vscode/launch.json` 与 Vite / Electron 相关配置
- 打包前建议先执行 `yarn lint` 确认代码规范

## 目录产物说明

| 目录 | 说明 |
| --- | --- |
| `dist` | Vite 渲染进程构建产物 |
| `dist-electron` | Electron 主进程相关构建产物 |
| `devConfig` | 开发环境配置目录 |

## 许可证

当前项目暂未声明许可证。
