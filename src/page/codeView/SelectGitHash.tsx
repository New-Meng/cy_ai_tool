import { Button, Modal, Table, type TableColumnsType } from "antd";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type HashItem = {
  hash: string;
  message: string;
  date: string;
  author: string;
};

const SelectGitHash = forwardRef((props, ref) => {
  const controllerObj = useRef<{
    rev: (val?: unknown) => void;
    rej: () => void;
  }>({
    rev: (val?: unknown) => {
      console.log(val);
    },
    rej: () => {},
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [hashList, setHashList] = useState<HashItem[]>([]);
  const currentProjectPathRef = useRef<string>("");
  const [pageInfo, setPageInfo] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [selectedHash, setSelectedHash] = useState<HashItem>({} as HashItem);
  // 显式声明表格列类型，让 render 回调参数按 HashItem 自动推断
  const columns: TableColumnsType<HashItem> = [
    {
      title: "提交人",
      dataIndex: "author",
      key: "author",
      ellipsis: true,
      render: (_, record) => {
        return <>{record.author}</>;
      },
    },
    {
      title: "提交信息",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (_, record) => {
        return <>{record.message}</>;
      },
    },
    {
      title: "提交时间",
      dataIndex: "date",
      key: "date",
      ellipsis: true,
      render: (_, record) => {
        return <>{record.date}</>;
      },
    },
    {
      title: "hash",
      dataIndex: "hash",
      key: "hash",
      ellipsis: true,
      render: (_, record) => {
        return <>{record.hash}</>;
      },
    },
  ];

  const loadHashList = async (
    nextPageInfo: { page: number; limit: number; total?: number } = pageInfo,
  ) => {
    try {
      setLoading(true);
      const res = await window.ipcRenderer.invoke("getProjectHashList", {
        path: currentProjectPathRef.current,
        limit: nextPageInfo.limit,
        page: nextPageInfo.page,
      });

      if (res.success) {
        setHashList(res.data.data || []);
        setPageInfo({
          ...nextPageInfo,
          total: res.data.total || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectHash = (val: HashItem) => {
    console.log(val);
    setSelectedHash(val);
  };

  const open = (projectPath: string) => {
    return new Promise((resolve, reject) => {
      currentProjectPathRef.current = projectPath;
      setVisible(true);
      setSelectedHash({} as HashItem);
      controllerObj.current.rev = resolve;
      controllerObj.current.rej = reject;
      // 每次打开弹窗时重置到第一页
      const initialPageInfo = {
        page: 1,
        limit: pageInfo.limit,
        total: 0,
      };
      setPageInfo(initialPageInfo);
      loadHashList(initialPageInfo);
    });
  };

  const close = () => {
    setVisible(false);
    setSelectedHash({} as HashItem);
    setHashList([]);
    currentProjectPathRef.current = "";
    controllerObj.current.rej();
    clearController();
  };

  const handlePageChange = (page: number, pageSize: number) => {
    // 切换分页后重新拉取对应页的数据
    const nextPageInfo = {
      page,
      limit: pageSize,
      total: pageInfo.total,
    };
    setPageInfo(nextPageInfo);
    loadHashList(nextPageInfo);
  };

  const onOk = () => {
    controllerObj.current.rev(selectedHash);
    close();
  };

  const clearController = () => {
    setTimeout(() => {
      controllerObj.current = {
        rev: (val?: unknown) => {
          console.log(val);
        },
        rej: () => {},
      };
    }, 200);
  };

  useImperativeHandle(ref, () => ({
    open,
  }));

  return (
    <>
      <Modal
        title="选择提交记录"
        open={visible}
        onCancel={close}
        onOk={onOk}
        width="80vw"
        styles={{
          body: { height: "60vh", overflow: "hidden" },
        }}
        footer={
          <div className="flex justify-end items-center gap-2">
            <Button type="default" onClick={close}>
              取消
            </Button>

            <Button type="primary" onClick={onOk} disabled={!selectedHash.hash}>
              确定
            </Button>
          </div>
        }
      >
        <div className="h-full overflow-hidden">
          <Table<HashItem>
            loading={loading}
            dataSource={hashList}
            columns={columns}
            // 底部分页会占据一部分空间，表格内容区在剩余空间内滚动
            scroll={{ y: "calc(60vh - 120px)" }}
            rowKey={(record) => record.hash}
            pagination={{
              current: pageInfo.page,
              pageSize: pageInfo.limit,
              total: pageInfo.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: handlePageChange,
            }}
            // 根据当前选中的 hash 高亮对应行
            rowClassName={(record) =>
              record.hash === selectedHash.hash ? "bg-[#e6f4ff]" : ""
            }
            onRow={(record) => ({
              className: "cursor-pointer",
              onClick: () => selectHash(record),
            })}
          />
        </div>
      </Modal>
    </>
  );
});

export default SelectGitHash;
