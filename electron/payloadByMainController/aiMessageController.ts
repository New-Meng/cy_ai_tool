import { ipcMain } from "electron";
import { SimpleChatbot } from "../langChain";
import { ResultRt } from "../utils";
import { modelTemperatureConfig } from "../langChain/modelTemperatureConfig";

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

  ipcMain.handle("getMessageList", async () => {
    const list = await simpleChatbotIns.getMessageList();
    return ResultRt.success(list);
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
};
