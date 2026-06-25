import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGitBranch,
  FiFile,
  FiShare2,
  FiAlertTriangle,
  FiPlus,
  FiClock,
  FiGrid,
  FiCode,
  FiActivity,
  FiCpu,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import useRepository from "../hooks/useRepository";
import StatCard from "../components/common/StatCard";
import RepoCard from "../components/common/RepoCard";
import { deleteRepository } from "../services/apiService";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    repositories,
    loading,
    analyzing,
    fetchRepositories,
    analyze,
  } = useRepository();

  const [deletingId, setDeletingId] = useState(null);

  // ── Calculate platform stats ──
  const platformStats = {
    totalRepos: repositories.length,
    totalFiles: repositories.reduce(
      (sum, r) => sum + (r.stats?.jsFiles || 0), 0
    ),
    totalDeps: repositories.reduce(
      (sum, r) => sum + (r.stats?.totalDependencies || 0), 0
    ),
    totalDeadCode: repositories.reduce(
      (sum, r) => sum + (r.stats?.deadCodeFiles || 0), 0
    ),
  };

  // ── Handle delete ──
  const handleDelete = async (repoId) => {
    if (!window.confirm("Delete this repository and all its data?")) return;

    setDeletingId(repoId);
    toast.loading("Deleting repository...", { id: "delete" });

    try {
      await deleteRepository(repoId);
      toast.success("Repository deleted successfully.", { id: "delete" });
      await fetchRepositories();
    } catch (error) {
      toast.error("Failed to delete repository.", { id: "delete" });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handle analyze ──
  const handleAnalyze = async (repoId) => {
    const result = await analyze(repoId);
    if (result) {
      await fetchRepositories();
    }
  };

  // ── Quick actions ──
  const quickActions = [
    {
      icon: <FiPlus />,
      title: "Import GitHub Repo",
      desc: "Paste a GitHub URL to analyze",
      path: "/import",
      color: "#6366f1",
    },
    {
      icon: <FiGitBranch />,
      title: "View Dependency Graph",
      desc: "Explore visual code map",
      path: "/graph",
      color: "#22c55e",
    },
    {
      icon: <FiAlertTriangle />,
      title: "Dead Code Detection",
      desc: "Find unused files",
      path: "/deadcode",
      color: "#ef4444",
    },
    {
      icon: <FiCpu />,
      title: "AI Code Assistant",
      desc: "Get AI-powered explanations",
      path: "/ai",
      color: "#06b6d4",
    },
  ];

  return (
    <div className="dashboard-wrapper">

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-banner-left">
          <h1>
            Welcome to <span>CodeAtlas</span>
          </h1>
          <p>
            Intelligent Codebase Exploration and Architecture
            Analysis Platform.
            <br />
            {repositories.length === 0
              ? "Import a JavaScript repository to get started."
              : `You have ${repositories.length} repositor${
                  repositories.length === 1 ? "y" : "ies"
                } imported.`}
          </p>
        </div>
        <div className="welcome-banner-right">
          <button
            className="btn-secondary"
            onClick={fetchRepositories}
            disabled={loading}
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/import")}
          >
            <FiPlus /> Import Repository
          </button>
        </div>
      </div>

      {/* ── Platform Stats ── */}
      <div>
        <div className="section-title">
          <FiGrid /> Platform <span>Statistics</span>
        </div>
        <div className="stats-grid">
          <StatCard
            label="Repositories Analyzed"
            value={platformStats.totalRepos}
            icon={<FiGitBranch />}
            footer={
              platformStats.totalRepos === 0
                ? "No repositories yet"
                : `${
                    repositories.filter((r) => r.status === "completed")
                      .length
                  } completed`
            }
            color="#6366f1"
            onClick={() => navigate("/history")}
          />
          <StatCard
            label="JS Files Discovered"
            value={platformStats.totalFiles.toLocaleString()}
            icon={<FiFile />}
            footer={
              platformStats.totalFiles === 0
                ? "Import a repo to start"
                : "Across all repositories"
            }
            color="#22c55e"
            onClick={() => navigate("/files")}
          />
          <StatCard
            label="Dependencies Mapped"
            value={platformStats.totalDeps.toLocaleString()}
            icon={<FiShare2 />}
            footer={
              platformStats.totalDeps === 0
                ? "Graph data pending"
                : "Total import relationships"
            }
            color="#06b6d4"
            onClick={() => navigate("/graph")}
          />
          <StatCard
            label="Dead Code Detected"
            value={platformStats.totalDeadCode}
            icon={<FiAlertTriangle />}
            footer={
              platformStats.totalDeadCode === 0
                ? "No dead code found"
                : "Unused files detected"
            }
            color="#ef4444"
            onClick={() => navigate("/deadcode")}
          />
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
              <div
                className="action-card-icon"
                style={{ color: action.color }}
              >
                {action.icon}
              </div>
              <div className="action-card-title">{action.title}</div>
              <div className="action-card-desc">{action.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Repositories ── */}
      <div>
        <div className="section-title">
          <FiActivity /> Recent <span>Repositories</span>
          {repositories.length > 0 && (
            <button
              className="btn-secondary"
              style={{ marginLeft: "auto", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
              onClick={() => navigate("/history")}
            >
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="loader" />
        ) : repositories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiGitBranch />
            </div>
            <div className="empty-state-title">
              No Repositories Yet
            </div>
            <div className="empty-state-subtitle">
              Import a GitHub repository or upload a local project
              to start exploring your codebase.
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
  );
};

export default Dashboard;