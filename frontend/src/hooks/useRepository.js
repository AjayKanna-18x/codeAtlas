import { useState, useEffect } from "react";
import { getAllRepositories, analyzeRepository } from "../services/apiService";
import toast from "react-hot-toast";

const useRepository = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Fetch all repositories ──
  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const res = await getAllRepositories();
      setRepositories(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch repositories.");
    } finally {
      setLoading(false);
    }
  };

  // ── Analyze repository ──
  const analyze = async (repoId) => {
    setAnalyzing(true);
    toast.loading("Analyzing repository... this may take a moment.", {
      id: "analyze",
    });

    try {
      const res = await analyzeRepository(repoId);
      if (res.data.success) {
        toast.success("Analysis completed successfully!", { id: "analyze" });
        await fetchRepositories();
        return res.data.data;
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Analysis failed. Try again.";
      toast.error(msg, { id: "analyze" });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  return {
    repositories,
    loading,
    analyzing,
    fetchRepositories,
    analyze,
  };
};

export default useRepository;