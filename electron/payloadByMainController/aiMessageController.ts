import { ipcMain } from "electron";
import { SimpleChatbot } from "../langChain";
import { ResultRt } from "../utils";
import { modelTemperatureConfig } from "../langChain/modelTemperatureConfig";
import { saveChatMessage } from "../typeorm/controller/chatMessageController";
import { Serialized } from "@langchain/core/load/serializable";

export const rendererAiMessageController = () => {
  const simpleChatbotIns = new SimpleChatbot();

  // 给ai 发消息，并等待ai回复
  ipcMain.handle("askMessageInvoke", async (_, content: string) => {
    if (!content) {
      return ResultRt.fail("请输入内容!");
    }
    const res = await simpleChatbotIns.sendMessageInvoke(content);
    return ResultRt.success(res);
  });

  ipcMain.handle("askMessageStream", async (event, content: string) => {
    try {
      if (!content) {
        return ResultRt.fail("请输入内容!");
      }
      const res = await simpleChatbotIns.sendMessageStream(content);
      for await (const chunk of res) {
        event.sender.send("aiAnswer-ing", chunk.content);
      }
      event.sender.send("aiAnswer-end");
      return ResultRt.success(true);
    } catch (error) {
      console.log(error, "++??kk这里的错误");
      event.sender.send("aiAnswer-error", error);
    }
  });

  ipcMain.handle("stopMessageStream", (_, modelId: string) => {
    // 这里看看如何停止流
    if (!modelId) {
      return ResultRt.fail("请输入模型id!");
    }
    simpleChatbotIns.stopMessageCurrentMessage(modelId);
  });

  ipcMain.handle("switchAIModel", (_, modelId: string) => {
    if (!modelId) {
      return ResultRt.fail("请输入模型id!");
    }
    simpleChatbotIns.switchModel(modelId);
    return ResultRt.success(true);
  });

  ipcMain.handle("clearCurrentMessage", () => {
    simpleChatbotIns.clearAIModelCurrentMessage();
    return ResultRt.success(true);
  });

  ipcMain.handle("updateTemperatureModel", (_, temperatureModel: number) => {
    try {
      const config = modelTemperatureConfig[temperatureModel] as Record<
        string,
        number
      >;

      simpleChatbotIns.updateTemperatureNum(config["temperature"]);

      console.log(config);
      return ResultRt.success(true);
    } catch (error) {
      return ResultRt.fail(error);
    }
  });

  ipcMain.handle("saveCurrentMessage", async (_, sessionId: string) => {
    const res = simpleChatbotIns.getCurrentMessage();

    const curMessage = await res.getMessages();

    const jsonMessage: {
      id: string;
      kwargs: Record<string, string>;
      lc: number;
      type: string;
    }[] = curMessage.map((item) => {
      return item.toJSON() as Serialized & {
        id: string;
        kwargs: Record<string, string>;
        lc: number;
        type: string;
      };
    });
    const tempName = jsonMessage[0]?.kwargs?.content?.slice(0, 8);

    await saveChatMessage(
      sessionId
        ? sessionId
        : new Date().valueOf() +
            "-" +
            Number(Math.random().toFixed(3)) * 1000 +
            "",
      JSON.stringify(jsonMessage),
      tempName as string,
    );

    return ResultRt.success(res);
  });
};
