import path from "path";
import { app } from "electron";
import fs from "fs";

function getConfigBasePath() {
  let basePath;

  if (app.isPackaged) {
    // 生产环境：在应用所在目录的 config 文件夹
    basePath = path.join(path.dirname(app.getPath("userData")), "prodConfig");
  } else {
    // 开发环境：在项目根目录的 config 文件夹
    basePath = path.join(process.cwd(), "devConfig");
  }

  // 确保目录存在
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  return basePath;
}

export { getConfigBasePath };
