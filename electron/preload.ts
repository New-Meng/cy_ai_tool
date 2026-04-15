import { ipcRenderer, contextBridge } from "electron";

// 通用通信方法
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    console.log("send", channel, ...omit);
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  removeAllListeners(channel: string) {
    ipcRenderer.removeAllListeners(channel);
  },
});

contextBridge.exposeInMainWorld("customIpcRender", {
  send(channel: string, ...args: unknown[]) {
    console.log("channel", channel, ...args);
  },
});
