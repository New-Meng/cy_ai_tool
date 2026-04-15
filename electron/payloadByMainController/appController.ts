import { app, ipcMain, BrowserWindow } from "electron";

export const rendererAppController = () => {
  // 关闭应用
  ipcMain.on("close-app", () => {
    app.quit();
  });

  // 缩小到托盘
  ipcMain.on("hide-app", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.hide();
    // app.hide();
  });

  // 显示主应用
  ipcMain.on("show-app", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.show();
  });

  // 最小化窗口
  ipcMain.on("minimize-app", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  // 最大化/还原窗口
  ipcMain.on("maximize-app", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });
};
