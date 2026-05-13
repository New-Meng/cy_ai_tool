import { exec } from "child_process";
import { ResultRt } from "../../utils";
import dayjs from "dayjs";

// 获取git 的 uuid
export const getGitProjectUuid = async (filePath: string) => {
  return new Promise((resolve, reject) => {
    const command = `git -C "${filePath}" rev-list --max-parents=0 HEAD`;

    exec(command, (_, stdout, stderr) => {
      if (stderr) {
        console.log(`exec error: ${stderr}`);
        return reject(stderr);
      }
      console.log(stdout.trim(), "++??git版本记录");

      return resolve(stdout.trim());
    });
  });
};

// 获取git 提交记录的列表
export const getGitCommitHistory = async (
  filePath: string,
  limit: number = 100,
  page: number = 0,
) => {
  return new Promise((resolve, reject) => {
    const command = [
      "git",
      "-C",
      filePath, // 不用引号！exec 会自动处理
      "log",
      `--skip=${page * limit}`,
      `--max-count=${limit}`,
      "--",
      ".",
    ];

    exec(command.join(" "), (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error.message}`);
        reject(ResultRt.fail(error.message));
        return;
      }

      if (stderr) {
        console.error(`exec error: ${stderr}`);
        reject(ResultRt.fail(stderr));
        return;
      }

      const tempArr = stdout
        .split(/^commit /m)
        .filter(Boolean) // 去掉第一个空块
        .map((block) => {
          const lines = block.split("\n");

          const hash = lines[0].trim();

          const authorLine = lines.find((l) => l.startsWith("Author:"));
          const dateLine = lines.find((l) => l.startsWith("Date:"));

          const messageLines = lines.slice(lines.indexOf("") + 1);

          return {
            hash,
            author: authorLine?.replace("Author:", "").trim(),
            date: dayjs(dateLine?.replace("Date:", "").trim()).format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            message: messageLines.join("\n").trim(),
          };
        });
      resolve(tempArr);
    });
  });
};

// 返回git的更改文件的内容
export const getGitDiffFileText = async (
  filePath: string,
  commitHash: string,
) => {
  return new Promise((resolve, reject) => {
    const command = `git -C ${filePath} show --name-only --pretty=format:'' ${commitHash}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error.message}`);
        reject(ResultRt.fail(error.message));
        return;
      }

      if (stderr) {
        console.error(`exec error: ${stderr}`);
        reject(ResultRt.fail(stderr));
        return;
      }
      resolve(stdout);
    });
  });
};
