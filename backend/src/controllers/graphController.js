import DependencyGraph from "../models/DependencyGraph.js";
import Repository from "../models/Repository.js";
import { convertToReactFlowFormat } from "../services/graphBuilderService.js";

// ─── Get Dependency Graph ─────────────────────────────────
// @route GET /api/graph/:repoId
export const getDependencyGraph = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { format = "raw" } = req.query;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    const graph = await DependencyGraph.findOne({ repositoryId: repoId });

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Graph not found. Please analyze the repository first.",
      });
    }

    // Return in React Flow format if requested
    if (format === "reactflow") {
      const rfData = convertToReactFlowFormat(graph.nodes, graph.edges);
      return res.status(200).json({
        success: true,
        data: {
          nodes: rfData.nodes,
          edges: rfData.edges,
          stats: graph.stats,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        nodes: graph.nodes,
        edges: graph.edges,
        stats: graph.stats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Graph Statistics ─────────────────────────────────
// @route GET /api/graph/:repoId/stats
export const getGraphStats = async (req, res) => {
  try {
    const graph = await DependencyGraph.findOne({
      repositoryId: req.params.repoId,
    });

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Graph not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: graph.stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Node Details ─────────────────────────────────────
// @route GET /api/graph/:repoId/node/:nodeId
export const getNodeDetails = async (req, res) => {
  try {
    const { repoId, nodeId } = req.params;
    const decodedNodeId = decodeURIComponent(nodeId);

    const graph = await DependencyGraph.findOne({ repositoryId: repoId });

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Graph not found.",
      });
    }

    const node = graph.nodes.find((n) => n.id === decodedNodeId);

    if (!node) {
      return res.status(404).json({
        success: false,
        message: "Node not found.",
      });
    }

    // Find connected edges
    const outgoing = graph.edges.filter((e) => e.source === decodedNodeId);
    const incoming = graph.edges.filter((e) => e.target === decodedNodeId);

    return res.status(200).json({
      success: true,
      data: {
        node,
        connections: {
          outgoing: outgoing.map((e) => e.target),
          incoming: incoming.map((e) => e.source),
          totalConnections: outgoing.length + incoming.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};