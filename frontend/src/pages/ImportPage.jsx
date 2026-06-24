import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGithub,
  FiUpload,
  FiLink,
  FiUser,
  FiFolder,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import toast from "react-hot-toast";

// ─── URL Parser Helper ────────────────────────────────────
const parseGithubUrl = (url) => {
  try {
    const parts = url.replace("https://github.com/", "").split("/");
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        name: parts[1],
        valid: true,
      };
    }
    return { owner: "", name: "", valid: false };
  } catch {
    return { owner: "", name: "", valid: false };
  }
};

// ─── Import Page Component ────────────────────────────────
const ImportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Handle URL Input Change ──
  const handleUrlChange = (e) => {
    const value = e.target.value;
    setRepoUrl(value);
    setUrlError("");

    if (value.includes("github.com")) {
      const parsed = parseGithubUrl(value);
      if (parsed.valid) {
        setPreview(parsed);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  };

  // ── Validate URL ──
  const validateUrl = (url) => {
    const pattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
    return pattern.test(url);
  };

  // ── Handle Import Submit ──
  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setUrlError("Please enter a GitHub repository URL.");
      return;
    }

    if (!validateUrl(repoUrl.trim())) {
      setUrlError(
        "Invalid URL. Format: https://github.com/username/repository"
      );
      return;
    }

    setLoading(true);
    toast.loading("Preparing to import repository...", { id: "import" });

    // Simulate API call (real implementation Day 12)
    setTimeout(() => {
      setLoading(false);
      toast.success("Repository import initiated!", { id: "import" });
      // navigate to graph page after real import
    }, 2000);
  };

  return (
    <div className="import-wrapper">

      {/* ── Header ── */}
      <div className="import-header">
        <h1>
          Import <span>Repository</span>
        </h1>
        <p>
          Import a GitHub repository or upload a local JavaScript project
          to start analyzing its architecture and dependencies.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="import-tabs">
        <button
          className={`import-tab ${activeTab === "github" ? "active" : ""}`}
          onClick={() => setActiveTab("github")}
        >
          <FiGithub /> GitHub URL
        </button>
        <button
          className={`import-tab ${activeTab === "local" ? "active" : ""}`}
          onClick={() => setActiveTab("local")}
        >
          <FiUpload /> Local Project
        </button>
      </div>

      {/* ── GitHub Tab ── */}
      {activeTab === "github" && (
        <div className="import-card">
          <div className="import-card-title">
            <FiGithub /> Import from GitHub
          </div>

          {/* URL Input */}
          <div className="input-group">
            <label className="input-label">GitHub Repository URL</label>
            <div className="input-row">
              <input
                type="text"
                className={`input-field ${urlError ? "error" : ""}`}
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={handleUrlChange}
              />
              <button
                className="btn-primary"
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? "Importing..." : "Import"}
                {!loading && <FiArrowRight />}
              </button>
            </div>
            {urlError && (
              <span className="input-error-msg">{urlError}</span>
            )}
          </div>

          {/* URL Preview */}
          {preview && (
            <div className="url-preview">
              <div className="url-preview-title">Repository Preview</div>
              <div className="url-preview-grid">
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiUser /> Owner
                  </span>
                  <span className="url-preview-item-value">
                    {preview.owner}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiFolder /> Repository
                  </span>
                  <span className="url-preview-item-value">
                    {preview.name}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiLink /> Full URL
                  </span>
                  <span className="url-preview-item-value">
                    {repoUrl}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">Source</span>
                  <span className="url-preview-item-value">GitHub</span>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="import-tips">
            <div className="import-tips-title">
              <FiInfo /> How to Import
            </div>
            <ul>
              <li>Paste the full GitHub repository URL above</li>
              <li>URL format: https://github.com/username/repository</li>
              <li>Only JavaScript repositories are supported</li>
              <li>Public repositories only (private coming soon)</li>
              <li>Analysis may take 30–60 seconds for large repos</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── Local Tab ── */}
      {activeTab === "local" && (
        <div className="import-card">
          <div className="import-card-title">
            <FiUpload /> Upload Local Project
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiUpload />
            </div>
            <div className="empty-state-title">
              Local Upload Coming Soon
            </div>
            <div className="empty-state-subtitle">
              Local folder upload will be available in a future update.
              Use GitHub URL import for now.
            </div>
            <button
              className="btn-secondary"
              onClick={() => setActiveTab("github")}
            >
              Switch to GitHub Import
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImportPage;