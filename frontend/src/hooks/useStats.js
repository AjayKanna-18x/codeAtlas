import { useState, useEffect } from "react";
import { getAllRepositories } from "../services/apiService";

const useStats = () => {
  const [stats, setStats] = useState({
    totalRepos: 0,
    totalFiles: 0,
    totalDependencies: 0,
    totalDeadCode: 0,
    totalLines: 0,
    completedRepos: 0,
    pendingRepos: 0,
    failedRepos: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAllRepositories();
      const repos = res.data.data || [];

      setStats({
        totalRepos: repos.length,
        totalFiles: repos.reduce(
          (sum, r) => sum + (r.stats?.jsFiles || 0), 0
        ),
        totalDependencies: repos.reduce(
          (sum, r) => sum + (r.stats?.totalDependencies || 0), 0
        ),
        totalDeadCode: repos.reduce(
          (sum, r) => sum + (r.stats?.deadCodeFiles || 0), 0
        ),
        totalLines: repos.reduce(
          (sum, r) => sum + (r.stats?.totalLines || 0), 0
        ),
        completedRepos: repos.filter(
          (r) => r.status === "completed"
        ).length,
        pendingRepos: repos.filter(
          (r) => r.status === "pending"
        ).length,
        failedRepos: repos.filter(
          (r) => r.status === "failed"
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, fetchStats };
};

export default useStats;