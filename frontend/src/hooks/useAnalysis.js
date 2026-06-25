import { useState, useCallback } from "react";
import {
  getAnalysisSummary,
  runDeadCodeDetection,
  getDeadCodeFiles,
  getFileStats,
} from "../services/apiService";
import toast from "react-hot-toast";

const useAnalysis = () => {
  const [summary, setSummary] = useState(null);
  const [deadCodeFiles, setDeadCodeFiles] = useState([]);
  const [fileStats, setFileStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runningDeadCode, setRunningDeadCode] = useState(false);

  // ── Fetch analysis summary ──
  const fetchSummary = useCallback(async (repoId) => {
    if (!repoId) return;
    setLoading(true);
    try {
      const res = await getAnalysisSummary(repoId);
      setSummary(res.data.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch dead code files ──
  const fetchDeadCode = useCallback(async (repoId) => {
    if (!repoId) return;
    try {
      const [deadRes, statsRes] = await Promise.all([
        getDeadCodeFiles(repoId),
        getFileStats(repoId),
      ]);
      setDeadCodeFiles(deadRes.data.data || []);
      setFileStats(statsRes.data.data || null);
    } catch (error) {
      console.error("Failed to fetch dead code:", error);
    }
  }, []);

  // ── Run dead code detection ──
  const runDeadCode = useCallback(async (repoId) => {
    setRunningDeadCode(true);
    toast.loading("Running dead code detection...", { id: "deadcode" });
    try {
      const res = await runDeadCodeDetection(repoId);
      if (res.data.success) {
        toast.success(
          `Found ${res.data.data.totalDeadFiles} unused files.`,
          { id: "deadcode" }
        );
        await fetchDeadCode(repoId);
        return res.data.data;
      }
    } catch (error) {
      toast.error("Dead code detection failed.", { id: "deadcode" });
    } finally {
      setRunningDeadCode(false);
    }
  }, [fetchDeadCode]);

  return {
    summary,
    deadCodeFiles,
    fileStats,
    loading,
    runningDeadCode,
    fetchSummary,
    fetchDeadCode,
    runDeadCode,
  };
};

export default useAnalysis;