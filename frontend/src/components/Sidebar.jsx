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
  FiCode,
  FiShield,
  FiGitCommit,
} from "react-icons/fi";
import useStats from "../hooks/useStats";

const navSections = [
  {
    title: "Main",
    items: [
      { path: "/", icon: <FiHome />, label: "Dashboard" },
      { path: "/import", icon: <FiUpload />, label: "Import Repo" },
      { path: "/history", icon: <FiClock />, label: "History" },
    ],
  },
  {
    title: "Analysis",
    items: [
      { path: "/graph", icon: <FiGitBranch />, label: "Graph Viewer" },
      { path: "/files", icon: <FiFile />, label: "File Inspector" },
      { path: "/analysis", icon: <FiActivity />, label: "Analysis" },
      { path: "/deadcode", icon: <FiAlertTriangle />, label: "Dead Code" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { path: "/ai", icon: <FiCpu />, label: "AI Assistant" },
      { path: "/review", icon: <FiShield />, label: "Code Review" },
      { path: "/evolution", icon: <FiGitCommit />, label: "Evolution" },
    ],
  },
];

const Sidebar = () => {
  const { stats } = useStats();

  return (
    <aside className="sidebar">
      {/* ── Nav Sections ── */}
      {navSections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          <ul className="sidebar-list">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ── Bottom Stats ── */}
      <div className="sidebar-stats">
        <div className="sidebar-stats-title">Platform Stats</div>
        <div className="sidebar-stat-row">
          <span>Repositories</span>
          <span className="sidebar-stat-value">
            {stats.totalRepos}
          </span>
        </div>
        <div className="sidebar-stat-row">
          <span>Files Analyzed</span>
          <span className="sidebar-stat-value">
            {stats.totalFiles.toLocaleString()}
          </span>
        </div>
        <div className="sidebar-stat-row">
          <span>Dependencies</span>
          <span className="sidebar-stat-value">
            {stats.totalDependencies.toLocaleString()}
          </span>
        </div>
        <div className="sidebar-stat-row">
          <span>Dead Files</span>
          <span
            className="sidebar-stat-value"
            style={{ color: "var(--accent-red)" }}
          >
            {stats.totalDeadCode}
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-logo">
          <FiCode />
          <span>CodeAtlas v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;