import { BrowserWindow, dialog, globalShortcut, Notification } from "electron";
import { configManagerFactory } from "../config/config-manager";
import { BASE_SETTING } from "../../constant/storeName";
import { fileURLToPath } from "node:url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// electron 快捷键注册，每次启动都必须注册一次，应用关闭后，会自动注销这些快捷键
export default class ShortcutKeyManager {
  win: BrowserWindow | null;
  shortCutKeyMap = {};
  constructor(win: BrowserWindow | null) {
    this.win = win;
  }

  init() {
    const settingStore = configManagerFactory(BASE_SETTING);
    this.shortCutKeyMap =
      settingStore.get<Record<string, string>>("shortKeyConfig") || {};

    Object.keys(this.shortCutKeyMap).forEach((key) => {
      if (
        key === "openMainWindowShortCutKey" &&
        (this.shortCutKeyMap as Record<string, string>)[key]
      ) {
        this.registerShortcutKey(
          (this.shortCutKeyMap as Record<string, string>)[key],
          this.showMainWindow,
        );
      }
    });
  }

  registerShortcutKey = (key: string, callback: () => void) => {
    const isRegistered = globalShortcut.register(key, callback);
    if (!isRegistered) {
      console.log("注册失败");
      new Notification({
        icon: path.join(__dirname, "../public/coding.png"),
        title: "快捷键注册失败",
        body: `快捷键 ${key} 注册失败，请检查是否有快捷键冲突。`,
      }).show();
    } else {
      console.log("注册成功");
    }
  };

  unRegisterShortcutKey = (key: string) => {
    globalShortcut.unregister(key);
  };

  // 具体操作
  showMainWindow = () => {
    if (this.win) {
      if (this.win.isMinimized()) {
        this.win.restore(); // 从最小化恢复
        this.win.focus();
      } else if (this.win.isVisible()) {
        this.win.hide();
      } else {
        this.win.show();
        this.win.focus();
      }
    } else {
      dialog.showErrorBox("操作失败", "主窗口当前不可用，请检查应用状态。");
    }
  };
}
