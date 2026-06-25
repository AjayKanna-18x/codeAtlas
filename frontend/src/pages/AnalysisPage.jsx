import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiGitBranch,
  FiFile,
  FiShare2,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiCode,
  FiGrid,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import useAnalysis from "../hooks/useAnalysis";
import PageHeader from "../components/common/PageHeader";
import toast from "react-hot-toast";

const AnalysisPage = () => {
  const navigate = useNavigate();
  const { repositories, analyze, analyzing } = useRepository();
  const { summary, loading, fetchSummary } = useAnalysis();

  const [selectedRepoId, setSelectedRepoId] = useState("");

  // ── Fetch summary when repo selected ──
  useEffect(() => {
    if (selectedRepoId) {
      fetchSummary(selectedRepoId);
    }
  }, [selectedRepoId]);

  // ── Handle analyze ──
  const handleAnalyze = async () => {
    if (!selectedRepoId) {
      toast.error("Please select a repository first.");
      return;
    }
    const result = await analyze(selectedRepoId);
    if (result) {
      await fetchSummary(selectedRepoId);
    }
  };

  // ── Selected repo info ──
  const selectedRepo = repositories.find(
    (r) => r._id === selectedRepoId
  );

  return (
    <div className="analysis-page">

      {/* ── Header ── */}
      <PageHeader
        title="Repository"
        highlight="Analysis"
        subtitle="Detailed analysis results and architecture insights."
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select
              className="repo-selector"
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
            >
              <option value="">Select Repository</option>
              {repositories.map((repo) => (
                <option key={repo._id} value={repo._id}>
                  {repo.owner}/{repo.name}
                </option>
              ))}
            </select>
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={!selectedRepoId || analyzing}
            >
              <FiPlay />
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </button>
          </div>
        }
      />

      {/* ── No Repo Selected ── */}
      {!selectedRepoId && (
        <div className="empty-state" style={{ marginTop: "1rem" }}>
          <div className="empty-state-icon">
            <FiActivity />
          </div>
          <div className="empty-state-title">
            Select a Repository
          </div>
          <div className="empty-state-subtitle">
            Choose a repository to view its complete analysis results.
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {selectedRepoId && loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "3rem",
          }}
        >
          <div className="loader" />
        </div>
      )}

      {/* ── Analysis Results ── */}
      {selectedRepoId && !loading && summary && (
        <div className="analysis-content">

          {/* ── Repo Info Card ── */}
          <div className="analysis-repo-card">
            <div className="analysis-repo-header">
              <div className="analysis-repo-title">
                <FiGitBranch style={{ color: "#6366f1" }} />
                <span>
                  {summary.repository?.owner}/
                  {summary.repository?.name}
                </span>
              </div>
              <span
                className={`repo-card-status status-${summary.repository?.status}`}
              >
                {summary.repository?.status}
              </span>
            </div>
            <div className="analysis-repo-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  navigate(`/graph?repoId=${selectedRepoId}`)
                }
              >
                <FiGitBranch /> View Graph
              </button>
              <button
                className="btn-secondary"
                onClick={() =>
                  navigate(`/files?repoId=${selectedRepoId}`)
                }
              >
                <FiFile /> View Files
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate("/deadcode")}
              >
                <FiAlertTriangle /> Dead Code
              </button>
            </div>
          </div>

          {/* ── Repository Stats ── */}
          <div>
            <div className="section-title">
              <FiGrid /> Repository <span>Statistics</span>
            </div>
            <div className="analysis-stats-grid">
              {[
                {
                  label: "Total Files",
                  value: summary.repository?.stats?.totalFiles || 0,
                  icon: <FiFile />,
                  color: "#6366f1",
                },
                {
                  label: "JS Files",
                  value: summary.repository?.stats?.jsFiles || 0,
                  icon: <FiCode />,
                  color: "#22c55e",
                },
                {
                  label: "Dependencies",
                  value:
                    summary.repository?.stats?.totalDependencies || 0,
                  icon: <FiShare2 />,
                  color: "#06b6d4",
                },
                {
                  label: "Total Lines",
                  value: (
                    summary.repository?.stats?.totalLines || 0
                  ).toLocaleString(),
                  icon: <FiActivity />,
                  color: "#a855f7",
                },
                {
                  label: "Dead Files",
                  value:
                    summary.repository?.stats?.deadCodeFiles || 0,
                  icon: <FiAlertTriangle />,
                  color: "#ef4444",
                },
                {
                  label: "Total Files Count",
                  value: summary.fileCount || 0,
                  icon: <FiFile />,
                  color: "#eab308",
                },
              ].map((stat, i) => (
                <div key={i} className="analysis-stat-card">
                  <div
                    className="analysis-stat-icon"
                    style={{ color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="analysis-stat-value">
                    {stat.value}
                  </div>
                  <div className="analysis-stat-label">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Graph Stats ── */}
          {summary.graph && (
            <div>
              <div className="section-title">
                <FiGitBranch /> Graph <span>Analysis</span>
              </div>
              <div className="analysis-graph-card">
                <div className="analysis-graph-grid">
                  <div className="analysis-graph-item">
                    <span className="analysis-graph-label">
                      Total Nodes
                    </span>
                    <span className="analysis-graph-value">
                      {summary.graph.totalNodes}
                    </span>
                  </div>
                  <div className="analysis-graph-item">
                    <span className="analysis-graph-label">
                      Total Edges
                    </span>
                    <span className="analysis-graph-value">
                      {summary.graph.totalEdges}
                    </span>
                  </div>
                  <div className="analysis-graph-item">
                    <span className="analysis-graph-label">
                      Isolated Nodes
                    </span>
                    <span
                      className="analysis-graph-value"
                      style={{ color: "#ef4444" }}
                    >
                      {summary.graph.isolatedNodes}
                    </span>
                  </div>
                  <div className="analysis-graph-item">
                    <span className="analysis-graph-label">
                      Most Connected
                    </span>
                    <span
                      className="analysis-graph-value"
                      style={{
                        fontSize: "0.85rem",
                        color: "#6366f1",
                      }}
                    >
                      {summary.graph.mostConnectedFile
                        ? summary.graph.mostConnectedFile
                            .split("/")
                            .pop()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Dead Code Summary ── */}
          {summary.deadCode && (
            <div>
              <div className="section-title">
                <FiAlertTriangle style={{ color: "#ef4444" }} />
                Dead Code <span>Summary</span>
              </div>
              <div className="analysis-deadcode-card">
                {summary.deadCode.totalDeadFiles === 0 ? (
                  <div className="analysis-clean">
                    <FiCheckCircle style={{ color: "#22c55e" }} />
                    <span>
                      No dead code detected — codebase is clean!
                    </span>
                  </div>
                ) : (
                  <div className="analysis-deadcode-list">
                    <div className="analysis-deadcode-count">
                      <FiAlertTriangle style={{ color: "#ef4444" }} />
                      {summary.deadCode.totalDeadFiles} unused files
                      detected
                    </div>
                    <div className="deadcode-file-list-small">
                      {summary.deadCode.unusedFiles
                        .slice(0, 8)
                        .map((file, i) => (
                          <span
                            key={i}
                            className="deadcode-file-chip"
                          >
                            {file.split("/").pop()}
                          </span>
                        ))}
                      {summary.deadCode.unusedFiles.length > 8 && (
                        <span className="deadcode-file-chip more">
                          +{summary.deadCode.unusedFiles.length - 8}{" "}
                          more
                        </span>
                      )}
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ marginTop: "0.75rem" }}
                      onClick={() => navigate("/deadcode")}
                    >
                      View All Dead Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── No Analysis Yet ── */}
          {!summary.graph && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiActivity />
              </div>
              <div className="empty-state-title">
                Not Analyzed Yet
              </div>
              <div className="empty-state-subtitle">
                Run analysis to generate dependency graph and
                insights.
              </div>
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                <FiPlay />
                {analyzing ? "Analyzing..." : "Run Analysis Now"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── No Summary ── */}
      {selectedRepoId && !loading && !summary && (
        <div className="empty-state" style={{ marginTop: "1rem" }}>
          <div className="empty-state-icon">
            <FiActivity />
          </div>
          <div className="empty-state-title">
            No Analysis Data
          </div>
          <div className="empty-state-subtitle">
            Run analysis first to see results here.
          </div>
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            <FiPlay /> Run Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;