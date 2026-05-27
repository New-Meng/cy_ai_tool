# React + TypeScript + Vite + Electron + Langchain

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

### 项目启动

`yarn dev`
会自动启动项目，F5已经配置了主、子、渲染进程的debugger，如果需要更改配置，请修改 .vscode / launch.json

`yarn build`
会自动打包项目，打包后的文件会在 dist 目录下 大概，目前项目没有很多条件编译，理论上支持 linux、windows、macos, 实际上window的支持是完善的 :(

---

### 注意事项

1. 项目依赖 node 22.12.0 以上版本
2. 项目依赖 electron 30.0.1 版本
3. 项目依赖 langchain 0.3.0 以上版本
4. electron-store 开发环境下，指向 /devConfig 目录下的配置文件
5. 严禁使用pnpm，electron的二进制可执行文件，会被pnpm忽视，请使用yarn 或者 npm来管理安装包

---

### 功能

1. 支持模型、温度切换，支持上下文短期记忆、历史会话管理
2. 支持设置豆包、deepseek模型接入(目前AI模型，只支持deepseek和豆包，其中，豆包`/ListFoundationModels`接口，需要ak/sk签名，才能拿到模型列表 + 模型id 犯病的很，方舟平台模型类型选择只提供有限支持)
3. 通用配置设置
4. 代码审查功能，根据选择的本地项目及对应的commit，调用AI模型，进行代码审查。
