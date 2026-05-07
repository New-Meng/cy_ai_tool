import { AppDataSource } from "../index";
import { ChatMessageEntity } from "../entity/ChatMessageEntity";
import { ResultRt } from "../../utils";

// 获取 Repository
const chatMessageRepo = AppDataSource.getRepository(ChatMessageEntity);

export const getChatMessageList = async () => {
  const dbRes = await chatMessageRepo.find({
    select: [
      "id",
      "name",
      "message",
      "isDelete",
      "createTime",
      "updateTime",
      "sessionId",
    ],
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

export const saveChatMessage = async (
  sessionId: string,
  chatMessage: string,
  name: string,
) => {
  try {
    const findRes = await chatMessageRepo.findOne({
      where: { sessionId },
    });

    if (findRes) {
      await chatMessageRepo.update(findRes.id, {
        message: chatMessage,
      });
    } else {
      await chatMessageRepo.save({ sessionId, name, message: chatMessage });
    }

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

export const deleteChatMessage = async (sessionId: string) => {
  try {
    await chatMessageRepo.update(
      { sessionId: sessionId },
      {
        isDelete: true,
      },
    );
    // 刷新缓存
    const newRes = await chatMessageRepo.findOne({ where: { sessionId } });
    return ResultRt.success(newRes);
  } catch (error) {
    return ResultRt.fail(error as Error);
  }
};
