import { useState } from "react";
import "./Layout.css";
import { WorkflowBar, WorkflowProvider, useWorkflow } from "../context/WorkflowContext";

const NAV_ITEMS = [
  { id: "dashboard",     icon: "◈", label: "ダッシュボード" },
  { id: "stock",         icon: "◉", label: "ストック" },
  { id: "understanding", icon: "◍", label: "商品理解" },
  { id: "research",      icon: "◐", label: "市場調査AI" },
  { id: "script",        icon: "▣", label: "制作スタジオ" },
  { id: "posts",         icon: "◫", label: "投稿データ" },
  { id: "master",        icon: "◎", label: "マスター" },
];

function LayoutInner({ children, active, onNav, collapsed, setCollapsed }) {
  const { activeItemId } = useWorkflow();

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => setCollapsed((c) => !c)}>
          <span className="logo-mark">▲</span>
          {!collapsed && <span className="logo-text">UpGear</span>}
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => onNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {!collapsed && <span className="version-tag">v5.0</span>}
        </div>
      </aside>
      {activeItemId && <WorkflowBar activePage={active} onNav={onNav} />}
      <main className={`content${activeItemId ? " workflow-active" : ""}`}>{children}</main>
    </div>
  );
}

export default function Layout({ children, active, onNav }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <WorkflowProvider onNav={onNav}>
      <LayoutInner active={active} onNav={onNav} collapsed={collapsed} setCollapsed={setCollapsed}>
        {children}
      </LayoutInner>
    </WorkflowProvider>
  );
}
