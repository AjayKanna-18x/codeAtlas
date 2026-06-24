import { useState, useEffect } from "react";
import {
  FiFile,
  FiCode,
  FiArrowRight,
  FiArrowLeft,
  FiSearch,
  FiAlertTriangle,
  FiActivity,
  FiList,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import {
  getFilesByRepo,
  getFileStats,
} from "../services/apiService";
import toast from "react-hot-toast";

const FilePage = () => {
  const { repositories } = useRepository();
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [files, setFiles] = useState([]);
  const [fileStats, setFileStats] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // ── Fetch files ──
  const fetchFiles = async (repoId, search = "") => {
    if (!repoId) return;
    setLoading(true);
    try {
      const [filesRes, statsRes] = await Promise.all([
        getFilesByRepo(repoId, search),
        getFileStats(repoId),
      ]);
      setFiles(filesRes.data.data || []);
      setFileStats(statsRes.data.data || null);
    } catch (error) {
      toast.error("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRepoId) {
      fetchFiles(selectedRepoId);
    }
  }, [selectedRepoId]);

  // ── Search handler ──
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (selectedRepoId) {
      fetchFiles(selectedRepoId, value);
    }
  };

  // ── Filtered files by tab ──
  const filteredFiles = files.filter((file) => {
    if (activeTab === "dead") return file.isDeadCode;
    return true;
  });

  return (
    <div className="file-page">

      {/* ── Header ── */}
      <div className="file-page-header">
        <div>
          <h1 className="page-title">
            <FiFile /> File <span style={{ color: "#6366f1" }}>Inspector</span>
          </h1>
          <p className="page-subtitle">
            Explore individual files, statistics, and dependency details.
          </p>
        </div>

        <select
          className="repo-selector"
          value={selectedRepoId}
          onChange={(e) => {
            setSelectedRepoId(e.target.value);
            setSelectedFile(null);
          }}
        >
          <option value="">Select Repository</option>
          {repositories.map((repo) => (
            <option key={repo._id} value={repo._id}>
              {repo.owner}/{repo.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── File Stats Bar ── */}
      {fileStats && (
        <div className="graph-stats-bar">
          <div className="graph-stat-item">
            <FiFile />
            <span>{fileStats.totalFiles} Files</span>
          </div>
          <div className="graph-stat-item">
            <FiCode />
            <span>{fileStats.totalLines?.toLocaleString()} Lines</span>
          </div>
          <div className="graph-stat-item">
            <FiActivity />
            <span>{fileStats.totalFunctions} Functions</span>
          </div>
          <div className="graph-stat-item">
            <FiAlertTriangle style={{ color: "#ef4444" }} />
            <span>{fileStats.deadCodeFiles} Dead Files</span>
          </div>
          <div className="graph-stat-item">
            <FiList />
            <span>Avg {fileStats.averageLines} Lines/File</span>
          </div>
        </div>
      )}

      {/* ── No Repo Selected ── */}
      {!selectedRepoId && (
        <div className="empty-state" style={{ marginTop: "2rem" }}>
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-title">No Repository Selected</div>
          <div className="empty-state-subtitle">
            Select a repository to inspect its files.
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {selectedRepoId && (
        <div className="file-page-body">

          {/* ── Left Panel — File List ── */}
          <div className="file-list-panel">

            {/* Search */}
            <div className="file-search">
              <FiSearch className="file-search-icon" />
              <input
                type="text"
                className="file-search-input"
                placeholder="Search files..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* Tabs */}
            <div className="file-tabs">
              <button
                className={`file-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Files ({files.length})
              </button>
              <button
                className={`file-tab ${activeTab === "dead" ? "active" : ""}`}
                onClick={() => setActiveTab("dead")}
              >
                Dead Code ({files.filter((f) => f.isDeadCode).length})
              </button>
            </div>

            {/* File List */}
            <div className="file-list">
              {loading ? (
                <div className="loader" />
              ) : filteredFiles.length === 0 ? (
                <div className="file-empty">
                  <p>No files found.</p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file._id}
                    className={`file-list-item ${
                      selectedFile?._id === file._id ? "selected" : ""
                    } ${file.isDeadCode ? "dead-code" : ""}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="file-list-item-name">
                      <FiFile />
                      <span>{file.fileName}</span>
                      {file.isDeadCode && (
                        <FiAlertTriangle
                          style={{ color: "#ef4444", marginLeft: "auto" }}
                        />
                      )}
                    </div>
                    <div className="file-list-item-meta">
                      <span>{file.stats?.linesOfCode || 0} lines</span>
                      <span>{file.stats?.functionCount || 0} funcs</span>
                      <span>{file.stats?.importCount || 0} imports</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Right Panel — File Details ── */}
          <div className="file-detail-panel">
            {!selectedFile ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FiFile />
                </div>
                <div className="empty-state-title">Select a File</div>
                <div className="empty-state-subtitle">
                  Click on any file from the list to view its details.
                </div>
              </div>
            ) : (
              <div className="file-detail-content">

                {/* File Header */}
                <div className="file-detail-header">
                  <h2 className="file-detail-name">
                    {selectedFile.fileName}
                  </h2>
                  {selectedFile.isDeadCode && (
                    <span className="dead-code-badge">
                      <FiAlertTriangle /> Dead Code
                    </span>
                  )}
                </div>

                {/* File Path */}
                <div className="file-detail-path">
                  {selectedFile.relativePath}
                </div>

                {/* Stats Grid */}
                <div className="file-detail-stats">
                  {[
                    {
                      label: "Lines of Code",
                      value: selectedFile.stats?.linesOfCode || 0,
                    },
                    {
                      label: "Functions",
                      value: selectedFile.stats?.functionCount || 0,
                    },
                    {
                      label: "Imports",
                      value: selectedFile.stats?.importCount || 0,
                    },
                    {
                      label: "Exports",
                      value: selectedFile.stats?.exportCount || 0,
                    },
                    {
                      label: "File Size",
                      value: selectedFile.stats?.fileSize
                        ? `${(selectedFile.stats.fileSize / 1024).toFixed(1)} KB`
                        : "0 KB",
                    },
                    {
                      label: "Extension",
                      value: selectedFile.extension || ".js",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="file-stat-card">
                      <span className="file-stat-label">{stat.label}</span>
                      <span className="file-stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Imports Section */}
                {selectedFile.imports?.length > 0 && (
                  <div className="file-imports">
                    <h3 className="file-section-title">
                      <FiArrowLeft style={{ color: "#6366f1" }} />
                      Imports ({selectedFile.imports.length})
                    </h3>
                    <div className="file-import-list">
                      {selectedFile.imports.map((imp, i) => (
                        <div key={i} className="file-import-item">
                          <span className="import-source">
                            {imp.source}
                          </span>
                          <span className="import-type">{imp.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exports Section */}
                {selectedFile.exports?.length > 0 && (
                  <div className="file-imports">
                    <h3 className="file-section-title">
                      <FiArrowRight style={{ color: "#22c55e" }} />
                      Exports ({selectedFile.exports.length})
                    </h3>
                    <div className="file-import-list">
                      {selectedFile.exports.map((exp, i) => (
                        <div key={i} className="file-import-item">
                          <span className="import-source">
                            {typeof exp === "string" ? exp : exp.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilePage;
