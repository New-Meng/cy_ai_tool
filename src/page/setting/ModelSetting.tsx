import { Button } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import SettingItem from "./components/SettingItem";
import { Modal, message } from "antd";
import { InterfaceModalRef } from "./components/AddModal";
import AddModal from "./components/AddModal";
import { useRef, useEffect, useState } from "react";
import { ModelItemInterace } from "../../../electron/payloadByMainController/settingController";

const ModelSetting: React.FC<{ curTab: string }> = ({ curTab }) => {
  const addModalRef = useRef<InterfaceModalRef>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContext] = message.useMessage({
    top: 60,
    maxCount: 3,
  });
  const [list, setList] = useState<ModelItemInterace[]>([]);

  const handleDeleteModelItem = (modelName: string) => {
    console.log("删除模型", modelName);
    modal.confirm({
      title: "确认删除该模型吗？",
      okText: "确认",
      okType: "danger",
      onOk: () => {
        // 确认删除模型
        window.ipcRenderer.invoke("delete-model-item", modelName);
        messageApi.success("删除模型成功");
        initModelList();
      },
      onCancel: () => {
        // 取消删除模型
      },
    });
  };

  const handleAddModel = async () => {
    try {
      const res = await addModalRef.current?.open();
      console.log(res, "++??res");
      if (res) {
        initModelList();
      }
    } catch (error) {
      console.log(error, "++??error");
    }
  };

  const handleEditModal = async (modelName: string) => {
    try {
      const res = await addModalRef.current?.open(modelName);
      console.log(res, "++??res");
      initModelList();
    } catch (error) {
      console.log(error, "++??error");
    }
  };

  // const quickRemoveValidate = async (item: ModelItemInterace) => {
  //   try {
  //     const res = await window.ipcRenderer.invoke("validate-model-item", item);
  //     console.log(res, "++??res");
  //     if (res.success) {
  //       messageApi.success("当前模型可以正常使用");
  //       initModelList();
  //     } else {
  //       throw new Error(res.message);
  //     }
  //   } catch (error) {
  //     console.log(error, "++??error");
  //     messageApi.error("当前模型无法正常使用");
  //   }
  // };

  const initModelList = async () => {
    const res = await window.ipcRenderer.invoke("get-model-list");
    console.log(res, "++??");
    setList(res.data || []);
  };

  useEffect(() => {
    if (curTab === "2") {
      initModelList();
    }
  }, [curTab]);

  return (
    <>
      <div className="w-full py-2">
        {contextHolder}
        {messageContext}
        {/* 大分组 */}
        <div className="w-full">
          <div>模型列表</div>

          {list?.map((item, index) => (
            <div className="w-full my-3" key={index}>
              <SettingItem
                mode="model"
                key={item.modelName}
                labelText={item.modelName}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex justify-between items-center gap-2">
                    {/* 大部分ai api 还是提供了余额查询的，后面看到了再优化一下 */}
                    {/* <div className="text-nowrap flex items-center justify-center gap-2">
                    余额：10$
                    <Button
                      type="primary"
                      size="small"
                      icon={<InteractionOutlined />}
                    ></Button>
                  </div> */}

                    <Button
                      onClick={() => handleEditModal(item.modelName)}
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                    ></Button>
                    <Button
                      onClick={() => handleDeleteModelItem(item.modelName)}
                      type="primary"
                      size="small"
                      icon={<DeleteOutlined />}
                    ></Button>
                  </div>
                </div>
              </SettingItem>
            </div>
          ))}
        </div>

        <div className="w-full flex justify-center items-center mt-5">
          <Button type="primary" onClick={handleAddModel}>
            添加模型
          </Button>
        </div>
      </div>
      <AddModal ref={addModalRef} />
    </>
  );
};
export default ModelSetting;
