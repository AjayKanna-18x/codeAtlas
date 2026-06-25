import { useNavigate } from "react-router-dom";
import {
  FiGitBranch,
  FiFile,
  FiShare2,
  FiAlertTriangle,
  FiClock,
  FiTrash2,
  FiPlay,
  FiEye,
} from "react-icons/fi";

const statusColors = {
  completed: { bg: "rgba(34,197,94,0.1)", color: "#22c55e" },
  pending: { bg: "rgba(234,179,8,0.1)", color: "#eab308" },
  analyzing: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

const RepoCard = ({ repo, onAnalyze, onDelete, analyzing }) => {
  const navigate = useNavigate();
  const statusStyle = statusColors[repo.status] || statusColors.pending;

  return (
    <div className="repo-card">
      {/* ── Header ── */}
      <div className="repo-card-header">
        <div className="repo-card-name">
          <FiGitBranch style={{ color: "#6366f1" }} />
          <span>{repo.owner}/{repo.name}</span>
        </div>
        <span
          className="repo-card-status"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {repo.status}
        </span>
      </div>

      {/* ── Description ── */}
      {repo.description && (
        <div className="repo-card-desc">
          {repo.description.length > 80
            ? repo.description.substring(0, 80) + "..."
            : repo.description}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="repo-card-stats">
        <span className="repo-stat">
          <FiFile /> {repo.stats?.jsFiles || 0} files
        </span>
        <span className="repo-stat">
          <FiShare2 /> {repo.stats?.totalDependencies || 0} deps
        </span>
        <span className="repo-stat">
          <FiAlertTriangle style={{ color: "#ef4444" }} />
          {repo.stats?.deadCodeFiles || 0} dead
        </span>
      </div>

      {/* ── Date ── */}
      <div className="repo-card-date">
        <FiClock />
        <span>
          {new Date(repo.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ── Actions ── */}
      <div className="repo-card-actions">
        <button
          className="repo-action-btn primary"
          onClick={() => navigate(`/graph?repoId=${repo._id}`)}
        >
          <FiEye /> View Graph
        </button>
        <button
          className="repo-action-btn secondary"
          onClick={() => onAnalyze && onAnalyze(repo._id)}
          disabled={analyzing}
        >
          <FiPlay />
          {analyzing ? "..." : "Analyze"}
        </button>
        <button
          className="repo-action-btn danger"
          onClick={() => onDelete && onDelete(repo._id)}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default RepoCard;