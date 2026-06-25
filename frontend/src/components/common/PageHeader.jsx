const PageHeader = ({ title, highlight, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">
          {title}{" "}
          {highlight && (
            <span style={{ color: "#6366f1" }}>{highlight}</span>
          )}
        </h1>
        {subtitle && (
          <p className="page-subtitle">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="page-header-actions">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;