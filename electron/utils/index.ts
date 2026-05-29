import OpenAI from "openai";

export interface ResultRtType<T> {
  success: boolean;
  message: string;
  data: T;
}

// ipc 通信状态
export class ResultRt {
  static success<T>(data: T) {
    return {
      success: true,
      message: "操作成功",
      data,
    };
  }
  static fail(message: unknown) {
    return {
      success: false,
      message,
      data: null,
    };
  }
}

// 校验接口函数
export const validateModelUrlAndKey = (modelUrl: string, modelKey: string) => {
  if (!modelUrl || !modelKey) {
    return ResultRt.fail("模型URL或模型Key不能为空");
  } else if (!modelUrl.startsWith("https://")) {
    // 1.0 暂时不考虑 本地部署的模型
    return ResultRt.fail("模型URL必须以https://开头");
  }
  return ResultRt.success(null);
};

// 远程校验
export interface removeCatchInterface {
  message?: string;
  data?: string;
  msg?: string;
}

// 注意，后面其它模型可能接口返的数据格式不同需要处理
export const removeModelUrlAndKey = async (
  OpenAIInstance: OpenAI & { _options: { _$modeType: string } },
) => {
  try {
    try {
      const resultList = await OpenAIInstance.models.list();
      console.log("API 连接正常", resultList?.data);
      return ResultRt.success(resultList?.data || []);
    } catch (error) {
      console.error("API 连接失败:", error);
      return ResultRt.fail(error);
    }
  } catch (error) {
    return ResultRt.fail(error);
  }
};
