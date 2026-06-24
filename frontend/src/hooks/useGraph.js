import { useState, useCallback } from "react";
import {
  getDependencyGraph,
  getGraphStats,
  getNodeDetails,
} from "../services/apiService";
import toast from "react-hot-toast";

const useGraph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetails, setNodeDetails] = useState(null);

  // ── Fetch graph data ──
  const fetchGraph = useCallback(async (repoId) => {
    setLoading(true);
    try {
      const res = await getDependencyGraph(repoId, "reactflow");
      const data = res.data.data;

      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setStats(data.stats || null);
    } catch (error) {
      toast.error("Failed to load dependency graph.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch node details on click ──
  const fetchNodeDetails = useCallback(async (repoId, nodeId) => {
    try {
      const res = await getNodeDetails(repoId, nodeId);
      setNodeDetails(res.data.data);
      setSelectedNode(nodeId);
    } catch (error) {
      console.error("Failed to fetch node details:", error);
    }
  }, []);

  // ── Clear selection ──
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setNodeDetails(null);
  }, []);

  return {
    nodes,
    edges,
    stats,
    loading,
    selectedNode,
    nodeDetails,
    fetchGraph,
    fetchNodeDetails,
    clearSelection,
    setNodes,
    setEdges,
  };
};

export default useGraph;