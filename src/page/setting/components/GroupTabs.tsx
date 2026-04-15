import { Tabs } from "antd";
import type { TabsProps } from "antd";

const GroupTabs: React.FC<
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    curTabs: string;
    onChange: (val: string) => void;
  }
> = ({ curTabs, onChange, ...props }) => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "常规设置",
    },
    {
      key: "2",
      label: "模型设置",
    },
    {
      key: "3",
      label: "其它",
    },
  ];

  return (
    <div className="w-full h-[40px]" {...props}>
      <Tabs
        defaultActiveKey="1"
        activeKey={curTabs}
        items={items}
        onChange={onChange}
      />
    </div>
  );
};
export default GroupTabs;
