import { Button, Modal, Select, Switch, message } from "antd";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Form, Input } from "antd";
import { MODEL_INFO_MAP } from "../../../../constant";

export interface InterfaceModalRef {
  open: (modelName?: string) => Promise<boolean>;
}

const AddModal = forwardRef<InterfaceModalRef, unknown>((_, ref) => {
  {
    const [form] = Form.useForm();
    const [isOpen, setIsOpen] = useState(false);
    const [passValidate, setPassValidate] = useState(false);
    const [modelTypeList, setModelTypeList] = useState<string[]>([]);
    const [propsModelName, setPropsModelName] = useState<string>("");
    const [messageApi, messageContext] = message.useMessage({
      top: 60,
      maxCount: 3,
    });
    const [testLoading, setTestLoading] = useState(false);

    const [rules, setRules] = useState({
      modelName: [{ required: true }],
      modelVender: [{ required: true }],
      apiUrl: [{ required: true }],
      apiKey: [{ required: true }],
      modeType: [{ required: true }],
      eqId: [{ required: true, message: "请输入豆包eqId" }],
    });

    const asyncController = useRef<{
      rev: (type: boolean) => void;
      rej: (type: boolean) => void;
    }>({
      rev: () => {},
      rej: () => {},
    });

    const [isLoading, setIsLoading] = useState(false);

    const modelVender = Form.useWatch("modelVender", form);
    const apiKey = Form.useWatch("apiKey", form);
    const apiUrl = Form.useWatch("apiUrl", form);

    const getTargetModalInfo = async (modelName: string) => {
      if (modelName) {
        const res = await window.ipcRenderer.invoke(
          "get-model-item",
          modelName,
        );
        if (res.success) {
          form.setFieldsValue(res.data);
        }
      }
    };

    const open = (modelName?: string) => {
      return new Promise((rev, rej) => {
        setIsOpen(true);
        setPropsModelName(modelName || "");
        if (modelName) {
          getTargetModalInfo(modelName).then(() => {
            handleValidateLink();
          });
        }

        asyncController.current.rev = rev;
        asyncController.current.rej = rej;
      });
    };

    const onSaveModelItem = async () => {
      // 先校验 - 再保存
      const values = await form.validateFields();
      await handleValidateLink(false, true); // 重新远程校验，防止手贱
      const res = await window.ipcRenderer.invoke("add-model-item", values);
      if (!res.success) {
        throw new Error(res.message);
      }
    };

    const handleOk = async () => {
      setIsLoading(true);
      try {
        await onSaveModelItem();

        asyncController.current.rev(true);
        setIsOpen(false);
        if (propsModelName) {
          messageApi.success("模型编辑成功");
        } else {
          messageApi.success("添加模型成功");
        }

        form.resetFields();
      } catch (error) {
        console.log(error, "++??error");
      } finally {
        setIsLoading(false);
      }
    };
    const handleCancel = () => {
      if (isLoading || testLoading) {
        return;
      }
      setIsOpen(false);
      form.resetFields();
      setModelTypeList([]);
      asyncController.current.rej(false);
    };

    const resetModeTypeOptions = async (url: string) => {
      setModelTypeList([]);
      form.setFieldValue("modeType", undefined);
      const apiKey = form.getFieldValue("apiKey");
      const modelVender = form.getFieldValue("modelVender");

      const modelName =
        Object.values(MODEL_INFO_MAP).filter((item) => {
          return item.id == modelVender;
        })?.[0]?.name || "";

      const res = await window.ipcRenderer.invoke("get-model-type", {
        url,
        apiKey,
        modelName: modelName,
      });
      if (res.success) {
        const filterList = res.data.filter((item: { status: string }) => {
          // 豆包废弃的模型
          return item.status != "Shutdown";
        });
        console.log(filterList, "++??");
        setModelTypeList(
          filterList.map((item: { id: string }) => item.id) || [],
        );
      }
    };

    const modelVenderChange = (val: string) => {
      form.setFieldValue("modelVender", val);
      form.setFieldValue("modelType", "");

      const modelInfo = Object.values(MODEL_INFO_MAP).find(
        (item) => item.id == Number(val),
      );

      form.setFieldValue("apiUrl", modelInfo?.url || "");
    };

    // 可能超时，需要处理一下gemini超市的问题
    const handleValidateLink = async (
      isSuccessMessage: boolean = false,
      isFailMessage: boolean = false,
    ) => {
      const values = await form.getFieldsValue();
      setTestLoading(true);
      try {
        const deepValidate = await window.ipcRenderer.invoke(
          "validate-model-item",
          values,
        );

        if (deepValidate.success) {
          setPassValidate(true);
          setModelTypeList(
            deepValidate.data.map((item: { id: string }) => item.id) || [],
          );

          if (isSuccessMessage) {
            messageApi.success("校验通过");
          }
          setTestLoading(false);
        } else {
          setTestLoading(false);
          throw new Error(deepValidate.message);
        }
      } catch (error) {
        if (isFailMessage) {
          messageApi.error(
            error instanceof Error ? error.message : String(error),
          );

          setPassValidate(false);
        }
        setTestLoading(false);

        throw new Error(error instanceof Error ? error.message : String(error));
      }
    };

    const disabledModelType = useMemo(() => {
      const formData = form.getFieldsValue();
      // 链接测试通过后，才能调用api
      if (
        formData.modelVender &&
        formData.apiKey &&
        formData.apiUrl &&
        passValidate
      ) {
        return false;
      } else {
        return true;
      }
    }, [modelVender, apiKey, apiUrl, passValidate]);

    useEffect(() => {
      if (!open) {
        form.resetFields();
        asyncController.current = {
          rev: () => {},
          rej: () => {},
        };
      }
    }, [isOpen]);

    useEffect(() => {
      setRules((preRules) => {
        // 豆包验证规则
        console.log("ruleschange", preRules);
        if (modelVender === MODEL_INFO_MAP.DOUBAO.id) {
          return {
            ...preRules,
            eqId: [{ required: true, message: "请输入豆包eqId" }],
          };
        }
        return {
          ...preRules,
          eqId: [],
        };
      });
    }, [modelVender]);

    useImperativeHandle(ref, () => ({
      open: (modelName?: string) => open(modelName) as Promise<boolean>,
    }));

    return (
      <>
        {messageContext}
        <Modal
          title="填写模型信息"
          closable={{ "aria-label": "Custom Close Button" }}
          open={isOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={isLoading}
          okButtonProps={{
            disabled: passValidate && !testLoading ? false : true,
          }}
        >
          <Form
            style={{ marginTop: 20 }}
            labelAlign="right"
            labelCol={{ span: 6 }}
            layout={"horizontal"}
            form={form}
            initialValues={{ layout: "horizontal" }}
          >
            <Form.Item name="id" hidden></Form.Item>
            <Form.Item
              label="自定义名称"
              name="modelName"
              rules={rules.modelName}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              label="模型厂家"
              name="modelVender"
              rules={rules.modelVender}
            >
              <Select
                onChange={modelVenderChange}
                options={Object.values(MODEL_INFO_MAP).map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="API地址" name="apiUrl" rules={rules.apiUrl}>
              <Input placeholder="请输入API地址" />
            </Form.Item>

            {modelVender === MODEL_INFO_MAP.DOUBAO.id && (
              <Form.Item
                className="flex-1"
                label="eqId"
                name="eqId"
                rules={rules?.eqId}
              >
                <Input placeholder="请输入豆包eqId" />
              </Form.Item>
            )}

            <div className="flex justify-between gap-3">
              <Form.Item
                className="flex-1"
                label="私人密钥Key"
                labelCol={{ span: 8 }}
                name="apiKey"
                rules={rules.apiKey}
              >
                <Input placeholder="请输入API_KEY" />
              </Form.Item>

              <Button
                type="primary"
                loading={testLoading}
                onClick={() => handleValidateLink(true, true)}
              >
                测试连接
              </Button>
            </div>

            <Form.Item
              label="选择模型版本"
              name="modeType"
              rules={rules.modeType}
            >
              <Select
                showSearch={{
                  filterOption: (input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                }}
                disabled={disabledModelType}
                onFocus={() => {
                  const url = form.getFieldValue("apiUrl");
                  resetModeTypeOptions(url);
                }}
                notFoundContent={
                  <>
                    <div className="w-full h-[120px] flex items-center justify-center">
                      无模型
                    </div>
                  </>
                }
                options={modelTypeList.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </Form.Item>

            <Form.Item label="是否设为默认模型" name="defaultModel">
              <Switch
                style={{ marginLeft: "10px" }}
                checkedChildren="是"
                unCheckedChildren="否"
                active-value="true"
                inactive-value="false"
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
});

export default AddModal;
