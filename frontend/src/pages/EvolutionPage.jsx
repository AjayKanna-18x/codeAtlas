import { useState, useEffect } from "react";
import {
  FiGitCommit,
  FiUser,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiFile,
  FiPlus,
  FiMinus,
  FiActivity,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import useRepository from "../hooks/useRepository";
import useEvolution from "../hooks/useEvolution";
import PageHeader from "../components/common/PageHeader";

const EvolutionPage = () => {
  const { repositories } = useRepository();
  const { timeline, stats, loading, fetchTimeline } = useEvolution();
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [selectedCommit, setSelectedCommit] = useState(null);

  useEffect(() => {
    if (selectedRepoId) {
      fetchTimeline(selectedRepoId);
    }
  }, [selectedRepoId]);

  const maxLines = Math.max(
    ...timeline.map((c) => c.linesAdded + c.linesDeleted),
    1
  );

  return (
    <div className="evolution-page">
      <PageHeader
        title="Code"
        highlight="Evolution"
        subtitle="Track how your codebase evolved across git commits."
        actions={
          <select
            className="repo-selector"
            value={selectedRepoId}
            onChange={(e) => {
              setSelectedRepoId(e.target.value);
              setSelectedCommit(null);
            }}
          >
            <option value="">Select Repository</option>
            {repositories.map((repo) => (
              <option key={repo._id} value={repo._id}>
                {repo.owner}/{repo.name}
              </option>
            ))}
          </select>
        }
      />

      {!selectedRepoId && (
        <div className="empty-state">
          <div className="empty-state-icon"><FiGitCommit /></div>
          <div className="empty-state-title">Select a Repository</div>
          <div className="empty-state-subtitle">
            Choose a repository to view its code evolution timeline.
          </div>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="loader" />
        </div>
      )}

      {selectedRepoId && !loading && (
        <div className="evolution-content">
          {/* Stats Cards */}
          {stats && (
            <div className="evolution-stats">
              <div className="evo-stat-card">
                <FiGitCommit style={{ color: "var(--primary)" }} />
                <div>
                  <div className="evo-stat-value">{stats.totalCommits}</div>
                  <div className="evo-stat-label">Total Commits</div>
                </div>
              </div>
              <div className="evo-stat-card">
                <FiCalendar style={{ color: "var(--accent-blue)" }} />
                <div>
                  <div className="evo-stat-value">{stats.totalDays}</div>
                  <div className="evo-stat-label">Days Active</div>
                </div>
              </div>
              <div className="evo-stat-card">
                <FiActivity style={{ color: "var(--accent-green)" }} />
                <div>
                  <div className="evo-stat-value">{stats.avgCommitsPerDay}</div>
                  <div className="evo-stat-label">Commits/Day</div>
                </div>
              </div>
              <div className="evo-stat-card">
                <FiUsers style={{ color: "var(--accent-purple)" }} />
                <div>
                  <div className="evo-stat-value">
                    {stats.topContributors?.length || 0}
                  </div>
                  <div className="evo-stat-label">Contributors</div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Graph */}
          <div className="evo-graph-card">
            <div className="widget-title">
              <FiActivity /> Commit <span style={{ color: "var(--primary)" }}>Activity</span>
            </div>
            <div className="evo-graph">
              {timeline.slice(0, 30).reverse().map((commit, i) => {
                const height = Math.max(
                  8,
                  ((commit.linesAdded + commit.linesDeleted) / maxLines) * 100
                );
                return (
                  <div
                    key={i}
                    className="evo-bar-wrapper"
                    onClick={() => setSelectedCommit(commit)}
                    title={`${commit.message}\n+${commit.linesAdded} -${commit.linesDeleted}`}
                  >
                    <div className="evo-bar-container">
                      <div
                        className="evo-bar added"
                        style={{
                          height: `${(commit.linesAdded / maxLines) * 100}%`,
                        }}
                      />
                      <div
                        className="evo-bar deleted"
                        style={{
                          height: `${(commit.linesDeleted / maxLines) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="evo-bar-label">{commit.hash}</span>
                  </div>
                );
              })}
            </div>
            <div className="evo-graph-legend">
              <span><span className="evo-legend-dot added" /> Lines Added</span>
              <span><span className="evo-legend-dot deleted" /> Lines Deleted</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="evo-timeline-section">
            <div className="widget-title">
              <FiClock /> Commit <span style={{ color: "var(--primary)" }}>Timeline</span>
            </div>
            <div className="evo-timeline">
              {timeline.map((commit, i) => (
                <div
                  key={i}
                  className={`evo-commit ${
                    selectedCommit?.hash === commit.hash ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCommit(commit)}
                >
                  <div className="evo-commit-dot" />
                  <div className="evo-commit-content">
                    <div className="evo-commit-header">
                      <span className="evo-commit-hash">{commit.hash}</span>
                      <span className="evo-commit-date">
                        {new Date(commit.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="evo-commit-message">{commit.message}</div>
                    <div className="evo-commit-meta">
                      <span><FiUser /> {commit.author}</span>
                      <span><FiFile /> {commit.filesChanged} files</span>
                      <span className="evo-added">
                        <FiPlus /> {commit.linesAdded}
                      </span>
                      <span className="evo-deleted">
                        <FiMinus /> {commit.linesDeleted}
                      </span>
                    </div>
                    {selectedCommit?.hash === commit.hash &&
                      commit.files?.length > 0 && (
                        <div className="evo-commit-files">
                          {commit.files.map((file, j) => (
                            <div key={j} className="evo-file-item">
                              <FiFile />
                              <span>{file.file}</span>
                              <span className="evo-added">+{file.insertions}</span>
                              <span className="evo-deleted">-{file.deletions}</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          {stats?.topContributors?.length > 0 && (
            <div className="evo-contributors">
              <div className="widget-title">
                <FiUsers /> Top <span style={{ color: "var(--primary)" }}>Contributors</span>
              </div>
              <div className="evo-contributors-list">
                {stats.topContributors.map((contributor, i) => (
                  <div key={i} className="evo-contributor-item">
                    <div className="evo-contributor-rank">#{i + 1}</div>
                    <div className="evo-contributor-name">{contributor.name}</div>
                    <div className="evo-contributor-commits">
                      {contributor.commits} commits
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvolutionPage;