import { app, ipcMain, BrowserWindow, dialog } from "electron";
import path from "path";
import { getGitProjectUuid } from "../lib/gitOperate";
import { ResultRt } from "../utils";

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

  ipcMain.handle("select-file", async () => {
    try {
      const res = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (res.filePaths?.length === 0) {
        return ResultRt.success(null);
      }
      const uuid = await getGitProjectUuid(res.filePaths[0]);
      return ResultRt.success({
        fileName: path.basename(res.filePaths[0]),
        path: res.canceled ? null : res.filePaths[0],
        uuid,
      });
    } catch (error) {
      if (error instanceof Error) {
        return ResultRt.fail(error.message);
      } else {
        return ResultRt.fail(error);
      }
    }
  });
};
