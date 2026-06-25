import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiCode,
  FiPlus,
  FiGitBranch,
  FiBell,
  FiGithub,
  FiSun,
  FiMoon,
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications] = useState(0);

  // Get current page title
  const getPageTitle = () => {
    const routes = {
      "/": "Dashboard",
      "/import": "Import Repository",
      "/graph": "Dependency Graph",
      "/files": "File Inspector",
      "/analysis": "Analysis",
      "/deadcode": "Dead Code Detection",
      "/ai": "AI Assistant",
      "/history": "History",
    };
    return routes[location.pathname] || "CodeAtlas";
  };

  return (
    <nav className="navbar">
      {/* ── Left: Logo ── */}
      <div className="navbar-left">
        <div
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="navbar-logo-icon">
            <FiCode />
          </div>
          <span className="navbar-logo-text">
            Code<span>Atlas</span>
          </span>
        </div>

        <div className="navbar-divider" />

        <div className="navbar-page-title">{getPageTitle()}</div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="navbar-right">
        {/* Quick Import Button */}
        <button
          className="navbar-action-btn primary"
          onClick={() => navigate("/import")}
        >
          <FiPlus /> Import Repo
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-icon-btn"
          title="GitHub"
        >
          <FiGithub />
        </a>

        {/* Version Badge */}
        <div className="navbar-version">v1.0.0</div>
      </div>
    </nav>
  );
};

export default Navbar;