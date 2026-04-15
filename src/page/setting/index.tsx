import { useState } from "react";
import GroupTabs from "./components/GroupTabs";
import ModelSetting from "./ModelSetting";
import BaseSetting from "./BaseSetting";
import OtherSetting from "./OtherSetting";

const Setting = () => {
  const [curTabs, setCurTabs] = useState("1");
  const onTabsChange = (val: string) => {
    setCurTabs(val);
  };
  return (
    <div className="w-full h-full flex justify-start items-start flex-col">
      <GroupTabs className="mb-2" curTabs={curTabs} onChange={onTabsChange} />
      <div className="w-full p-2 overflow-y-auto">
        {/* future: 需要改一下，不能每次都请求基础信息 */}
        {curTabs == "1" && <BaseSetting curTab={curTabs}></BaseSetting>}
        {curTabs == "2" && <ModelSetting curTab={curTabs} />}
        {curTabs == "3" && <OtherSetting curTab={curTabs} />}
      </div>
    </div>
  );
};

export default Setting;
