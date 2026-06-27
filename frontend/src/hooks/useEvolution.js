import { useState, useCallback } from "react";
import {
  getEvolutionTimeline,
  getEvolutionStats,
} from "../services/apiService";
import toast from "react-hot-toast";

const useEvolution = () => {
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTimeline = useCallback(async (repoId, limit = 30) => {
    setLoading(true);
    try {
      const [timelineRes, statsRes] = await Promise.all([
        getEvolutionTimeline(repoId, limit),
        getEvolutionStats(repoId),
      ]);
      setTimeline(timelineRes.data.data.timeline || []);
      setStats(statsRes.data.data || null);
    } catch (error) {
      toast.error("Failed to load evolution data.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { timeline, stats, loading, fetchTimeline };
};

export default useEvolution;