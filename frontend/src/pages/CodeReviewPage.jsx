import { useState, useEffect } from "react";
import {
  FiShield,
  FiFile,
  FiPlay,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiList,
  FiStar,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import useCodeReview from "../hooks/useCodeReview";
import PageHeader from "../components/common/PageHeader";
import { getFilesByRepo } from "../services/apiService";
import toast from "react-hot-toast";

const CodeReviewPage = () => {
  const { repositories } = useRepository();
  const {
    projectReview,
    fileReviews,
    loading,
    reviewingFile,
    reviewProject,
    reviewFile,
    batchReview,
    clearReviews,
  } = useCodeReview();

  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("project");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedRepoId) {
      fetchFiles();
      clearReviews();
    }
  }, [selectedRepoId]);

  const fetchFiles = async () => {
    try {
      const res = await getFilesByRepo(selectedRepoId);
      setFiles(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const handleCopyReview = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (risk) => {
    if (!risk) return "var(--text-tertiary)";
    const lower = risk.toLowerCase();
    if (lower === "low") return "var(--accent-green)";
    if (lower === "medium") return "var(--accent-yellow)";
    if (lower === "high") return "var(--accent-red)";
    if (lower === "critical") return "var(--accent-red)";
    return "var(--text-secondary)";
  };

  return (
    <div className="review-page">
      <PageHeader
        title="AI Code"
        highlight="Review"
        subtitle="AI-powered code quality analysis and review."
        actions={
          <div style={{ display: "flex", gap: "0.6rem" }}>
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
              className="btn-secondary"
              onClick={clearReviews}
            >
              <FiTrash2 /> Clear
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="review-tabs">
        <button
          className={`review-tab ${activeTab === "project" ? "active" : ""}`}
          onClick={() => setActiveTab("project")}
        >
          <FiShield /> Project Review
        </button>
        <button
          className={`review-tab ${activeTab === "files" ? "active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
          <FiFile /> File Reviews
        </button>
        <button
          className={`review-tab ${activeTab === "batch" ? "active" : ""}`}
          onClick={() => setActiveTab("batch")}
        >
          <FiList /> Batch Review
        </button>
      </div>

      {!selectedRepoId && (
        <div className="empty-state">
          <div className="empty-state-icon"><FiShield /></div>
          <div className="empty-state-title">Select a Repository</div>
          <div className="empty-state-subtitle">
            Choose a repository to start AI-powered code review.
          </div>
        </div>
      )}

      {/* Project Review Tab */}
      {selectedRepoId && activeTab === "project" && (
        <div className="review-content">
          {!projectReview ? (
            <div className="review-start">
              <div className="review-start-icon"><FiShield /></div>
              <h3>Full Project Review</h3>
              <p>
                AI will analyze your entire project structure, code quality,
                architecture, and provide actionable recommendations.
              </p>
              <button
                className="btn-primary"
                onClick={() => reviewProject(selectedRepoId)}
                disabled={loading}
              >
                <FiPlay />
                {loading ? "Reviewing..." : "Start Project Review"}
              </button>
            </div>
          ) : (
            <div className="review-result">
              <div className="review-result-header">
                <div className="review-result-title">
                  <FiShield style={{ color: "var(--primary)" }} />
                  <span>Project Review — {projectReview.repoName}</span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleCopyReview(projectReview.review)}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              {projectReview.scores?.risk && (
                <div
                  className="review-risk-badge"
                  style={{ color: getRiskColor(projectReview.scores.risk) }}
                >
                  <FiAlertTriangle />
                  Risk Level: {projectReview.scores.risk}
                </div>
              )}
              <div className="review-text">
                {projectReview.review.split("\n").map((line, i) => {
                  if (line.match(/^\d+\./)) {
                    return (
                      <div key={i} className="review-section-title">
                        {line}
                      </div>
                    );
                  }
                  if (line.startsWith("-") || line.startsWith("•")) {
                    return (
                      <div key={i} className="review-bullet">
                        {line}
                      </div>
                    );
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Reviews Tab */}
      {selectedRepoId && activeTab === "files" && (
        <div className="review-content">
          <div className="review-file-selector">
            <div className="widget-title">
              <FiFile /> Select a file to review
            </div>
            <div className="review-file-list">
              {files.slice(0, 20).map((file) => (
                <div
                  key={file._id}
                  className="review-file-item"
                  onClick={() => reviewFile(file._id)}
                >
                  <FiFile style={{ color: "var(--primary)" }} />
                  <div className="review-file-info">
                    <span className="review-file-name">
                      {file.fileName}
                    </span>
                    <span className="review-file-path">
                      {file.relativePath}
                    </span>
                  </div>
                  <span className="review-file-lines">
                    {file.stats?.linesOfCode || 0}L
                  </span>
                </div>
              ))}
            </div>
          </div>

          {reviewingFile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div className="loader" />
            </div>
          )}

          {fileReviews.length > 0 && (
            <div className="review-results-list">
              {fileReviews.map((review, i) => (
                <div key={i} className="review-result">
                  <div className="review-result-header">
                    <div className="review-result-title">
                      <FiFile style={{ color: "var(--primary)" }} />
                      <span>{review.fileName}</span>
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => handleCopyReview(review.review)}
                    >
                      <FiCopy />
                    </button>
                  </div>
                  <div className="review-text">
                    {review.review.split("\n").map((line, j) => {
                      if (line.trim() === "") return <br key={j} />;
                      return <p key={j}>{line}</p>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Batch Review Tab */}
      {selectedRepoId && activeTab === "batch" && (
        <div className="review-content">
          <div className="review-start">
            <div className="review-start-icon"><FiList /></div>
            <h3>Batch File Review</h3>
            <p>
              AI will review the top 5 largest files in your project
              and provide individual quality assessments.
            </p>
            <button
              className="btn-primary"
              onClick={() => batchReview(selectedRepoId, 5)}
              disabled={loading}
            >
              <FiPlay />
              {loading ? "Reviewing 5 files..." : "Start Batch Review"}
            </button>
          </div>

          {fileReviews.length > 0 && (
            <div className="review-results-list">
              {fileReviews.map((review, i) => (
                <div key={i} className="review-result">
                  <div className="review-result-header">
                    <div className="review-result-title">
                      <FiFile style={{ color: "var(--primary)" }} />
                      <span>
                        {review.fileName}{" "}
                        <span style={{ color: "var(--text-tertiary)" }}>
                          ({review.linesOfCode}L)
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="review-text">
                    {review.review.split("\n").map((line, j) => {
                      if (line.trim() === "") return <br key={j} />;
                      return <p key={j}>{line}</p>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeReviewPage;