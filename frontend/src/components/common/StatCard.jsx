const StatCard = ({
  label,
  value,
  icon,
  footer,
  color = "#6366f1",
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon" style={{ color }}>
          {icon}
        </span>
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      {footer && (
        <div className="stat-card-footer">{footer}</div>
      )}
    </div>
  );
};

export default StatCard;