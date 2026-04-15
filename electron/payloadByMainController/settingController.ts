import { BrowserWindow, ipcMain } from "electron";
import { configManagerFactory } from "../config/config-manager";
import { BASE_SETTING, SETTING_MODEL_LIST } from "../../constant/storeName";
import { removeModelUrlAndKey, ResultRt } from "../utils";
import { getOpenAIClient } from "../lib/aiClient";
import ShortcutKeyManager from "../utils/registerShortCutKey";
import { MODEL_NAME_MAP } from "../../constant";

export interface ModelItemInterace {
  modelName: string;
  apiUrl: string;
  apiKey: string;
  id: string;
  modeType: string;
  defaultModel: boolean; // 是否默认
  modelVender?: number; //  模型供应商
  eqId?: string; // 豆包特有的东西
}

export const rendererSettingController = () => {
  ipcMain.handle("add-model-item", (event, args) => {
    return new Promise((rev, rej) => {
      try {
        console.log(event, args, "++??params");
        const settingStore = configManagerFactory(SETTING_MODEL_LIST, {
          defaults: {
            modelList: [],
          },
        });
        const modelList =
          settingStore.get<ModelItemInterace[]>("modelList") || [];

        // 如果是默认，则取消其它默认 1 非默认 2 默认
        if (args.defaultModel === true) {
          modelList.forEach((item) => {
            item.defaultModel = false;
          });
        }

        // 校验一下模型数据
        let isUpdateOperate = false;
        modelList.forEach((item, index) => {
          // update
          if (item.id === args.id) {
            isUpdateOperate = true;
            modelList[index] = args;
          }
          if (item.modelName === args.modelName && item.id !== args.id) {
            return rej(ResultRt.fail("模型名称已存在"));
          }
        });

        if (isUpdateOperate) {
          settingStore.set("modelList", modelList);

          return rev(ResultRt.success(modelList));
        } else {
          args.id = new Date().valueOf() + modelList.length;
          modelList.push(args);
          settingStore.set("modelList", modelList);

          return rev(ResultRt.success(modelList));
        }
      } catch (error) {
        return rej(ResultRt.fail("模型项添加失败"));
      }
    });
  });

  ipcMain.handle(
    "get-model-type",
    async (_, optinos: { url: string; apiKey: string; modelName?: string }) => {
      if (optinos.modelName == MODEL_NAME_MAP.DOUBAO) {
        /**
         * doubao-seed-1.6
doubao-pro-32k
doubao-1.5-pro-32k
doubao-code-32k
         */
        return ResultRt.success([
          {
            id: "doubao-seed-1.6",
            name: "豆包-1.6",
          },
          {
            id: "doubao-pro-32k",
            name: "豆包-pro-32k",
          },
          {
            id: "doubao-1.5-pro-32k",
            name: "豆包-1.5-pro-32k",
          },
          {
            id: "doubao-code-32k",
            name: "豆包-code-32k",
          },
          {
            id: "doubao-1.5-code-32k",
            name: "豆包-1.5-code-32k",
          },
        ]);
      }
      // openApi 统一规范，获取模型列表
      const modelUrl = optinos.url + "/models";
      const fetchMethod = "GET";

      const res = await fetch(modelUrl, {
        method: fetchMethod,
        headers: {
          Authorization: `Bearer ${optinos.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status != 200) {
        const body = JSON.parse(await res.text());
        return ResultRt.fail(body.message || "模型类型获取失败:" + res.status);
      } else {
        const body = JSON.parse(await res.text());
        const filterModelList = body.data;

        return ResultRt.success(filterModelList);
      }
    },
  );

  ipcMain.handle("get-model-list", () => {
    try {
      const settingStore = configManagerFactory(SETTING_MODEL_LIST);
      const modelList =
        settingStore.get<ModelItemInterace[]>("modelList") || [];
      return ResultRt.success(modelList);
    } catch (error) {
      return ResultRt.fail("模型列表获取失败");
    }
  });

  ipcMain.handle("get-model-item", (_, args) => {
    try {
      const settingStore = configManagerFactory(SETTING_MODEL_LIST);
      const modelList =
        settingStore.get<ModelItemInterace[]>("modelList") || [];
      const modelItem = modelList.find((item) => item.modelName === args);
      console.log(modelItem, "++??modelitem");
      if (modelItem) {
        return ResultRt.success(modelItem);
      }
      return ResultRt.fail("模型项不存在");
    } catch (error) {
      return ResultRt.fail("模型项获取失败");
    }
  });

  // 删除指定名称的模型
  ipcMain.handle("delete-model-item", (_, args) => {
    try {
      const settingStore = configManagerFactory(SETTING_MODEL_LIST);
      const modelList =
        settingStore.get<ModelItemInterace[]>("modelList") || [];
      console.log(modelList, "++??");
      const newModelList = modelList.filter((item) => item.modelName !== args);
      settingStore.set("modelList", newModelList);

      return ResultRt.success(null);
    } catch (error) {
      return ResultRt.fail("删除失败");
    }
  });

  ipcMain.handle("update-model-item", (_, args) => {
    try {
      const settingStore = configManagerFactory(SETTING_MODEL_LIST);
      const modelList =
        settingStore.get<ModelItemInterace[]>("modelList") || [];
      console.log(modelList, "++??");
      const newModelList = modelList.map((item) => {
        if (item.modelName === args.modelName) {
          return { ...item, ...args };
        }
        return item;
      });
      settingStore.set("modelList", newModelList);
      return ResultRt.success(null);
    } catch (error) {
      return ResultRt.fail("更新失败");
    }
  });

  ipcMain.handle("validate-model-item", async (_, args) => {
    try {
      const { modelName, apiUrl, apiKey } = args;
      if (!modelName || !apiUrl || !apiKey) {
        return ResultRt.fail("模型名称、API URL、API Key 不能为空");
      }

      const modalIns = getOpenAIClient({
        baseUrl: apiUrl,
        apiKey,
        options: {
          timeout: 3000,
        },
      });
      if (!modalIns) {
        return ResultRt.fail("模型初始化失败");
      } else {
        const test = await removeModelUrlAndKey(modalIns);
        if (test.success) {
          return ResultRt.success(test.data);
        } else {
          return ResultRt.fail(test.message);
        }
      }
    } catch (error) {
      return ResultRt.fail(error);
    }
  });
};

export const baseSettingController = (win: BrowserWindow | null) => {
  ipcMain.handle("update-base-setting", (_, args) => {
    try {
      const { fieldName, value } = args;
      const settingStore = configManagerFactory(BASE_SETTING);
      settingStore.set(fieldName, value);
      return ResultRt.success(null);
    } catch (error) {
      return ResultRt.fail("更新失败");
    }
  });

  ipcMain.handle("get-base-setting", () => {
    try {
      const settingStore = configManagerFactory(BASE_SETTING);
      const value = settingStore.getAll();
      return ResultRt.success(value);
    } catch (error) {
      return ResultRt.fail("baseSetting.json获取失败");
    }
  });

  // 快捷键处理
  ipcMain.handle("update-shortcut-key", (_, args) => {
    try {
      const { fieldName, value } = args;
      const settingStore = configManagerFactory(BASE_SETTING);

      // 先注销原值，再注册新的快捷键
      const oldValue = settingStore.get(`shortKeyConfig.${fieldName}`) as
        | string
        | "";
      const ins = new ShortcutKeyManager(win);
      if (oldValue) {
        ins.unRegisterShortcutKey(oldValue);
      }

      ins.registerShortcutKey(value, ins.showMainWindow);

      settingStore.set(`shortKeyConfig.${fieldName}`, value);
      return ResultRt.success(null);
    } catch (error) {
      return ResultRt.fail("更新失败");
    }
  });
};
