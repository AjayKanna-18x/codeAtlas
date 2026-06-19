const Dashboard = () => {
  return (
    <div>
      <h1 className="page-title dashboard-title">
        Welcome to <span>CodeAtlas</span>
      </h1>
      <p className="page-subtitle">
        Intelligent Codebase Exploration and Architecture Analysis Platform
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Repositories Analyzed</p>
          <p>0</p>
        </div>
        <div className="stat-card">
          <p>Files Discovered</p>
          <p>0</p>
        </div>
        <div className="stat-card">
          <p>Dependencies Mapped</p>
          <p>0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;