import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiGitBranch,
  FiFile,
  FiCpu,
  FiClock,
  FiUpload,
  FiAlertTriangle,
  FiActivity,
} from "react-icons/fi";

const navItems = [
  { path: "/", icon: <FiHome />, label: "Dashboard" },
  { path: "/import", icon: <FiUpload />, label: "Import Repo" },
  { path: "/graph", icon: <FiGitBranch />, label: "Graph Viewer" },
  { path: "/files", icon: <FiFile />, label: "File Inspector" },
  { path: "/analysis", icon: <FiActivity />, label: "Analysis" },
  { path: "/deadcode", icon: <FiAlertTriangle />, label: "Dead Code" },
  { path: "/ai", icon: <FiCpu />, label: "AI Assistant" },
  { path: "/history", icon: <FiClock />, label: "History" },
];

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">Navigation</div>
      <ul className="sidebar-list">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;