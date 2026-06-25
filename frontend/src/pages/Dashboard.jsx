import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGitBranch,
  FiFile,
  FiShare2,
  FiAlertTriangle,
  FiPlus,
  FiRefreshCw,
  FiActivity,
  FiCpu,
  FiCode,
  FiGrid,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useRepository from "../hooks/useRepository";
import useStats from "../hooks/useStats";
import RepoCard from "../components/common/RepoCard";
import ProgressBar from "../components/common/ProgressBar";
import { deleteRepository } from "../services/apiService";

// ─── Activity Feed Item ───────────────────────────────────
const ActivityItem = ({ repo }) => {
  const statusIcons = {
    completed: <FiCheckCircle style={{ color: "#22c55e" }} />,
    pending: <FiClock style={{ color: "#eab308" }} />,
    analyzing: <FiActivity style={{ color: "#6366f1" }} />,
    failed: <FiAlertTriangle style={{ color: "#ef4444" }} />,
  };

  return (
    <div className="activity-item">
      <div className="activity-icon">
        {statusIcons[repo.status] || statusIcons.pending}
      </div>
      <div className="activity-content">
        <div className="activity-title">
          {repo.owner}/{repo.name}
        </div>
        <div className="activity-meta">
          {repo.status === "completed"
            ? `${repo.stats?.jsFiles || 0} files · ${
                repo.stats?.totalDependencies || 0
              } deps`
            : repo.status}
          {" · "}
          {new Date(repo.updatedAt || repo.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className={`activity-status status-${repo.status}`}>
        {repo.status}
      </div>
    </div>
  );
};

// ─── Dashboard Component ──────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { repositories, loading, analyzing, fetchRepositories, analyze } =
    useRepository();
  const { stats, fetchStats } = useStats();
  const [deletingId, setDeletingId] = useState(null);

  // ── Handle delete ──
  const handleDelete = async (repoId) => {
    if (!window.confirm("Delete this repository?")) return;
    setDeletingId(repoId);
    toast.loading("Deleting...", { id: "delete" });
    try {
      await deleteRepository(repoId);
      toast.success("Deleted successfully.", { id: "delete" });
      await fetchRepositories();
      await fetchStats();
    } catch {
      toast.error("Failed to delete.", { id: "delete" });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handle analyze ──
  const handleAnalyze = async (repoId) => {
    await analyze(repoId);
    await fetchStats();
  };

  // ── Completion rate ──
  const completionRate =
    stats.totalRepos > 0
      ? Math.round((stats.completedRepos / stats.totalRepos) * 100)
      : 0;

  return (
    <div className="dashboard-wrapper">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-banner-left">
          <div className="welcome-badge">
            <FiCode /> Intelligent Codebase Platform
          </div>
          <h1>
            Welcome to <span>CodeAtlas</span>
          </h1>
          <p>
            {repositories.length === 0
              ? "Import your first JavaScript repository to start analyzing architecture and dependencies."
              : `Analyzing ${stats.totalRepos} repositor${
                  stats.totalRepos === 1 ? "y" : "ies"
                } — ${stats.totalFiles.toLocaleString()} files mapped.`}
          </p>
          <div className="welcome-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/import")}
            >
              <FiPlus /> Import Repository
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/graph")}
            >
              <FiGitBranch /> View Graphs
            </button>
          </div>
        </div>
        <div className="welcome-banner-visual">
          <div className="welcome-visual-grid">
            {[
              { label: "Files", value: stats.totalFiles.toLocaleString(), color: "#6366f1" },
              { label: "Deps", value: stats.totalDependencies.toLocaleString(), color: "#22c55e" },
              { label: "Lines", value: stats.totalLines.toLocaleString(), color: "#06b6d4" },
              { label: "Dead", value: stats.totalDeadCode, color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="welcome-visual-card">
                <div
                  className="welcome-visual-value"
                  style={{ color: item.color }}
                >
                  {item.value}
                </div>
                <div className="welcome-visual-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="dashboard-main-grid">

        {/* ── Left Column ── */}
        <div className="dashboard-left">

          {/* Stats Cards */}
          <div>
            <div className="section-title">
              <FiGrid /> Platform <span>Overview</span>
            </div>
            <div className="stats-grid">
              {[
                {
                  label: "Repositories",
                  value: stats.totalRepos,
                  icon: <FiGitBranch />,
                  color: "#6366f1",
                  sub: `${stats.completedRepos} completed`,
                  path: "/history",
                },
                {
                  label: "JS Files",
                  value: stats.totalFiles.toLocaleString(),
                  icon: <FiFile />,
                  color: "#22c55e",
                  sub: "Across all repos",
                  path: "/files",
                },
                {
                  label: "Dependencies",
                  value: stats.totalDependencies.toLocaleString(),
                  icon: <FiShare2 />,
                  color: "#06b6d4",
                  sub: "Total imports mapped",
                  path: "/graph",
                },
                {
                  label: "Dead Code",
                  value: stats.totalDeadCode,
                  icon: <FiAlertTriangle />,
                  color: "#ef4444",
                  sub: "Unused files",
                  path: "/deadcode",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="stat-card"
                  onClick={() => navigate(stat.path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="stat-card-top">
                    <span className="stat-card-label">{stat.label}</span>
                    <span
                      className="stat-card-icon"
                      style={{ color: stat.color }}
                    >
                      {stat.icon}
                    </span>
                  </div>
                  <div
                    className="stat-card-value"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="stat-card-footer">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-title">
              <FiCode /> Quick <span>Actions</span>
            </div>
            <div className="quick-actions-grid">
              {[
                {
                  icon: <FiPlus />,
                  title: "Import GitHub Repo",
                  desc: "Analyze a new repository",
                  path: "/import",
                  color: "#6366f1",
                },
                {
                  icon: <FiGitBranch />,
                  title: "Dependency Graph",
                  desc: "Visual code map",
                  path: "/graph",
                  color: "#22c55e",
                },
                {
                  icon: <FiAlertTriangle />,
                  title: "Dead Code",
                  desc: "Find unused files",
                  path: "/deadcode",
                  color: "#ef4444",
                },
                {
                  icon: <FiCpu />,
                  title: "AI Assistant",
                  desc: "AI-powered insights",
                  path: "/ai",
                  color: "#06b6d4",
                },
              ].map((action, i) => (
                <div
                  key={i}
                  className="action-card"
                  onClick={() => navigate(action.path)}
                >
                  <div
                    className="action-card-icon"
                    style={{ color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div className="action-card-title">
                    {action.title}
                  </div>
                  <div className="action-card-desc">{action.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Repositories */}
          <div>
            <div className="section-title">
              <FiActivity /> Recent <span>Repositories</span>
              {repositories.length > 3 && (
                <button
                  className="section-view-all"
                  onClick={() => navigate("/history")}
                >
                  View All <FiArrowRight />
                </button>
              )}
            </div>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                }}
              >
                <div className="loader" />
              </div>
            ) : repositories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiGitBranch />
                </div>
                <div className="empty-state-title">
                  No Repositories Yet
                </div>
                <div className="empty-state-subtitle">
                  Import your first GitHub repository to get started.
                </div>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/import")}
                >
                  <FiPlus /> Import Repository
                </button>
              </div>
            ) : (
              <div className="recent-repos-grid">
                {repositories.slice(0, 3).map((repo) => (
                  <RepoCard
                    key={repo._id}
                    repo={repo}
                    onAnalyze={handleAnalyze}
                    onDelete={handleDelete}
                    analyzing={analyzing}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="dashboard-right">

          {/* Platform Health */}
          <div className="dashboard-widget">
            <div className="widget-title">
              <FiTrendingUp /> Platform Health
            </div>
            <div className="health-stats">
              <ProgressBar
                value={stats.completedRepos}
                max={Math.max(stats.totalRepos, 1)}
                color="#22c55e"
                height={8}
                showLabel={true}
                label="Analysis Completion"
              />
              <ProgressBar
                value={stats.totalDeadCode}
                max={Math.max(stats.totalFiles, 1)}
                color="#ef4444"
                height={8}
                showLabel={true}
                label="Dead Code Ratio"
              />
              <ProgressBar
                value={stats.totalDependencies}
                max={Math.max(stats.totalFiles * 3, 1)}
                color="#06b6d4"
                height={8}
                showLabel={true}
                label="Dependency Density"
              />
            </div>
            <div className="health-summary">
              <div className="health-item">
                <FiCheckCircle style={{ color: "#22c55e" }} />
                <span>{stats.completedRepos} repos analyzed</span>
              </div>
              <div className="health-item">
                <FiClock style={{ color: "#eab308" }} />
                <span>{stats.pendingRepos} repos pending</span>
              </div>
              <div className="health-item">
                <FiAlertTriangle style={{ color: "#ef4444" }} />
                <span>{stats.failedRepos} repos failed</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="dashboard-widget">
            <div className="widget-title">
              <FiActivity /> Recent Activity
              <button
                className="widget-refresh"
                onClick={() => {
                  fetchRepositories();
                  fetchStats();
                }}
              >
                <FiRefreshCw />
              </button>
            </div>
            <div className="activity-feed">
              {repositories.length === 0 ? (
                <div className="activity-empty">
                  No activity yet. Import a repository to start.
                </div>
              ) : (
                repositories
                  .slice(0, 8)
                  .map((repo) => (
                    <ActivityItem key={repo._id} repo={repo} />
                  ))
              )}
            </div>
          </div>

          {/* Platform Info */}
          <div className="dashboard-widget">
            <div className="widget-title">
              <FiCode /> About CodeAtlas
            </div>
            <div className="about-content">
              <p>
                CodeAtlas is an intelligent codebase exploration platform
                that helps developers understand JavaScript repositories
                through visual dependency graphs, static analysis, and
                AI-powered explanations.
              </p>
              <div className="about-features">
                {[
                  "AST-based dependency analysis",
                  "Interactive graph visualization",
                  "Dead code detection",
                  "AI code explanations",
                  "Architecture pattern detection",
                ].map((feature, i) => (
                  <div key={i} className="about-feature">
                    <FiCheckCircle style={{ color: "#22c55e" }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;