import { app } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import { DataSource } from "typeorm";
import { ChatMessageEntity } from "./entity/ChatMessageEntity";
import { CodeViewListEntity } from "./entity/CodeViewListEntity";
import { ViewProjectEntity } from "./entity/ViewProjectEntity";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nativeBinding = path.join(
  __dirname,
  "../node_modules/better-sqlite3/build/Release/better_sqlite3.node",
);

let dbPath: string;
if (app.isPackaged) {
  dbPath = path.join(app.getPath("exe"), "database.sqlite");
} else {
  dbPath = path.join(process.cwd(), "database.sqlite");
}

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: dbPath,
  extra: {
    avoidUnnecessaryRepositories: true,
  },

  // 显式指定原生模块路径
  nativeBinding: nativeBinding,

  entities: [ChatMessageEntity, CodeViewListEntity, ViewProjectEntity],
  synchronize: true, // 开发环境可用，生产环境建议关闭
  logging: true,

  // 不要加载，项目不用的数据库驱动
});

// 在 app.whenReady() 中初始化
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connected:", dbPath);
    }
  } catch (error) {
    console.error("Database init failed:", error);
  }
}
