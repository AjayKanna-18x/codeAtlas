import {
  FiX,
  FiFile,
  FiCode,
  FiArrowRight,
  FiArrowLeft,
  FiAlertTriangle,
} from "react-icons/fi";

const NodeInfoPanel = ({ nodeDetails, onClose }) => {
  if (!nodeDetails) return null;

  const { node, connections } = nodeDetails;

  return (
    <div className="node-info-panel">
      {/* ── Header ── */}
      <div className="node-info-header">
        <div className="node-info-title">
          <FiFile />
          <span>{node.label}</span>
        </div>
        <button className="node-info-close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      {/* ── Type Badge ── */}
      <div className="node-info-badges">
        <span className={`node-type-badge type-${node.type}`}>
          {node.type}
        </span>
        {node.isDeadCode && (
          <span className="node-type-badge type-dead">
            <FiAlertTriangle /> Dead Code
          </span>
        )}
      </div>

      {/* ── File Path ── */}
      <div className="node-info-path">
        <span className="node-info-label">Path</span>
        <span className="node-info-value-code">{node.filePath}</span>
      </div>

      {/* ── Stats Grid ── */}
      <div className="node-info-stats">
        <div className="node-stat-item">
          <span className="node-stat-label">Lines of Code</span>
          <span className="node-stat-value">{node.linesOfCode || 0}</span>
        </div>
        <div className="node-stat-item">
          <span className="node-stat-label">Functions</span>
          <span className="node-stat-value">{node.functionCount || 0}</span>
        </div>
        <div className="node-stat-item">
          <span className="node-stat-label">Imports</span>
          <span className="node-stat-value">{node.importCount || 0}</span>
        </div>
        <div className="node-stat-item">
          <span className="node-stat-label">Exports</span>
          <span className="node-stat-value">{node.exportCount || 0}</span>
        </div>
        <div className="node-stat-item">
          <span className="node-stat-label">File Size</span>
          <span className="node-stat-value">
            {node.fileSize
              ? `${(node.fileSize / 1024).toFixed(1)} KB`
              : "0 KB"}
          </span>
        </div>
        <div className="node-stat-item">
          <span className="node-stat-label">Connections</span>
          <span className="node-stat-value">
            {connections?.totalConnections || 0}
          </span>
        </div>
      </div>

      {/* ── Connections ── */}
      {connections && (
        <div className="node-connections">

          {/* Outgoing */}
          {connections.outgoing?.length > 0 && (
            <div className="node-conn-section">
              <div className="node-conn-title">
                <FiArrowRight style={{ color: "#22c55e" }} />
                Depends On ({connections.outgoing.length})
              </div>
              <div className="node-conn-list">
                {connections.outgoing.slice(0, 5).map((dep, i) => (
                  <div key={i} className="node-conn-item outgoing">
                    {dep.split("/").pop()}
                  </div>
                ))}
                {connections.outgoing.length > 5 && (
                  <div className="node-conn-more">
                    +{connections.outgoing.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Incoming */}
          {connections.incoming?.length > 0 && (
            <div className="node-conn-section">
              <div className="node-conn-title">
                <FiArrowLeft style={{ color: "#6366f1" }} />
                Used By ({connections.incoming.length})
              </div>
              <div className="node-conn-list">
                {connections.incoming.slice(0, 5).map((dep, i) => (
                  <div key={i} className="node-conn-item incoming">
                    {dep.split("/").pop()}
                  </div>
                ))}
                {connections.incoming.length > 5 && (
                  <div className="node-conn-more">
                    +{connections.incoming.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No connections */}
          {connections.outgoing?.length === 0 &&
            connections.incoming?.length === 0 && (
              <div className="node-no-connections">
                <FiAlertTriangle style={{ color: "#eab308" }} />
                No connections found — possible dead code
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default NodeInfoPanel;