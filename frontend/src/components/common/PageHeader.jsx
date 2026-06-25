const ProgressBar = ({
  value = 0,
  max = 100,
  color = "#6366f1",
  height = 6,
  showLabel = false,
  label = "",
}) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="progress-wrapper">
      {showLabel && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-value">{percentage}%</span>
        </div>
      )}
      <div
        className="progress-track"
        style={{ height: `${height}px` }}
      >
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;