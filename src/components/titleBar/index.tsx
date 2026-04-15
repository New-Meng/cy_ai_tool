import React from "react";

import styles from "./index.module.css";
import { Modal } from "antd";
// import { rendererAppController } from "../../../electron/payloadModal/appController";

const TitleBar: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal();
  const onCloseApp = async () => {
    const baseConfig = await window.ipcRenderer.invoke("get-base-setting");
    console.log(baseConfig);
    if (baseConfig.data.isWinCloseMin) {
      window.ipcRenderer.send("hide-app");
      return;
    } else {
      modal.confirm({
        title: "确认关闭应用吗？",
        okText: "确认",
        okType: "danger",
        onOk: () => {
          window.ipcRenderer.send("close-app");
        },
        onCancel: () => {
          // 取消关闭应用
        },
      });
    }
  };

  const onMiniMizeApp = () => {
    window.ipcRenderer.send("minimize-app");
  };

  const onMaximizeApp = () => {
    window.ipcRenderer.send("maximize-app");
  };

  return (
    <>
      {contextHolder}
      <div className={styles["title-bar"]}>
        <div className={styles["title"]}>CodingReveiw</div>
        <div className={styles["window-controls"]}>
          <div
            onClick={onMiniMizeApp}
            id="minimize-btn"
            className={styles["window-control-btn"]}
          >
            -
          </div>
          <div
            onClick={onMaximizeApp}
            id="maximize-btn"
            className={styles["window-control-btn"]}
          >
            □
          </div>
          <div
            id="close-btn"
            onClick={onCloseApp}
            className={styles["window-control-btn"]}
          >
            ×
          </div>
        </div>
      </div>

      <div className={styles["title-bar-place"]}></div>
    </>
  );
};
export default TitleBar;
