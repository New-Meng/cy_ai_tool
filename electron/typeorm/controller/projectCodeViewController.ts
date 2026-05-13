import { AppDataSource } from "..";
// import { CodeViewListEntity } from "../entity/CodeViewListEntity";
import { ViewProjectEntity } from "../entity/ViewProjectEntity";

// const codeViewListRepo = AppDataSource.getRepository(CodeViewListEntity);
const viewProjectRepo = AppDataSource.getRepository(ViewProjectEntity);

export const addProject = async ({
  projectId,
  projectName,
  projectPath,
}: {
  projectId: string;
  projectName: string;
  projectPath: string;
}) => {
  const isHas = await viewProjectRepo.findOne({
    where: {
      projectId,
    },
  });
  if (isHas) {
    throw new Error("项目已存在!");
  }
  const res = await viewProjectRepo.save({
    projectId,
    projectName,
    projectPath,
  });

  return res;
};

export const deleteProject = async (projectId: string) => {
  try {
    const findRes = await viewProjectRepo.findOne({
      where: {
        projectId,
      },
    });
    if (!findRes) {
      throw new Error("项目不存在!");
    }
    const res = await viewProjectRepo.delete({ projectId });
    return res;
  } catch (error) {
    throw new Error("删除失败，请未知错误");
  }
};

export const getProjectList = async () => {
  const res = await viewProjectRepo.find();
  return res;
};
