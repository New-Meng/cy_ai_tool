// Claude 星火 混元，暂时不支持，后面引入第三方代理处理
export const MODEL_URL_MAP = {
  DEEP_SEEK: "https://api.deepseek.com",
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/openai/",
  GROQ: "https://api.mistral.ai/v1",
  WENXIN: "https://qianfan.baidubce.com/v2",
  DOUBAO: "https://ark.cn-beijing.volces.com/api/v3",
};

export const MODEL_NAME_MAP = {
  DEEP_SEEK: "DeepSeek",
  GEMINI: "Gemini",
  GROQ: "Groq",
  WENXIN: "文心一言",
  DOUBAO: "豆包",
} as const;

export const MODEL_INFO_MAP = {
  DEEP_SEEK: {
    id: 1,
    name: MODEL_NAME_MAP.DEEP_SEEK,
    url: MODEL_URL_MAP.DEEP_SEEK,
  },
  GEMINI: {
    id: 2,
    name: MODEL_NAME_MAP.GEMINI,
    url: MODEL_URL_MAP.GEMINI,
  },
  GROQ: {
    id: 3,
    name: MODEL_NAME_MAP.GROQ,
    url: MODEL_URL_MAP.GROQ,
  },
  WENXIN: {
    id: 4,
    name: MODEL_NAME_MAP.WENXIN,
    url: MODEL_URL_MAP.WENXIN,
  },
  DOUBAO: {
    id: 5,
    name: MODEL_NAME_MAP.DOUBAO,
    url: MODEL_URL_MAP.DOUBAO,
  },
};
