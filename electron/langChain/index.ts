import { ChatOpenAI } from "@langchain/openai";
import { SETTING_MODEL_LIST } from "../../constant/storeName";
import { configManagerFactory } from "../config/config-manager";
import { ModelItemInterace } from "../payloadByMainController/settingController";
import {
  Runnable,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { MODEL_INFO_MAP } from "../../constant";
import { BaseMessage } from "@langchain/core/messages";

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
  sessionId: string = "";
  // 用于记录请求集合，用于取消请求，只有stream方式，可以 中断，也只有他中断有意义
  // stream 有建立post 长链接  invoke是一次性请求
  abortController: Map<string, AbortController> = new Map();
  message: InMemoryChatMessageHistory;

  prompt = ChatPromptTemplate.fromMessages([
    // 预留系统级别的提示变量，方便后面给定系统级别提示
    ["system", "{system_prompt}"],
    new MessagesPlaceholder("history"), // 这里的名字要和下面 historyMessagesKey 一致
    ["human", "{content}"], // 这里的变量名要和下面 inputMessagesKey 一致 content代表用户
  ]);

  chatChain: Runnable | null = null;
  constructor() {
    // 当前使用的模型实例
    this.currentModel = null;

    this.message = new InMemoryChatMessageHistory();

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
  getChatModel(modelConfig: ModelItemInterace, isReload: boolean = false) {
    if (this.modelMap[modelConfig.id] && !isReload) {
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
        return this.modelMap[modelConfig.id];
      }
    }
  }

  // 获取当前的模型
  getCurrentModel() {
    return this.currentModel;
  }

  // 更新模型参数，并重新生成模型
  resetModel() {
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

    Object.keys(this.modelMap).forEach((key) => {
      this.modelMap[key] = this.getChatModel(this.modelConfigList[key], true);
    });
  }

  // 获取对应的消息记录
  getCurrentMessage() {
    return this.message;
  }

  switchModel(modelId: string) {
    if (!this.modelConfigList[modelId]) {
      throw new Error(`模型ID:${modelId} 配置不存在`);
    }
    try {
      const targetModel = this.getChatModel(this.modelConfigList[modelId]);
      this.currentModel = targetModel as CustomChatModelOpenAI;

      this.initChain();
    } catch (error) {
      console.log(error, "++??error");
      throw new Error(`模型ID:${modelId} 切换失败`);
    }
  }

  async updateTemperatureNum(temperatureNum: number) {
    this.baseTemperature = temperatureNum;
    this.getChatModel(
      this.modelConfigList[this.currentModel?._$modelId || ""],
      true,
    );
    this.initChain();
  }

  initChain() {
    if (!this.currentModel) {
      throw new Error("当前未选择模型");
    }
    this.chatChain = new RunnableWithMessageHistory({
      runnable: this.prompt.pipe(this.currentModel), // 传入动态链
      getMessageHistory: () => this.message, // 自动存储历史
      inputMessagesKey: "content", // 对应上面 Prompt 里的 {content}
      // 对应上面 Prompt 里的 MessagesPlaceholder("history")
      historyMessagesKey: "history",
    });
  }

  // 用户发送消息 一次性返回
  async sendMessageInvoke(content: string) {
    try {
      if (!this.currentModel) {
        throw new Error("当前未选择模型");
      }

      if (!this.chatChain) {
        throw new Error("当前为生成chain");
      }
      const tempRes = await this.chatChain.invoke(
        { content },
        { configurable: { sessionId: "default" } },
      );

      return tempRes;
    } catch (error) {
      console.log(error, "++??error");
      return error;
    }
  }

  async sendMessageStream(content: string) {
    if (!this.currentModel) {
      throw new Error("当前未选择模型");
    }

    const abortController = new AbortController();
    this.abortController.set(
      this.currentModel?._$modelId || "",
      abortController,
    );

    // 使用 LCEL + 自动记忆器
    if (!this.chatChain) {
      throw new Error("没有生成chain");
    } else {
      const tempStream = await this.chatChain.stream(
        { content, system_prompt: "" },
        {
          configurable: { sessionId: "default" },
          signal: abortController.signal,
        },
      );
      return tempStream;
    }
  }

  // 停止当前回答
  async stopMessageCurrentMessage(_modelId: string) {
    const abortController = this.abortController.get(_modelId);
    if (abortController) {
      abortController.abort("手动终止");
      this.abortController.delete(_modelId);
    }
  }

  async clearAIModelCurrentMessage() {
    this.sessionId = "";
    await this.message.clear();
  }

  saveCurrentMessage = async () => {
    const messages = await this.message.getMessages();

    // 转换为 JSON 字符串
    const jsonMessage = JSON.stringify(messages);
    return jsonMessage;
  };

  changeChat = async (message: BaseMessage[], sessionId: string) => {
    this.sessionId = sessionId;
    this.message = new InMemoryChatMessageHistory(message);
    this.initChain();
    return this.message;
  };

  async codeViewStream(options: {
    userPromptText?: string;
    codeText?: string;
  }) {
    const { userPromptText, codeText } = options;

    if (!codeText?.trim()) {
      throw new Error("没有传入代码");
    }

    const abortController = new AbortController();
    this.abortController.set(
      this.currentModel?._$modelId || "",
      abortController,
    );

    if (!this.chatChain) {
      throw new Error("没有生成chain");
    } else {
      const tempStream = await this.chatChain.stream(
        {
          system_prompt:
            "你是一个全栈高级开发, 根据我传给你的文本，审阅这些代码，并返回审阅结果" +
            (userPromptText || ""),
          content: codeText || "",
        },
        {
          configurable: { sessionId: "default" },
          signal: abortController.signal,
        },
      );
      return tempStream;
    }
  }
}
