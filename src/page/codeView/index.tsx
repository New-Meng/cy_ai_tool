import { Button, Popconfirm, message } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import styles from "../chatHome/index.module.css";
import type { ProjectItem } from "../../../electron/dto/codeViewDto";

const CodeView = () => {
  const [messageApi, messageContext] = message.useMessage({
    top: 60,
    maxCount: 3,
  });
  // 模拟项目列表数据
  const [projectList, setProjectList] = useState<ProjectItem[]>([]);

  const [activeProjectId, setActiveProjectId] = useState<number>(0);

  const initList = async () => {
    const res = await window.ipcRenderer.invoke("getProjectList");
    console.log(res.data, "++??resdata");
    if (res.success) {
      setProjectList(res.data);
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
    const res = await window.ipcRenderer.invoke("getProjectHashList", {
      path: item.projectPath,
    });
    console.log(res, "++??res");
    if (res.success) {
      messageApi.success("切换成功");

      setActiveProjectId(item.id);
    } else {
      messageApi.error(res.message.message ? res.message.message : res.message);
    }
  };

  useEffect(() => {
    initList();
  }, []);

  return (
    <>
      {messageContext}
      <div className="w-full h-full flex justify-between items-center">
        <div className="w-[220px] h-full border-r border-[#e8e8e8] rounded-xl bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-[#f0f0f0] font-bold text-[#333]">
            项目列表
          </div>
          <div
            className={`w-full flex-1 overflow-y-auto p-2 flex flex-col gap-1 ${styles["custom-scrollbar"]}`}
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
        <div className="flex-1 h-full bg-white ml-2 rounded-xl shadow-sm border border-[#e8e8e8]">
          {/* 右侧内容区 */}
        </div>
      </div>
    </>
  );
};

export default CodeView;
