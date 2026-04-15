import OpenAI from "openai";
import { MODEL_NAME_MAP } from "../../../constant/index";

const AllAiClientMap = new Map<string, OpenAI>();

export interface AiClientConfigType {
  apiKey?: string;
  baseUrl?: string;
  modelVender?: (typeof MODEL_NAME_MAP)[keyof typeof MODEL_NAME_MAP];
  options?: Record<string, string | number>;
}
export function getOpenAIClient(config: AiClientConfigType = {}) {
  const cacheKey = JSON.stringify(config);

  if (!AllAiClientMap.has(cacheKey)) {
    AllAiClientMap.set(
      cacheKey,
      new OpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        baseURL: config.baseUrl,
        // 合并其他配置
        ...config.options,
      }),
    );
  }

  return AllAiClientMap.get(cacheKey);
}
