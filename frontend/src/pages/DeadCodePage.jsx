import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiFile,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import useAnalysis from "../hooks/useAnalysis";
import PageHeader from "../components/common/PageHeader";
import toast from "react-hot-toast";

const DeadCodePage = () => {
  const navigate = useNavigate();
  const { repositories } = useRepository();
  const {
    deadCodeFiles,
    fileStats,
    runningDeadCode,
    fetchDeadCode,
    runDeadCode,
  } = useAnalysis();

  const [selectedRepoId, setSelectedRepoId] = useState("");

  // ── Fetch dead code when repo selected ──
  useEffect(() => {
    if (selectedRepoId) {
      fetchDeadCode(selectedRepoId);
    }
  }, [selectedRepoId]);

  // ── Handle run detection ──
  const handleRunDetection = async () => {
    if (!selectedRepoId) {
      toast.error("Please select a repository first.");
      return;
    }
    await runDeadCode(selectedRepoId);
  };

  return (
    <div className="deadcode-page">

      {/* ── Header ── */}
      <PageHeader
        title="Dead Code"
        highlight="Detection"
        subtitle="Identify unused and unreachable files in your codebase."
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
              onClick={handleRunDetection}
              disabled={!selectedRepoId || runningDeadCode}
            >
              <FiPlay />
              {runningDeadCode ? "Detecting..." : "Run Detection"}
            </button>
          </div>
        }
      />

      {/* ── Info Banner ── */}
      <div className="info-banner">
        <FiInfo style={{ color: "#6366f1", flexShrink: 0 }} />
        <p>
          Dead code detection analyzes the dependency graph to find files
          that are not imported or referenced by any other module. These
          files are candidates for removal to keep your codebase clean.
        </p>
      </div>

      {/* ── No Repo Selected ── */}
      {!selectedRepoId && (
        <div className="empty-state" style={{ marginTop: "1rem" }}>
          <div className="empty-state-icon">
            <FiAlertTriangle />
          </div>
          <div className="empty-state-title">
            Select a Repository
          </div>
          <div className="empty-state-subtitle">
            Choose a repository and run dead code detection to find
            unused files.
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {selectedRepoId && (
        <div className="deadcode-content">

          {/* ── Summary Stats ── */}
          {fileStats && (
            <div className="deadcode-stats">
              <div className="deadcode-stat-card total">
                <FiFile />
                <div>
                  <div className="deadcode-stat-value">
                    {fileStats.totalFiles}
                  </div>
                  <div className="deadcode-stat-label">Total Files</div>
                </div>
              </div>
              <div className="deadcode-stat-card dead">
                <FiAlertTriangle />
                <div>
                  <div className="deadcode-stat-value">
                    {fileStats.deadCodeFiles}
                  </div>
                  <div className="deadcode-stat-label">Dead Files</div>
                </div>
              </div>
              <div className="deadcode-stat-card clean">
                <FiCheckCircle />
                <div>
                  <div className="deadcode-stat-value">
                    {fileStats.totalFiles - fileStats.deadCodeFiles}
                  </div>
                  <div className="deadcode-stat-label">Active Files</div>
                </div>
              </div>
              <div className="deadcode-stat-card percentage">
                <FiAlertTriangle />
                <div>
                  <div className="deadcode-stat-value">
                    {fileStats.totalFiles > 0
                      ? Math.round(
                          (fileStats.deadCodeFiles / fileStats.totalFiles) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="deadcode-stat-label">Dead Code %</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Dead Code Files List ── */}
          <div className="deadcode-list-section">
            <div className="section-title">
              <FiAlertTriangle style={{ color: "#ef4444" }} />
              Unused <span>Files</span>
              <span className="section-count">
                {deadCodeFiles.length}
              </span>
            </div>

            {deadCodeFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiCheckCircle style={{ color: "#22c55e" }} />
                </div>
                <div className="empty-state-title">
                  No Dead Code Found
                </div>
                <div className="empty-state-subtitle">
                  {selectedRepoId
                    ? "Run detection to check for unused files, or all files are actively used."
                    : "Select a repository and run detection."}
                </div>
              </div>
            ) : (
              <div className="deadcode-file-grid">
                {deadCodeFiles.map((file) => (
                  <div
                    key={file._id}
                    className="deadcode-file-card"
                  >
                    {/* File header */}
                    <div className="deadcode-file-header">
                      <div className="deadcode-file-name">
                        <FiFile style={{ color: "#ef4444" }} />
                        <span>{file.fileName}</span>
                      </div>
                      <span className="dead-badge">Unused</span>
                    </div>

                    {/* File path */}
                    <div className="deadcode-file-path">
                      {file.relativePath}
                    </div>

                    {/* File stats */}
                    <div className="deadcode-file-stats">
                      <span>{file.stats?.linesOfCode || 0} lines</span>
                      <span>
                        {file.stats?.functionCount || 0} functions
                      </span>
                      <span>
                        {file.stats?.importCount || 0} imports
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── How to Fix ── */}
          {deadCodeFiles.length > 0 && (
            <div className="deadcode-tips">
              <div className="deadcode-tips-title">
                💡 How to Handle Dead Code
              </div>
              <ul>
                <li>
                  Review each file to confirm it is truly unused before
                  deletion
                </li>
                <li>
                  Some files may be entry points or used dynamically —
                  verify manually
                </li>
                <li>
                  Remove confirmed dead files to reduce bundle size and
                  improve maintainability
                </li>
                <li>
                  Re-run analysis after removal to verify the codebase
                  is clean
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeadCodePage;