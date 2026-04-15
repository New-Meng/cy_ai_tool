import Store from "electron-store";
import { getConfigBasePath } from "./path";
import { StoreOptionsInterface } from "./configManagerInterface";

class ConfigManager {
  store: Store;
  constructor(configName: string, options: StoreOptionsInterface = {}) {
    const { defaults, schema, ...args } = options;
    this.store = new Store({
      name: configName, // 文件名称
      cwd: getConfigBasePath(),
      defaults: defaults || {},
      schema: schema || {},
      ...args,
    });
  }

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T;
  }

  getAll<T>(): T {
    return this.store.store as T;
  }

  set<T>(key: string, value: T) {
    this.store.set(key, value);
  }

  getFilePath() {
    return this.store.path;
  }
}

// 工厂
const StoreMap: Record<string, ConfigManager> = {};
const configManagerFactory = (
  configName: string,
  options?: StoreOptionsInterface,
) => {
  if (!StoreMap[configName]) {
    StoreMap[configName] = new ConfigManager(configName, options);
  }
  return StoreMap[configName];
};

export { ConfigManager, configManagerFactory };
