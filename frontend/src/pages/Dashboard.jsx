const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome to <span className="text-accent">CodeAtlas</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Intelligent Codebase Exploration and Architecture Analysis Platform
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {["Repositories Analyzed", "Files Discovered", "Dependencies Mapped"].map((item) => (
          <div
            key={item}
            className="bg-secondary rounded-xl p-6 border border-slate-700"
          >
            <p className="text-slate-400 text-sm">{item}</p>
            <p className="text-3xl font-bold text-white mt-2">0</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;