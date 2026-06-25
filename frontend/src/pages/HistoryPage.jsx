import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiGitBranch,
  FiFilter,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import RepoCard from "../components/common/RepoCard";
import PageHeader from "../components/common/PageHeader";
import { deleteRepository } from "../services/apiService";
import toast from "react-hot-toast";

const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    repositories,
    loading,
    analyzing,
    fetchRepositories,
    analyze,
  } = useRepository();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // ── Filter repositories ──
  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || repo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ── Handle delete ──
  const handleDelete = async (repoId) => {
    if (!window.confirm("Delete this repository and all its data?")) return;

    setDeletingId(repoId);
    toast.loading("Deleting...", { id: "delete" });

    try {
      await deleteRepository(repoId);
      toast.success("Deleted successfully.", { id: "delete" });
      await fetchRepositories();
    } catch (error) {
      toast.error("Failed to delete.", { id: "delete" });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handle analyze ──
  const handleAnalyze = async (repoId) => {
    await analyze(repoId);
    await fetchRepositories();
  };

  return (
    <div className="history-page">

      {/* ── Header ── */}
      <PageHeader
        title="Analysis"
        highlight="History"
        subtitle="All imported and analyzed repositories."
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
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
              <FiPlus /> Import New
            </button>
          </div>
        }
      />

      {/* ── Filters ── */}
      <div className="history-filters">

        {/* Search */}
        <div className="history-search">
          <FiSearch className="history-search-icon" />
          <input
            type="text"
            className="history-search-input"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="history-filter-group">
          <FiFilter style={{ color: "#94a3b8" }} />
          {["all", "completed", "pending", "analyzing", "failed"].map(
            (status) => (
              <button
                key={status}
                className={`filter-btn ${
                  statusFilter === status ? "active" : ""
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all"
                  ? ` (${repositories.length})`
                  : ` (${
                      repositories.filter((r) => r.status === status)
                        .length
                    })`}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Repository Grid ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "3rem",
          }}
        >
          <div className="loader" />
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FiClock />
          </div>
          <div className="empty-state-title">
            {searchQuery || statusFilter !== "all"
              ? "No repositories match your filter."
              : "No repositories yet."}
          </div>
          <div className="empty-state-subtitle">
            {searchQuery || statusFilter !== "all"
              ? "Try changing your search or filter."
              : "Import a repository to see it here."}
          </div>
          {!searchQuery && statusFilter === "all" && (
            <button
              className="btn-primary"
              onClick={() => navigate("/import")}
            >
              <FiPlus /> Import Repository
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="history-count">
            Showing {filteredRepos.length} of {repositories.length}{" "}
            repositories
          </div>
          <div className="history-grid">
            {filteredRepos.map((repo) => (
              <RepoCard
                key={repo._id}
                repo={repo}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
                analyzing={analyzing}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;