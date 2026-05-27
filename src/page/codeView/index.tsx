import { Button, Input, Popconfirm, Select, Tooltip, message } from "antd";
import {
  ClearOutlined,
  CloseCircleOutlined,
  SendOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import baseStyle from "../../common/baseCss.module.css";
import type { ProjectItem } from "../../../electron/dto/codeViewDto";
import { ModelItemInterace } from "../../../electron/payloadByMainController/settingController";
import SelectGitHash from "./SelectGitHash";
import { CodeViewResult } from "./CodeViewResult";

type HashItem = {
  hash: string;
  message: string;
  date: string;
  author: string;
};

const CodeView = () => {
  const selectGitHashRef = useRef<{
    open: (projectPath: string) => Promise<HashItem | null>;
  }>(null);
  const [messageApi, messageContext] = message.useMessage({
    top: 60,
    maxCount: 3,
  });

  const [codeResult, setCodeResult] = useState<string>("");
  const [streamStatus, setStreamStatus] = useState<number>(0);
  const [curModel, setCurModel] = useState<string>("");
  // 模拟项目列表数据
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);

  const [activeProjectId, setActiveProjectId] = useState<number>(0);
  const [operateHash, setOperateHash] = useState<HashItem | null>(null);

  const [modelList, setModelList] = useState<ModelItemInterace[]>([]);

  const [textValue, setTextValue] = useState<string>("");

  const initList = async () => {
    const res = await window.ipcRenderer.invoke("getProjectList");
    console.log(res.data, "++??resdata");
    if (res.success) {
      setProjectList(res.data);
    }
  };

  const initModelList = async () => {
    const res = await window.ipcRenderer.invoke("get-model-list");
    const currentModel = await window.ipcRenderer.invoke("get-current-model");
    console.log(currentModel, "++??currentModel");
    if (currentModel.success) {
      setCurModel(currentModel.data);
    }

    if (res.success) {
      setModelList(res.data);
    } else {
      messageApi.error("获取模型列表失败!");
    }
  };

  const addProject = async () => {
    const res = await window.ipcRenderer.invoke("select-file");
    console.log(res);
    if (!res.success) {
      messageApi.error(res.message);
      return;
    }

    const addRes = await window.ipcRenderer.invoke("save-project", {
      projectName: res.data.fileName,
      projectId: res.data.uuid,
      projectPath: res.data.path,
    });
    console.log(addRes, "++??addRes");
    if (addRes.success) {
      messageApi.success("添加成功");
      initList();
    } else {
      messageApi.error(
        addRes.message.message ? addRes.message.message : addRes.message,
      );
    }
  };

  const handleDeleteProject = async (item: ProjectItem) => {
    try {
      const deleteRes = await window.ipcRenderer.invoke("delete-project", {
        projectId: item.projectId,
      });
      if (deleteRes.success) {
        messageApi.success("删除成功");
        initList();
      } else {
        messageApi.error(
          deleteRes.message.message
            ? deleteRes.message.message
            : deleteRes.message,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message);
      } else {
        console.error(error);
        messageApi.error("删除失败，请未知错误");
      }
    }
  };

  const selectCurProject = async (item: ProjectItem) => {
    try {
      setActiveProjectId(item.id);
      const hash: HashItem | null | undefined =
        await selectGitHashRef.current?.open(item.projectPath);
      setOperateHash(hash || null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSwitchModel = async (value: string) => {
    const res = await window.ipcRenderer.invoke("switchAIModel", value);
    console.log(res, "++??res");
    if (res.success) {
      setCurModel(value);
      messageApi.success("模型切换成功!");
    } else {
      messageApi.error("模型切换失败!");
    }
  };

  const handleSendCodeView = () => {
    console.log("logsend");
    setStreamStatus(1);
    setCodeResult("<span></span>");
    window.ipcRenderer.invoke("sendCodeViewStream", {
      userPromptText: textValue,
      filePath:
        projectList?.find((item) => {
          return item.id == activeProjectId;
        })?.projectPath || "",
      hash: operateHash?.hash || "",
    });
  };

  const handleStopAiReview = async () => {
    await window.ipcRenderer.invoke("stopCodeViewStream");
    setStreamStatus(0);
  };

  // 监听返回的流
  const watchAiAnswerStream = () => {
    window.ipcRenderer.on("aiAnswer-ing", (_, chunk) => {
      if (streamStatus != 1) {
        setStreamStatus(1);
      }

      setCodeResult((preText) => preText + chunk);
    });
    window.ipcRenderer.on("aiAnswer-end", () => {
      console.log(codeResult, "++??end");
      if (streamStatus != 2) {
        setStreamStatus(2);
      }
    });
    window.ipcRenderer.on("aiAnswer-error", (_, chunk) => {
      console.log(chunk, "++??error");
      if (streamStatus != 2) {
        setStreamStatus(2);
      }
      messageApi.error(chunk?.message || "请求失败!");
    });
  };

  const handleClearCodeView = async () => {
    try {
      await window.ipcRenderer.invoke("clearCurrentMessage");
      setCodeResult("");
      messageApi.success("删除成功");
    } catch (error) {
      console.log(error);
      messageApi.error(
        error instanceof Error ? error.message : "删除失败，请未知错误",
      );
    }
  };

  useEffect(() => {
    initModelList();
    initList();
    watchAiAnswerStream();
  }, []);

  return (
    <>
      {messageContext}
      <SelectGitHash ref={selectGitHashRef}></SelectGitHash>
      <div className="w-full h-full flex justify-between items-center">
        <div className="w-[220px] h-full border-r border-[#e8e8e8] rounded-xl bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-[#f0f0f0] font-bold text-[#333]">
            项目列表
          </div>
          <div
            className={`w-full flex-1 overflow-y-auto p-2 flex flex-col gap-1 ${baseStyle["custom-scrollbar"]}`}
          >
            {projectList.map((item) => {
              const isActive = activeProjectId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => selectCurProject(item)}
                  className={`group w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-[14px] select-none flex justify-between items-center
                  ${
                    isActive
                      ? "bg-primary-1/10 text-primary-1 font-medium"
                      : "text-[#555] hover:bg-[#f5f5f5] hover:text-[#333]"
                  }
                `}
                >
                  <span className="truncate pr-2" title={item.projectName}>
                    {item.projectName}
                  </span>

                  <div
                    className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Popconfirm
                      placement="bottomRight"
                      title="确定移除该项目吗？"
                      okText="确定"
                      cancelText="取消"
                      onConfirm={() => handleDeleteProject(item)}
                    >
                      <CloseCircleOutlined className="text-[#999] hover:text-red-500 cursor-pointer p-1 rounded-full hover:bg-black/5 transition-colors" />
                    </Popconfirm>
                  </div>
                </div>
              );
            })}

            {projectList.length === 0 && (
              <div className="text-center text-[#999] mt-10 text-[13px]">
                暂无项目
              </div>
            )}
          </div>

          <div className="w-full h-[60px] flex justify-center items-center border-t border-[#f0f0f0] bg-[#fafafa]">
            <Button
              type="primary"
              className="w-[85%] rounded-full shadow-md"
              onClick={addProject}
            >
              选择项目目录
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center flex-1 h-full ml-2 border-[#e8e8e8]">
          {/* 右侧内容区 */}
          {/* ai评分的地方 */}
          <div className="flex-1 w-full h-[calc(100%-180px)] overflow-y-auto">
            <CodeViewResult
              streamStatus={streamStatus}
              viewResult={codeResult}
            ></CodeViewResult>
          </div>

          <div className="w-full border border-primary-1 rounded-2xl bg-white p-2 flex flex-col">
            {operateHash?.hash && (
              <div className="h-[28px] flex items-center px-1">
                <div className="max-w-full h-[24px] px-2 flex items-center gap-1 rounded-full bg-primary-1/10 text-primary-1 text-[12px]">
                  <Tooltip title={operateHash.hash}>
                    <span className="truncate max-w-[220px]">
                      {operateHash.hash}
                    </span>
                  </Tooltip>
                  <CloseCircleOutlined
                    className="cursor-pointer text-[13px] hover:text-red-500 transition-colors"
                    onClick={() => setOperateHash(null)}
                  />
                </div>
              </div>
            )}

            <Input.TextArea
              placeholder="请输入代码审核prompt"
              variant="borderless"
              className={`w-full flex-1 ${baseStyle["custom-scrollbar"]}`}
              style={{ backgroundColor: "transparent", resize: "none" }}
              autoSize={{ minRows: 4 }}
              value={textValue}
              onInput={(val: React.ChangeEvent<HTMLTextAreaElement>) => {
                console.log(val, "++??val");
                setTextValue(val.target.value);
              }}
              onKeyDown={(e) => {
                // 敲击回车时发送（如果不按 Shift）
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // 阻止默认的回车换行行为
                  e.stopPropagation();

                  handleSendCodeView();
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
                    onChange={(val: string) => handleSwitchModel(val)}
                    options={Object.values(modelList).map((item) => {
                      return {
                        label: (
                          <span style={{ fontSize: "12px" }}>
                            {item?.modelName || ""}
                          </span>
                        ),
                        value: item?.id || "",
                      };
                    })}
                  />
                </Tooltip>

                <Tooltip title="清除审核">
                  <Button
                    onClick={handleClearCodeView}
                    shape="circle"
                    icon={<ClearOutlined />}
                  />
                </Tooltip>
              </div>

              <div>
                {streamStatus === 0 || streamStatus === 2 ? (
                  <Button
                    disabled={!textValue.trim() && !operateHash?.hash}
                    type="primary"
                    icon={<SendOutlined />}
                    className="rounded-full"
                    onClick={handleSendCodeView}
                  >
                    审核
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    className="rounded-full"
                    onClick={handleStopAiReview}
                  >
                    终止
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeView;
