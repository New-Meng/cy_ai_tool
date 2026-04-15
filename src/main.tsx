import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConfigProvider } from "antd";
import { antdThemeConfig } from "./config/antdTheme.ts";
import "dayjs/locale/zh-cn"; // 日期
import zhCN from "antd/locale/zh_CN";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <ConfigProvider locale={zhCN} theme={antdThemeConfig}>
    <App />
  </ConfigProvider>,
  // </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
