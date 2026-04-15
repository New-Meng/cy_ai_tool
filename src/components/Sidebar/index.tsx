import React, { useEffect } from "react";
import styles from "./index.module.css";
import { useLocation } from "react-router-dom";

type MenuItemType = {
  key: MenuKey;
  label: string;
};
export type MenuKey = "/chat" | "/setting" | "/codeView" | "/viewHistory";
const MenuList: MenuItemType[] = [
  {
    key: "/chat",
    label: "聊天",
  },

  {
    key: "/codeView",
    label: "代码视图",
  },
  {
    key: "/viewHistory",
    label: "历史审查",
  },
  {
    key: "/setting",
    label: "设置",
  },
];

interface SidebarProps {
  activeMenu: MenuKey;
  onMenuChange: (key: MenuKey) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const location = useLocation();
  useEffect(() => {
    console.log(location.pathname);
    onMenuChange(location.pathname as MenuKey);
  }, [location.pathname]);

  return (
    <aside className={styles.sidebar}>
      {MenuList.map((item) => {
        return (
          <button
            key={item.key}
            className={`${styles["menu-item"]} ${
              activeMenu === item.key ? styles["menu-item-active"] : ""
            }`}
            onClick={() => onMenuChange(item.key)}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
