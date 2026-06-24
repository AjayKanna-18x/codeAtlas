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
  FiCheck,
  FiStar,
  FiGitBranch,
  FiCode,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { validateRepository, importRepository } from "../services/apiService";

// ─── URL Parser Helper ────────────────────────────────────
const parseGithubUrl = (url) => {
  try {
    const parts = url.replace("https://github.com/", "").split("/");
    if (parts.length >= 2 && parts[0] && parts[1]) {
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
  const [validatedData, setValidatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importStep, setImportStep] = useState(""); 
  // Steps: "" | "validating" | "cloning" | "saving" | "done"

  // ── Handle URL Input Change ──
  const handleUrlChange = (e) => {
    const value = e.target.value;
    setRepoUrl(value);
    setUrlError("");
    setValidatedData(null);

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

  // ── Validate URL Format ──
  const validateUrlFormat = (url) => {
    const pattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
    return pattern.test(url);
  };

  // ── Handle Full Import Flow ──
  const handleImport = async () => {
    // Basic check
    if (!repoUrl.trim()) {
      setUrlError("Please enter a GitHub repository URL.");
      return;
    }

    // Format check
    if (!validateUrlFormat(repoUrl.trim())) {
      setUrlError(
        "Invalid URL format. Use: https://github.com/username/repository"
      );
      return;
    }

    setLoading(true);
    setUrlError("");
    setValidatedData(null);

    try {
      // ── Step 1: Validate ──────────────────────────────
      setImportStep("validating");
      toast.loading("Step 1/3 — Validating repository...", { id: "import" });

      let validationResult;
      try {
        const validationRes = await validateRepository(repoUrl.trim());
        validationResult = validationRes.data;
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Validation failed. Check the URL and try again.";
        toast.error(msg, { id: "import" });
        setUrlError(msg);
        setLoading(false);
        setImportStep("");
        return;
      }

      if (!validationResult.success) {
        toast.error(validationResult.message, { id: "import" });
        setUrlError(validationResult.message);
        setLoading(false);
        setImportStep("");
        return;
      }

      // Show validated GitHub data in preview
      setValidatedData(validationResult.data);
      setPreview({
        owner: validationResult.data.owner,
        name: validationResult.data.name,
        valid: true,
      });

      // ── Step 2: Clone ─────────────────────────────────
      setImportStep("cloning");
      toast.loading("Step 2/3 — Cloning repository to server...", {
        id: "import",
      });

      let importResult;
      try {
        const importRes = await importRepository(repoUrl.trim());
        importResult = importRes.data;
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Cloning failed. Repository may be too large.";
        toast.error(msg, { id: "import" });
        setUrlError(msg);
        setLoading(false);
        setImportStep("");
        return;
      }

      if (!importResult.success) {
        toast.error(importResult.message, { id: "import" });
        setUrlError(importResult.message);
        setLoading(false);
        setImportStep("");
        return;
      }

      // ── Step 3: Done ──────────────────────────────────
      setImportStep("done");
      toast.success(
        importResult.alreadyExists
          ? "✅ Repository already exists — redirecting..."
          : "✅ Repository imported successfully!",
        { id: "import" }
      );

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong.";
      toast.error(msg, { id: "import" });
      setUrlError(msg);
      setImportStep("");
    } finally {
      if (importStep !== "done") {
        setLoading(false);
      }
    }
  };

  // ── Get Step Label ──
  const getButtonLabel = () => {
    switch (importStep) {
      case "validating": return "Validating...";
      case "cloning": return "Cloning...";
      case "saving": return "Saving...";
      case "done": return "Done ✓";
      default: return "Import";
    }
  };

  return (
    <div className="import-wrapper">

      {/* ── Header ── */}
      <div className="import-header">
        <h1>
          Import <span>Repository</span>
        </h1>
        <p>
          Import a GitHub repository to start analyzing its architecture,
          dependencies, and codebase structure.
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

          {/* ── URL Input ── */}
          <div className="input-group">
            <label className="input-label">GitHub Repository URL</label>
            <div className="input-row">
              <input
                type="text"
                className={`input-field ${urlError ? "error" : ""}`}
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={handleUrlChange}
                disabled={loading}
              />
              <button
                className="btn-primary"
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? (
                  getButtonLabel()
                ) : (
                  <>
                    Import <FiArrowRight />
                  </>
                )}
              </button>
            </div>
            {urlError && (
              <span className="input-error-msg">⚠ {urlError}</span>
            )}
          </div>

          {/* ── Import Progress Steps ── */}
          {loading && (
            <div className="import-progress">
              <div className={`import-step ${
                importStep === "validating" ? "active" :
                ["cloning","saving","done"].includes(importStep) ? "completed" : ""
              }`}>
                <div className="import-step-icon">
                  {["cloning","saving","done"].includes(importStep)
                    ? <FiCheck />
                    : "1"}
                </div>
                <span>Validating Repository</span>
              </div>
              <div className="import-step-line" />
              <div className={`import-step ${
                importStep === "cloning" ? "active" :
                ["saving","done"].includes(importStep) ? "completed" : ""
              }`}>
                <div className="import-step-icon">
                  {["saving","done"].includes(importStep)
                    ? <FiCheck />
                    : "2"}
                </div>
                <span>Cloning to Server</span>
              </div>
              <div className="import-step-line" />
              <div className={`import-step ${
                importStep === "done" ? "completed" : ""
              }`}>
                <div className="import-step-icon">
                  {importStep === "done" ? <FiCheck /> : "3"}
                </div>
                <span>Saving Metadata</span>
              </div>
            </div>
          )}

          {/* ── URL Preview (basic — before validation) ── */}
          {preview && !validatedData && (
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

          {/* ── Validated Data Preview (after validation) ── */}
          {validatedData && (
            <div className="url-preview validated">
              <div className="url-preview-title">
                <FiCheck style={{ color: "#22c55e" }} /> Repository Validated
              </div>
              <div className="url-preview-grid">
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiUser /> Owner
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.owner}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiFolder /> Repository
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.name}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiCode /> Language
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.language || "JavaScript"}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiGitBranch /> Branch
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.defaultBranch || "main"}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    <FiStar /> Stars
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.stars?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="url-preview-item">
                  <span className="url-preview-item-label">
                    Size
                  </span>
                  <span className="url-preview-item-value">
                    {validatedData.size
                      ? `${(validatedData.size / 1024).toFixed(1)} MB`
                      : "Unknown"}
                  </span>
                </div>
              </div>
              {validatedData.description && (
                <div className="url-preview-desc">
                  {validatedData.description}
                </div>
              )}
            </div>
          )}

          {/* ── Tips ── */}
          <div className="import-tips">
            <div className="import-tips-title">
              <FiInfo /> How to Import
            </div>
            <ul>
              <li>Paste the full GitHub repository URL above</li>
              <li>URL format: https://github.com/username/repository</li>
              <li>Only JavaScript repositories are fully supported</li>
              <li>Public repositories only (private repos coming soon)</li>
              <li>Analysis may take 30–60 seconds for large repositories</li>
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
            <div className="empty-state-title">Local Upload Coming Soon</div>
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