import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ChatMessageEntity } from "../../../electron/typeorm/entity/ChatMessageEntity";
import { ResultRtType } from "../../../electron/utils";

type HistoryMessageListProps = {
  changeChatMessageHistory: (item: { name: string; message: string }) => void;
  handleCreateNewChat: () => void;
  className?: string;
};

export type HistoryMessageListRef = {
  initHistoryList: () => void;
};

const HistoryMessageList = forwardRef<
  HistoryMessageListRef,
  HistoryMessageListProps
>(({ changeChatMessageHistory, handleCreateNewChat, className }, ref) => {
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
    changeChatMessageHistory(item);
  };

  const handleDeleteItemChat = async (
    item: ChatMessageEntity & { sessionId: string },
  ) => {
    console.log(item, "++??item");
    const res = await window.ipcRenderer.invoke(
      "deleteChatMessageHistory",
      item.sessionId,
    );
    if (res.success) {
      messageApi.success("删除成功");
      initHistoryList();
      handleCreateNewChat();
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
      <div className="w-[180px] h-full relative">
        <div
          className={`box-border p-2 w-[180px] h-full flex flex-col justify-between items-center bg-[#fcf0ff] rounded-md ${className || ""}`}
        >
          <div className="w-full h-[calc(100% - 100px)] flex flex-col justify-start items-center bg-[#fcf0ff] rounded-md">
            {messageHistoryList.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => changeHistoryChat(item)}
                  className="px-1 py-1 w-full flex justify-between items-center cursor-pointer rounded-md hover:bg-[#e5d0d0]"
                >
                  <div className="text-ellipsis flex-nowrap text-nowrap overflow-hidden whitespace-nowrap">
                    {item.name}
                  </div>
                  <div
                    className="cursor-pointer text-primary-1"
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
                      <CloseCircleOutlined className="cursor-pointer rounded-full hover:bg-white" />
                    </Popconfirm>
                  </div>
                </div>
              );
            })}

            {messageHistoryList.length == 0 ? (
              <div className="text-center text-[#999]">暂无会话</div>
            ) : null}
          </div>

          <div className="w-full h-[35px] flex justify-center items-center">
            <Button type="primary" onClick={handleCreateNewChat}>
              <PlusOutlined className="mr-1" />
              新建对话
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

export default HistoryMessageList;
