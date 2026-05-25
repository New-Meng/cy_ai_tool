import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ChatMessageEntity } from "../../../electron/typeorm/entity/ChatMessageEntity";
import { ResultRtType } from "../../../electron/utils";

type HistoryMessageListProps = {
  changeChatMessageHistory: (item: { name: string; message: string }) => void;
  handleCreateNewChat: () => void;
  className?: string;
  sessionId?: string;
  streamStatus?: number;
};

export type HistoryMessageListRef = {
  initHistoryList: () => void;
};

const HistoryMessageList = forwardRef<
  HistoryMessageListRef,
  HistoryMessageListProps
>(
  (
    {
      changeChatMessageHistory,
      handleCreateNewChat,
      className,
      sessionId,
      streamStatus,
    },
    ref,
  ) => {
    const [messageHistoryList, setMessageHistoryList] = useState<
      ChatMessageEntity[]
    >([]);

    const [messageApi, mesageContext] = message.useMessage({
      top: 60,
      maxCount: 3,
    });

    const initHistoryList = async () => {
      const res: ResultRtType<(ChatMessageEntity & { sessionId: string })[]> =
        await window.ipcRenderer.invoke("getChatMessageHistoryList");
      if (res.success) {
        res.data = res.data
          .map((item) => {
            item.message = JSON.parse(item.message);
            if (item.isDelete) {
              return null;
            } else {
              return item;
            }
          })
          .filter((item) => item != null);
        setMessageHistoryList(res.data || []);
        console.log(res, "++??historylist");
      } else {
        messageApi.error(res.message || "获取历史记录失败!");
      }
    };

    const changeHistoryChat = (item: { name: string; message: string }) => {
      if (streamStatus == 1) {
        messageApi.error("请结束当前对话，否则不能切换对话");
        return;
      }
      changeChatMessageHistory(item);
    };

    const handleDeleteItemChat = async (
      item: ChatMessageEntity & { sessionId: string },
    ) => {
      if (streamStatus == 1 && sessionId == item.sessionId) {
        messageApi.error("请结束当前对话，否则不能删除会话");
        return;
      }
      const res = await window.ipcRenderer.invoke(
        "deleteChatMessageHistory",
        item.sessionId,
      );
      if (res.success) {
        messageApi.success("删除成功");
        initHistoryList();
        if (sessionId == item.sessionId) {
          handleCreateNewChat();
        }
      } else {
        messageApi.error(res.message || "删除失败!");
      }
    };

    useEffect(() => {
      initHistoryList();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        initHistoryList: initHistoryList,
      }),
      [],
    );

    return (
      <>
        {mesageContext}
        <div className="w-[180px] h-full relative shrink-0">
          <div
            className={`box-border p-2.5 w-[180px] h-full flex flex-col justify-between items-center gap-3 bg-white border border-primary-1/10 rounded-2xl shadow-sm ${className || ""}`}
          >
            <div className="w-full flex-1 overflow-y-auto flex flex-col justify-start items-center gap-1">
              {messageHistoryList.map((item) => {
                const isActive = sessionId === item.sessionId;
                return (
                  <div
                    key={item.sessionId}
                    onClick={() => changeHistoryChat(item)}
                    className={`group px-2 py-2 w-full flex justify-between items-center cursor-pointer rounded-xl border transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary-1/10 border-primary-1/20 text-primary-1 shadow-sm"
                          : "border-transparent text-[#555] hover:bg-[#f6f1ff] hover:text-[#4b2ca3]"
                      }`}
                  >
                    <div
                      className={`flex-1 min-w-0 text-ellipsis flex-nowrap text-nowrap overflow-hidden whitespace-nowrap text-[13px] ${
                        isActive ? "font-medium" : ""
                      }`}
                    >
                      {item.name}
                    </div>
                    <div
                      className={`ml-2 flex shrink-0 cursor-pointer transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Popconfirm
                        placement="bottom"
                        title="确定删除该会话吗？"
                        okText="确定"
                        cancelText="取消"
                        onConfirm={() => handleDeleteItemChat(item)}
                      >
                        <CloseCircleOutlined className="cursor-pointer rounded-full p-1 text-primary-1 hover:bg-primary-1/10" />
                      </Popconfirm>
                    </div>
                  </div>
                );
              })}

              {messageHistoryList.length == 0 ? (
                <div className="w-full flex-1 min-h-[120px] flex justify-center items-center text-center text-[13px] text-[#999] bg-[#faf7ff] border border-dashed border-primary-1/10 rounded-xl">
                  暂无会话
                </div>
              ) : null}
            </div>

            <div className="w-full pt-2 border-t border-primary-1/10 flex justify-center items-center">
              <Button type="primary" className="w-full" onClick={handleCreateNewChat}>
                <PlusOutlined className="mr-1" />
                新建对话
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default HistoryMessageList;
