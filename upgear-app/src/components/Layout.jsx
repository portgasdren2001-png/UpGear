import { useState } from "react";
import "./Layout.css";

const NAV_ITEMS = [
  { id: "dashboard", icon: "◈", label: "ダッシュボード" },
  { id: "stock",     icon: "◉", label: "ストック" },
  { id: "script",    icon: "▣", label: "制作スタジオ" },
  { id: "posts",     icon: "◫", label: "投稿データ" },
  { id: "master",    icon: "◎", label: "マスター" },
];

export default function Layout({ children, active, onNav }) {
  const [collapsed, setCollapsed] = useState(false);

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
          {!collapsed && <span className="version-tag">v4.6</span>}
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
