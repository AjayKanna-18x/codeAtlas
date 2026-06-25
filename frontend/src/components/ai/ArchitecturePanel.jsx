import {
  FiLayers,
  FiCheckCircle,
  FiAlertTriangle,
  FiGrid,
} from "react-icons/fi";

const ArchitecturePanel = ({ data }) => {
  if (!data) return null;

  const typeColors = {
    controller: "#3b82f6",
    service: "#22c55e",
    model: "#ef4444",
    route: "#a855f7",
    middleware: "#eab308",
    util: "#06b6d4",
    config: "#6366f1",
    unknown: "#475569",
  };

  return (
    <div className="arch-panel">

      {/* ── Pattern ── */}
      <div className="arch-pattern-card">
        <div className="arch-pattern-label">Architecture Pattern</div>
        <div className="arch-pattern-value">{data.pattern}</div>
        <div className="arch-confidence">
          <div
            className="arch-confidence-bar"
            style={{ width: `${data.confidence}%` }}
          />
        </div>
        <div className="arch-confidence-label">
          {data.confidence}% confidence
        </div>
      </div>

      {/* ── File Types ── */}
      {data.fileTypes && (
        <div className="arch-section">
          <div className="arch-section-title">
            <FiGrid /> File Distribution
          </div>
          <div className="arch-types-grid">
            {Object.entries(data.fileTypes)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => (
                <div key={type} className="arch-type-item">
                  <div
                    className="arch-type-dot"
                    style={{
                      background: typeColors[type] || "#475569",
                    }}
                  />
                  <span className="arch-type-name">{type}</span>
                  <span className="arch-type-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Layers ── */}
      {data.layers?.length > 0 && (
        <div className="arch-section">
          <div className="arch-section-title">
            <FiLayers /> Detected Layers
          </div>
          <div className="arch-layers-list">
            {data.layers.map((layer, i) => (
              <div key={i} className="arch-layer-item">
                <FiCheckCircle style={{ color: "#22c55e" }} />
                <span>{layer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {data.suggestions?.length > 0 && (
        <div className="arch-section">
          <div className="arch-section-title">
            <FiAlertTriangle style={{ color: "#eab308" }} />
            Suggestions
          </div>
          <div className="arch-suggestions-list">
            {data.suggestions.map((suggestion, i) => (
              <div key={i} className="arch-suggestion-item">
                <span className="arch-suggestion-arrow">→</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitecturePanel;