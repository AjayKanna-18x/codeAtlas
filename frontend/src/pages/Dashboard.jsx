import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGitBranch,
  FiFile,
  FiCpu,
  FiAlertTriangle,
  FiPlus,
  FiUpload,
  FiClock,
  FiGrid,
  FiCode,
  FiEye,
} from "react-icons/fi";

// ─── Mock Data (will be replaced with API data later) ─────
const mockStats = [
  {
    label: "Repositories Analyzed",
    value: 0,
    icon: <FiGitBranch />,
    footer: "No repositories yet",
  },
  {
    label: "Files Discovered",
    value: 0,
    icon: <FiFile />,
    footer: "Import a repo to start",
  },
  {
    label: "Dependencies Mapped",
    value: 0,
    icon: <FiCpu />,
    footer: "Graph data pending",
  },
  {
    label: "Dead Code Detected",
    value: 0,
    icon: <FiAlertTriangle />,
    footer: "Analysis pending",
  },
];

const quickActions = [
  {
    icon: <FiPlus />,
    title: "Import GitHub Repo",
    desc: "Paste a GitHub URL to analyze",
    path: "/import",
  },
  {
    icon: <FiUpload />,
    title: "Upload Local Project",
    desc: "Analyze a local JS project",
    path: "/import",
  },
  {
    icon: <FiGitBranch />,
    title: "View Dependency Graph",
    desc: "Explore visual code map",
    path: "/graph",
  },
  {
    icon: <FiCpu />,
    title: "AI Code Assistant",
    desc: "Get AI-powered explanations",
    path: "/ai",
  },
];

// ─── Dashboard Component ──────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [repositories] = useState([]); // Will connect to API later

  return (
    <div className="dashboard-wrapper">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-banner-left">
          <h1>
            Welcome to <span>CodeAtlas</span>
          </h1>
          <p>
            Intelligent Codebase Exploration and Architecture Analysis Platform.
            <br />
            Import a JavaScript repository to get started.
          </p>
        </div>
        <div className="welcome-banner-right">
          <button
            className="btn-secondary"
            onClick={() => navigate("/history")}
          >
            <FiClock /> View History
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/import")}
          >
            <FiPlus /> Import Repository
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <div className="section-title">
          <FiGrid /> Platform <span>Statistics</span>
        </div>
        <div className="stats-grid">
          {mockStats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className="stat-card-top">
                <span className="stat-card-label">{stat.label}</span>
                <span className="stat-card-icon">{stat.icon}</span>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-footer">{stat.footer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="section-title">
          <FiCode /> Quick <span>Actions</span>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              className="action-card"
              key={index}
              onClick={() => navigate(action.path)}
            >
              <div className="action-card-icon">{action.icon}</div>
              <div className="action-card-title">{action.title}</div>
              <div className="action-card-desc">{action.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Repositories ── */}
      <div>
        <div className="section-title">
          <FiEye /> Recent <span>Repositories</span>
        </div>

        {repositories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiGitBranch />
            </div>
            <div className="empty-state-title">No Repositories Yet</div>
            <div className="empty-state-subtitle">
              Import a GitHub repository or upload a local project to start
              exploring your codebase.
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate("/import")}
            >
              <FiPlus /> Import Your First Repository
            </button>
          </div>
        ) : (
          <div className="recent-repos-grid">
            {repositories.map((repo, index) => (
              <div
                className="repo-card"
                key={index}
                onClick={() => navigate(`/graph/${repo._id}`)}
              >
                <div className="repo-card-header">
                  <span className="repo-card-name">{repo.name}</span>
                  <span className={`repo-card-status status-${repo.status}`}>
                    {repo.status}
                  </span>
                </div>
                <div className="repo-card-meta">
                  <span>👤 {repo.owner}</span>
                  <span>📅 {new Date(repo.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="repo-card-stats">
                  <span className="repo-stat">
                    <FiFile /> {repo.stats?.jsFiles || 0} files
                  </span>
                  <span className="repo-stat">
                    <FiGitBranch /> {repo.stats?.totalDependencies || 0} deps
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;