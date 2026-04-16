import { useEffect, useRef, useState } from "react";
import SettingItem from "./components/SettingItem";
import { Checkbox, Input, InputRef, message } from "antd";
import type { CheckboxProps } from "antd";

type TypeProps = {
  curTab?: string;
};

type TypeShortCupKeyType = {
  openMainWindowShortCutKey: string;
};

const BaseSetting: React.FC<TypeProps> = ({ curTab }) => {
  const inputRef1 = useRef<InputRef>(null);
  const [isWinCloseMin, setIsWinCloseMin] = useState<boolean>(false);
  const [shortcutKeyMap, setShortcutKeyMap] = useState<TypeShortCupKeyType>({
    openMainWindowShortCutKey: "Ctrl+Shift+1",
  });
  const [tempShortCutKey, setTempShortCutKey] = useState<string[]>([]);
  const [allEmpty] = useState("");
  const [messageApi, messageContext] = message.useMessage({
    top: 60,
    maxCount: 3,
  });

  const activateWatchKeyDown = (val: React.KeyboardEvent<HTMLInputElement>) => {
    let value = val.key.toLocaleUpperCase();
    console.log(value, "++??value");

    if (value == "BACKSPACE") {
      setTempShortCutKey([]);
      setShortcutKeyMap({
        openMainWindowShortCutKey: "",
      });
      return;
    } else if (value == "CONTROL") {
      value = "CTRL";
    }

    if (tempShortCutKey.length < 2) {
      if (tempShortCutKey.includes(value)) {
        return;
      } else {
        setTempShortCutKey([...tempShortCutKey, value]);
      }
    } else {
      // 累计三个键位
      if (tempShortCutKey.includes(value)) {
        return;
      }
      const newKeyValue = tempShortCutKey.join(" + ") + " + " + value;

      const tempObj = {
        ...shortcutKeyMap,
        openMainWindowShortCutKey: newKeyValue,
      };
      setShortcutKeyMap(tempObj);
      setTempShortCutKey([]);

      // 更新设置
      window.ipcRenderer
        .invoke("update-shortcut-key", {
          fieldName: "openMainWindowShortCutKey",
          value: tempObj.openMainWindowShortCutKey,
        })
        .then(() => {
          messageApi.success("更新成功");
          inputRef1.current?.blur();
        })
        .catch(() => {
          messageApi.error("更新失败");
        });
    }
  };

  const closeOperateChange: CheckboxProps["onChange"] = async (val) => {
    console.log(val.target.checked);
    setIsWinCloseMin(val.target.checked);
    await window.ipcRenderer.invoke("update-base-setting", {
      fieldName: "isWinCloseMin",
      value: val.target.checked,
    });
  };

  const initBaseInfo = async () => {
    try {
      const result = await window.ipcRenderer.invoke("get-base-setting");
      if (result.success) {
        setIsWinCloseMin(result.data.isWinCloseMin);
        setShortcutKeyMap(result?.data?.shortKeyConfig || {});
      }
    } catch (error) {
      messageApi.error("获取基础信息失败!");
    }
  };

  useEffect(() => {
    if (curTab === "1") {
      initBaseInfo();
    }
  }, [curTab]);
  return (
    <>
      {messageContext}
      <div className="w-full">
        <div className="text-[18px] font-bold">基础设置</div>
        <SettingItem mode="base" labelText="主窗口">
          <Checkbox onChange={closeOperateChange} checked={isWinCloseMin}>
            窗口关闭时最小化到系统托盘
          </Checkbox>
        </SettingItem>

        <SettingItem mode="base" labelText="快捷键">
          <div className="flex items-center">
            <div className="w-[140px] text-[14px]">打开最小化主窗口：</div>
            <div className="w-[200px] text-[14px]">
              <Input
                ref={inputRef1}
                value={
                  tempShortCutKey.length
                    ? allEmpty
                    : shortcutKeyMap.openMainWindowShortCutKey
                }
                placeholder="输入快捷键"
                onKeyDown={activateWatchKeyDown}
              ></Input>
            </div>
          </div>
        </SettingItem>
      </div>
    </>
  );
};

export default BaseSetting;
