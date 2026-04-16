import { Input, Button, Tooltip, Select, message } from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  SwapOutlined,
  PauseOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import styles from "./index.module.css";
import { ModelItemInterace } from "../../../electron/payloadByMainController/settingController";

marked.use({
  gfm: true, // 支持表格、删除线、任务列表
  breaks: true, // 换行自动转 <br>（像微信聊天一样）
  pedantic: false,
});

const ChatHome = () => {
  const [messageApi, mesageContext] = message.useMessage({
    top: 60,
    maxCount: 3,
  });

  // 流状态 0: 未开始 1: 进行中 2: 已结束 3: 已错误
  const [streamStatus, setStreamStatus] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [textValue, setTextValue] = useState("");
  const [modelList, setModelList] = useState<ModelItemInterace[]>([]);
  const [curModel, setCurModel] = useState<string | undefined>(undefined);
  const [chatList, setChatList] = useState<
    {
      type: "ai" | "human";
      content: string;
    }[]
  >([]);

  const initModel = async () => {
    const res = await window.ipcRenderer.invoke("get-model-list");
    if (res.success) {
      res.data?.forEach((model: ModelItemInterace) => {
        if (model.defaultModel) {
          setCurModel(model.id);
          handleSwitchModel(model.id);
        }
      });
      setModelList(res.data);
    } else {
      messageApi.error("获取模型列表失败!");
    }
  };

  const handleSendText = async () => {
    console.log(textValue, "++??文字");
    if (!curModel) {
      messageApi.error("请选择模型!");
      return;
    }

    setStreamStatus(1);
    setChatList([
      ...chatList,
      { type: "human", content: textValue },
      { type: "ai", content: "" },
    ]);

    window.ipcRenderer.invoke("askMessageStream", textValue);
    setTextValue("");
  };

  const handleSendStop = async () => {
    const res = await window.ipcRenderer.invoke("stopMessageStream", curModel);
    try {
      if (res.success) {
        messageApi.success("流已停止!");
      } else {
        messageApi.error(res.message || "流停止失败!");
      }
    } catch (error: unknown) {
      console.log(error, "++??error");
    } finally {
      setStreamStatus(0);
    }
  };

  const handleSwitchModel = async (
    val: string,
    options?: {
      successMessage?: boolean;
      failMessage?: boolean;
    },
  ) => {
    setCurModel(val);
    console.log(val);
    const res = await window.ipcRenderer.invoke("switchAIModel", val);
    console.log(res, "++??res");
    if (res.success) {
      if (options?.successMessage) {
        messageApi.success("模型切换成功!");
      }
    } else {
      if (options?.failMessage) {
        messageApi.error("模型切换失败!");
      }
    }
  };

  const handleClearMessage = () => {
    setTextValue("");
  };

  // 监听返回的流
  const watchAiAnswerStream = () => {
    window.ipcRenderer.on("aiAnswer-ing", (_, chunk) => {
      if (streamStatus != 1) {
        setStreamStatus(1);
      }

      setChatList((preList) => {
        const newList = [...preList];
        if (newList[newList.length - 1].type == "ai") {
          newList[newList.length - 1].content += chunk;
        }
        return newList;
      });
    });
    window.ipcRenderer.on("aiAnswer-end", (_, chunk) => {
      console.log(chunk, "++??end");
      if (streamStatus != 2) {
        setStreamStatus(2);
      }
    });
    window.ipcRenderer.on("aiAnswer-error", (_, chunk) => {
      console.log(chunk, "++??error");
      if (streamStatus != 3) {
        setStreamStatus(3);
      }
      messageApi.error(chunk?.message || "请求失败!");
    });
  };

  const clearWatchAiAnswer = () => {
    window.ipcRenderer.removeAllListeners("aiAnswer-end");
    window.ipcRenderer.removeAllListeners("aiAnswer-error");
    window.ipcRenderer.removeAllListeners("aiAnswer-ing");
  };

  useEffect(() => {
    initModel();
    watchAiAnswerStream();

    return () => {
      clearWatchAiAnswer();
    };
  }, []);

  useEffect(() => {
    window.ipcRenderer.invoke("getMessageList").then((res) => {
      console.log(res, "++??a");
    });
  }, [streamStatus]);

  useEffect(() => {
    const divBox = scrollRef.current;
    if (divBox) {
      divBox.scrollTop = divBox.scrollHeight; // 核心代码
    }
  }, [chatList?.[chatList.length - 1]?.content]);

  return (
    <>
      {mesageContext}
      <div
        ref={scrollRef}
        className="w-full h-full flex flex-col gap-5 justify-between items-center p-4 text-[14px]"
      >
        <div
          className={`w-full flex-1 overflow-y-auto ${styles["custom-scrollbar"]}`}
        >
          {chatList.map((item, index) => {
            if (item?.type == "human") {
              return (
                <div
                  key={index}
                  className="user-ask flex justify-end items-center w-full h-auto box-border px-3 mb-5"
                >
                  <div
                    className={`max-w-[80%] bg-[#f5f5f5] rounded-2xl px-4 py-2 ${styles.markdown}`} // 添加气泡背景色、圆角和内边距，并应用 Markdown 样式
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(item.content) as string,
                    }}
                  ></div>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={` ${streamStatus == 1 ? "is-generating" : ""} custom-ai-answer w-full h-auto box-border p-3 ${styles.markdown}`} // 应用 AI 答案的 Markdown 样式
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(item.content) as string,
                  }}
                />
              );
            }
          })}

          {chatList.length == 0 && (
            <div className="w-full h-full flex justify-center items-center text-center text-primary-1 text-[14px]">
              若天有雨，我亦留此地😀
            </div>
          )}
        </div>
        <div className="w-full border border-primary-1 rounded-2xl bg-white p-2 flex flex-col">
          <Input.TextArea
            placeholder="来开始聊天吧"
            variant="borderless"
            className={`w-full flex-1 ${styles["custom-scrollbar"]}`}
            style={{ backgroundColor: "transparent", resize: "none" }}
            autoSize={{ minRows: 4 }}
            value={textValue}
            onChange={(val: React.ChangeEvent<HTMLTextAreaElement>) => {
              setTextValue(val.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.stopPropagation();
                setTextValue("");
                handleSendText();
              }
            }}
          />
          <div className="flex justify-between items-center px-2 py-1">
            <div className="flex gap-2 items-center">
              <Tooltip title="切换模型">
                <Select
                  value={curModel}
                  placement="topLeft"
                  suffixIcon={<SwapOutlined />}
                  style={{
                    width: 150,
                    height: "25px",
                    background: "#fff",
                    fontSize: "12px",
                  }}
                  dropdownStyle={{ fontSize: "12px" }}
                  onChange={(val: string) =>
                    handleSwitchModel(val, {
                      successMessage: true,
                      failMessage: true,
                    })
                  }
                  options={Object.values(modelList).map((item) => {
                    return {
                      label: (
                        <span style={{ fontSize: "12px" }}>
                          {item.modelName}
                        </span>
                      ),
                      value: item.id,
                    };
                  })}
                />
              </Tooltip>
              <Tooltip title="清空对话">
                <Button
                  onClick={handleClearMessage}
                  size="small"
                  icon={<DeleteOutlined />}
                  variant="text"
                  danger
                  className="rounded-full"
                />
              </Tooltip>
            </div>

            <div>
              {(streamStatus == 0 ||
                streamStatus == 2 ||
                streamStatus == 3) && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="rounded-full"
                  onClick={handleSendText}
                >
                  发送
                </Button>
              )}

              {streamStatus == 1 && (
                <Button
                  type="primary"
                  icon={<PauseOutlined />}
                  className="rounded-full"
                  onClick={handleSendStop}
                >
                  停止
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHome;
