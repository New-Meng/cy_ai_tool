export const antdThemeConfig = {
  token: {
    colorPrimary: "#722ED1", // 主色 - 深紫
    colorInfo: "#722ED1",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorBgBase: "#f5f5f5",
    colorTextBase: "#000",
    borderRadius: 8, // 稍大圆角，更圆润
  },
  components: {
    Button: {
      colorPrimaryHover: "#9254DE", // 悬停色 - 亮紫
      colorPrimaryActive: "#531DAB", // 激活色 - 深紫
      primaryShadow: "0 2px 0 rgb(114 46 209 / 10%)",
    },
    Menu: {
      itemSelectedBg: "#F9F0FF", // 菜单选中背景 - 浅紫
    },
  },
};
