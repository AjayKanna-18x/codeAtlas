import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiGitBranch,
  FiFile,
  FiCpu,
  FiClock,
} from "react-icons/fi";

const navItems = [
  { path: "/", icon: <FiHome />, label: "Dashboard" },
  { path: "/graph", icon: <FiGitBranch />, label: "Graph Viewer" },
  { path: "/files", icon: <FiFile />, label: "File Inspector" },
  { path: "/ai", icon: <FiCpu />, label: "AI Assistant" },
  { path: "/history", icon: <FiClock />, label: "History" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-secondary min-h-screen border-r border-slate-700 py-6 px-4">
      <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;