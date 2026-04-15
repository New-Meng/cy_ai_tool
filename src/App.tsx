import { useState } from "react";
import TitleBar from "./components/titleBar";
import Sidebar, { MenuKey } from "./components/Sidebar";
import "./App.css";

import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import ChatHome from "./page/chatHome";
import Setting from "./page/setting";
import CodeView from "./page/codeView";
import ViewHistory from "./page/viewHistory";

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

// 主内容区域
const AppContent = () => {
  // 用菜单状态模拟二级路由切换，避免额外引入路由依赖
  const [activeMenu, setActiveMenu] = useState<MenuKey>("/chat");
  const navigate = useNavigate();
  const onMenuChange = (key: MenuKey) => {
    setActiveMenu(key);
    navigate(key);
  };

  return (
    <div className="app-root">
      <TitleBar />
      <main className="app-layout">
        <Sidebar activeMenu={activeMenu} onMenuChange={onMenuChange} />
        <section className="app-content">
          <Routes>
            <Route path="/" element={<ChatHome />} />
            <Route path="/chat" element={<ChatHome />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/codeView" element={<CodeView />} />
            <Route path="/viewHistory" element={<ViewHistory />} />
          </Routes>
        </section>
      </main>
      <footer className="app-footer">
        <div>联系方式： 3095702713@qq.com</div>
      </footer>
    </div>
  );
};

export default App;
