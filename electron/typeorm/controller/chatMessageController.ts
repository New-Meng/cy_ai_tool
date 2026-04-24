import { AppDataSource } from "../index";
import { ChatMessageEntity } from "../entity/ChatMessage";
import { ResultRt } from "../../utils";

// 获取 Repository
const chatMessageRepo = AppDataSource.getRepository(ChatMessageEntity);

export const getChatMessageList = async () => {
  const dbRes = await chatMessageRepo.find({
    select: ["id", "name", "message", "isDelete", "createTime", "updateTime"],
  });

  return ResultRt.success(
    dbRes.filter((item) => {
      if (!item.isDelete) {
        return true;
      } else {
        return false;
      }
    }),
  );
};

export const saveChatMessage = async (chatMessage: string, name: string) => {
  try {
    await chatMessageRepo.save({ message: chatMessage, name });
    return ResultRt.success(true);
  } catch (error) {
    return ResultRt.fail(error as Error);
  }
};

export const updateChatMessage = async (id: number, message: string) => {
  try {
    await chatMessageRepo.update(id, {
      message: message,
    });
    return ResultRt.success(true);
  } catch (error) {
    return ResultRt.fail(error as Error);
  }
};

export const deleteChatMessage = async (id: number) => {
  try {
    await chatMessageRepo.update(id, {
      isDelete: true,
    });
    // 刷新缓存
    const newRes = await chatMessageRepo.findOne({ where: { id } });
    return ResultRt.success(newRes);
  } catch (error) {
    return ResultRt.fail(error as Error);
  }
};
