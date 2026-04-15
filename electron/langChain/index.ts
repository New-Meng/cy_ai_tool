import { ChatOpenAI } from "@langchain/openai";
import { SETTING_MODEL_LIST } from "../../constant/storeName";
import { configManagerFactory } from "../config/config-manager";
import { ModelItemInterace } from "../payloadByMainController/settingController";
// human 用户消息   ai 模型回复
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { MODEL_INFO_MAP } from "../../constant";

export type CustomChatModelOpenAI = ChatOpenAI & {
  _$modelVender?: number;
  _$modelId?: string;
};

// 简单的聊天机器人 原始class
export class SimpleChatbot {
  modelMap: Record<string, CustomChatModelOpenAI>;
  currentModel: CustomChatModelOpenAI | null;
  modelConfigList: Record<string, ModelItemInterace>;
  baseTemperature: number = 0.7;
  // 用于记录请求集合，用于取消请求，只有stream方式，可以 中断，也只有他中断有意义
  // stream 有建立post 长链接  invoke是一次性请求
  abortController: Map<string, AbortController> = new Map();
  message: (HumanMessage | AIMessage)[];
  constructor() {
    // 当前使用的模型实例
    this.currentModel = null;

    this.message = [];

    this.modelMap = {};

    const settingStore = configManagerFactory(SETTING_MODEL_LIST);
    this.modelConfigList = (
      settingStore.get<ModelItemInterace[]>("modelList") || []
    ).reduce(
      (prev, item) => {
        prev[item.id] = item;
        return prev;
      },
      {} as Record<string, ModelItemInterace>,
    );
  }

  // 获取模型实例
  getChatModel(modelConfig: ModelItemInterace) {
    if (this.modelMap[modelConfig.id]) {
      return this.modelMap[modelConfig.id];
    } else {
      if (modelConfig.modelVender == MODEL_INFO_MAP.DOUBAO.id) {
        this.modelMap[modelConfig.id] = new ChatOpenAI({
          // openAIApiKey: modelConfig.apiKey, // 类型有问题 不报错，坑爹
          apiKey: modelConfig.apiKey,
          model: modelConfig.eqId, // 模型的名称 坑爹，老版本叫 modelName 为什么 class 类型不报错
          // 后期看到了处理下，允许自己配置
          temperature: this.baseTemperature,
          configuration: {
            baseURL: modelConfig.apiUrl,
          },
        });
        this.modelMap[modelConfig.id]._$modelVender = modelConfig.modelVender;
        this.modelMap[modelConfig.id]._$modelId = modelConfig.id;
        console.log(this.modelMap[modelConfig.id], "++??kk刚刚建立的模型");
        return this.modelMap[modelConfig.id];
      } else {
        this.modelMap[modelConfig.id] = new ChatOpenAI({
          // openAIApiKey: modelConfig.apiKey, // 类型有问题 不报错，坑爹
          apiKey: modelConfig.apiKey,
          model: modelConfig.modeType, // 模型的名称 坑爹，老版本叫 modelName 为什么 class 类型不报错
          // 后期看到了处理下，允许自己配置
          temperature: this.baseTemperature,
          configuration: {
            baseURL: modelConfig.apiUrl,
          },
        });
        this.modelMap[modelConfig.id]._$modelVender = modelConfig.modelVender;
        this.modelMap[modelConfig.id]._$modelId = modelConfig.id;
        console.log(this.modelMap[modelConfig.id], "++??kk刚刚建立的模型");
        return this.modelMap[modelConfig.id];
      }
    }
  }

  // 获取对应的消息记录
  getMessageList() {
    return this.message;
  }

  switchModel(modelId: string) {
    if (!this.modelConfigList[modelId]) {
      throw new Error(`模型ID:${modelId} 配置不存在`);
    }
    try {
      const targetModel = this.getChatModel(this.modelConfigList[modelId]);

      this.currentModel = targetModel as CustomChatModelOpenAI;
      console.log(modelId, "curModelId");
    } catch (error) {
      console.log(error, "++??error");
      throw new Error(`模型ID:${modelId} 切换失败`);
    }
  }

  // 用户发送消息 一次性返回
  async sendMessageInvoke(content: string) {
    try {
      if (!this.currentModel) {
        throw new Error("当前未选择模型");
      }
      const sendContent: HumanMessage = new HumanMessage(content);
      this.message.push(sendContent);
      const aiResponse = await this.currentModel.invoke(this.message);
      this.message.push(new AIMessage(aiResponse.content));
      return aiResponse.content;
    } catch (error) {
      console.log(error, "++??error");
      return error;
    }
  }

  async sendMessageStream(content: string) {
    if (!this.currentModel) {
      throw new Error("当前未选择模型");
    }
    const requestKey = this.currentModel._$modelId;
    if (!requestKey) {
      throw new Error("当前模型未配置模型供应商");
    }
    const abortController = new AbortController();
    this.abortController.set(requestKey, abortController);
    this.message.push(new HumanMessage(content));
    const tempStream = this.currentModel.stream(content, {
      signal: abortController.signal,
    });

    return tempStream;
  }

  // 停止当前回答
  async stopMessageCurrentMessage(_modelId: string) {
    const abortController = this.abortController.get(_modelId);
    if (abortController) {
      abortController.abort("手动终止");
      this.abortController.delete(_modelId);
    }
  }

  async setAiAnswerMessage(content: string) {
    this.message.push(new AIMessage(content));
  }
}
