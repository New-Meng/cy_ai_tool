import { app, BrowserWindow, Menu, Tray } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { rendererAppController } from "./payloadByMainController/appController";
import {
  baseSettingController,
  rendererSettingController,
} from "./payloadByMainController/settingController";
import { getConfigBasePath } from "./config/path";
import RegisterShortCutKey from "./utils/registerShortCutKey";
import { rendererAiMessageController } from "./payloadByMainController/aiMessageController";
import { initializeDatabase } from "./typeorm";
import { commandContrllerFun } from "./payloadByMainController/commandContrller";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 修复 Windows 终端中文乱码
if (process.platform === "win32") {
  process.env.PYTHONIOENCODING = "utf-8";
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 700,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      // 安全配置
      preload: path.join(__dirname, "preload.mjs"),
      sandbox: true,
    },
    frame: false,
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    win?.webContents.openDevTools();
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 创建托盘图标
function createTray() {
  // 这里的  process.env.VITE_PUBLIC 开发指向 pubic 生成也会自动指向正确的位置
  tray = new Tray(path.join(process.env.VITE_PUBLIC, "coding.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示",
      click: () => {
        win?.show();
      },
    },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("我的应用");

  // 点击托盘图标显示/隐藏窗口
  tray.on("click", () => {
    if (win?.isVisible()) {
      win.hide();
    } else {
      win?.show();
    }
  });
}

app.whenReady().then(() => {
  // 初始数据库连接
  initializeDatabase();
  createWindow();
  // 托盘
  createTray();
  Menu.setApplicationMenu(null);

  // 挂载通信方法
  // app级别操作
  rendererAppController();

  // 命令行操作
  commandContrllerFun()

  // 设置通信操作
  rendererSettingController();
  baseSettingController(win);

  // ai消息相关通信注册
  rendererAiMessageController();

  // 每次启动，注册全局快捷键
  const registerShortCutKey = new RegisterShortCutKey(win);
  registerShortCutKey.init();

  const configBasePath = getConfigBasePath();
  console.log("configBasePath:", configBasePath);
});
