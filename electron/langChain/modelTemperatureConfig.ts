export const modelTemperatureConfig: Record<number, object> = {
  // coding用
  1: {
    temperature: 0.1, // 极低温度，确保代码精确性
  },
  // 正常对话
  2: {
    temperature: 0.7, // 适中温度，自然流畅
  },
  // 创造力用
  3: {
    temperature: 0.9, // 高温度，鼓励创意
  },
  // 彻底疯狂用
  4: {
    temperature: 1.5, // 极高温度，最大随机性
  },
};
