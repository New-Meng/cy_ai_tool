import { ipcMain } from "electron";
import { getGitCommitHistory, getTotalCommits } from "../lib/gitOperate";
import { ResultRt } from "../utils";
import {
  addProject,
  deleteProject,
  getProjectList,
} from "../typeorm/controller/projectCodeViewController";

export const commandContrllerFun = () => {
  // 保存选中的项目
  ipcMain.handle(
    "save-project",
    async (_, { projectName, projectId, projectPath }) => {
      try {
        await addProject({ projectName, projectId, projectPath });

        return ResultRt.success(projectName);
      } catch (error) {
        if (error instanceof Error) {
          return ResultRt.fail(error.message);
        }
        return ResultRt.fail(String(error));
      }
    },
  );

  ipcMain.handle("delete-project", async (_, { projectId }) => {
    try {
      await deleteProject(projectId);
      return ResultRt.success("删除成功");
    } catch (error) {
      if (error instanceof Error) {
        return ResultRt.fail(error.message);
      }
      return ResultRt.fail(String(error));
    }
  });

  // 获取当前所有的项目
  ipcMain.handle("getProjectList", async () => {
    const res = await getProjectList();
    return ResultRt.success(res);
  });

  // 获取分页应用
  ipcMain.handle("getProjectHashList", async (_, { path, limit, page }) => {
    const res = await getGitCommitHistory(path, limit, page - 1);
    const totalCommits = await getTotalCommits(path);
    return ResultRt.success({ data: res, total: totalCommits });
  });

  // ipcMain.handle("viewCodeAll", async (event, { path, commitHash }) => {
  //   // const res = await getGitDiffFileText(path, commitHash);
  //   return ResultRt.success(res);
  // });
};
