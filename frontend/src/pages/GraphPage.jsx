import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiGitBranch,
  FiRefreshCw,
  FiAlertTriangle,
  FiFile,
  FiShare2,
  FiGrid,
  FiPlay,
} from "react-icons/fi";
import toast from "react-hot-toast";
import GraphViewer from "../components/graph/GraphViewer";
import useGraph from "../hooks/useGraph";
import useRepository from "../hooks/useRepository";
import { runDeadCodeDetection } from "../services/apiService";

const GraphPage = () => {
  const [searchParams] = useSearchParams();
  const repoId = searchParams.get("repoId");

  const {
    nodes,
    edges,
    stats,
    loading,
    nodeDetails,
    fetchGraph,
    fetchNodeDetails,
    clearSelection,
  } = useGraph();

  const { repositories, analyze, analyzing } = useRepository();

  const [selectedRepoId, setSelectedRepoId] = useState(repoId || "");
  const [runningDeadCode, setRunningDeadCode] = useState(false);

  // ── Load graph when repo selected ──
  useEffect(() => {
    if (selectedRepoId) {
      fetchGraph(selectedRepoId);
    }
  }, [selectedRepoId]);

  // ── Handle node click ──
  const handleNodeClick = (node) => {
    if (selectedRepoId && node?.id) {
      fetchNodeDetails(selectedRepoId, node.id);
    }
  };

  // ── Handle analyze ──
  const handleAnalyze = async () => {
    if (!selectedRepoId) {
      toast.error("Please select a repository first.");
      return;
    }
    const result = await analyze(selectedRepoId);
    if (result) {
      await fetchGraph(selectedRepoId);
    }
  };

  // ── Handle dead code detection ──
  const handleDeadCodeDetection = async () => {
    if (!selectedRepoId) {
      toast.error("Please select a repository first.");
      return;
    }

    setRunningDeadCode(true);
    toast.loading("Running dead code detection...", { id: "deadcode" });

    try {
      const res = await runDeadCodeDetection(selectedRepoId);
      if (res.data.success) {
        toast.success(
          `Found ${res.data.data.totalDeadFiles} unused files.`,
          { id: "deadcode" }
        );
        await fetchGraph(selectedRepoId);
      }
    } catch (error) {
      toast.error("Dead code detection failed.", { id: "deadcode" });
    } finally {
      setRunningDeadCode(false);
    }
  };

  // ── Get selected repo info ──
  const selectedRepo = repositories.find((r) => r._id === selectedRepoId);

  return (
    <div className="graph-page">

      {/* ── Page Header ── */}
      <div className="graph-page-header">
        <div>
          <h1 className="page-title">
            <FiGitBranch /> Dependency <span style={{ color: "#6366f1" }}>Graph</span>
          </h1>
          <p className="page-subtitle">
            Visual map of file dependencies and module relationships.
          </p>
        </div>

        <div className="graph-page-actions">
          {/* Repository Selector */}
          <select
            className="repo-selector"
            value={selectedRepoId}
            onChange={(e) => {
              setSelectedRepoId(e.target.value);
              clearSelection();
            }}
          >
            <option value="">Select Repository</option>
            {repositories.map((repo) => (
              <option key={repo._id} value={repo._id}>
                {repo.owner}/{repo.name}
              </option>
            ))}
          </select>

          {/* Analyze Button */}
          <button
            className="btn-secondary"
            onClick={handleAnalyze}
            disabled={!selectedRepoId || analyzing}
          >
            <FiPlay />
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>

          {/* Dead Code Button */}
          <button
            className="btn-secondary"
            onClick={handleDeadCodeDetection}
            disabled={!selectedRepoId || runningDeadCode || nodes.length === 0}
          >
            <FiAlertTriangle />
            {runningDeadCode ? "Detecting..." : "Dead Code"}
          </button>

          {/* Refresh Button */}
          <button
            className="btn-primary"
            onClick={() => selectedRepoId && fetchGraph(selectedRepoId)}
            disabled={!selectedRepoId || loading}
          >
            <FiRefreshCw />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Graph Stats Bar ── */}
      {stats && (
        <div className="graph-stats-bar">
          <div className="graph-stat-item">
            <FiFile />
            <span>{stats.totalNodes} Files</span>
          </div>
          <div className="graph-stat-item">
            <FiShare2 />
            <span>{stats.totalEdges} Dependencies</span>
          </div>
          <div className="graph-stat-item">
            <FiAlertTriangle style={{ color: "#ef4444" }} />
            <span>{stats.isolatedNodes} Isolated</span>
          </div>
          <div className="graph-stat-item">
            <FiGrid />
            <span>
              {stats.mostConnectedFile
                ? `Hub: ${stats.mostConnectedFile.split("/").pop()}`
                : "No hub"}
            </span>
          </div>
        </div>
      )}

      {/* ── Graph Legend ── */}
      <div className="graph-legend">
        {[
          { type: "controller", color: "#3b82f6" },
          { type: "service", color: "#22c55e" },
          { type: "model", color: "#ef4444" },
          { type: "route", color: "#a855f7" },
          { type: "middleware", color: "#eab308" },
          { type: "util", color: "#06b6d4" },
          { type: "config", color: "#6366f1" },
          { type: "dead code", color: "#ef4444" },
        ].map((item) => (
          <div key={item.type} className="legend-item">
            <div
              className="legend-dot"
              style={{ background: item.color }}
            />
            <span>{item.type}</span>
          </div>
        ))}
      </div>

      {/* ── No Repo Selected ── */}
      {!selectedRepoId && (
        <div className="empty-state" style={{ marginTop: "2rem" }}>
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No Repository Selected</div>
          <div className="empty-state-subtitle">
            Select a repository from the dropdown above to view its
            dependency graph.
          </div>
        </div>
      )}

      {/* ── Graph Canvas ── */}
      {selectedRepoId && (
        <div className="graph-canvas-wrapper">
          <GraphViewer
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            nodeDetails={nodeDetails}
            onClosePanel={clearSelection}
            onRefresh={() => fetchGraph(selectedRepoId)}
            loading={loading || analyzing}
          />
        </div>
      )}
    </div>
  );
};

export default GraphPage;