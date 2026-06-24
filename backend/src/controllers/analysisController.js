import AnalysisResult from "../models/AnalysisResult.js";
import Repository from "../models/Repository.js";
import DependencyGraph from "../models/DependencyGraph.js";
import FileMetadata from "../models/FileMetadata.js";
import {
  findIsolatedNodes,
  findEntryPoints,
} from "../utils/graphUtils.js";

// ─── Get Analysis Result ──────────────────────────────────
// @route GET /api/analysis/:repoId
export const getAnalysisResult = async (req, res) => {
  try {
    const analysis = await AnalysisResult.findOne({
      repositoryId: req.params.repoId,
    }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found. Please analyze the repository first.",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Run Dead Code Detection ──────────────────────────────
// @route POST /api/analysis/:repoId/deadcode
export const runDeadCodeDetection = async (req, res) => {
  try {
    const { repoId } = req.params;

    const graph = await DependencyGraph.findOne({ repositoryId: repoId });

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Graph not found. Analyze repository first.",
      });
    }

    // Find isolated nodes (no incoming or outgoing edges)
    const isolated = findIsolatedNodes(graph.nodes, graph.edges);
    const isolatedIds = isolated.map((n) => n.id);

    // Find entry points (no incoming edges but have outgoing)
    const entryPoints = findEntryPoints(graph.nodes, graph.edges);
    const entryPointIds = new Set(entryPoints.map((n) => n.id));

    // Files that are isolated AND not entry points = dead code
    const deadCodeFiles = isolatedIds.filter(
      (id) => !entryPointIds.has(id)
    );

    // Update FileMetadata with dead code flag
    await FileMetadata.updateMany(
      { repositoryId: repoId, relativePath: { $in: deadCodeFiles } },
      { isDeadCode: true }
    );

    await FileMetadata.updateMany(
      { repositoryId: repoId, relativePath: { $nin: deadCodeFiles } },
      { isDeadCode: false }
    );

    // Update graph nodes
    await DependencyGraph.findOneAndUpdate(
      { repositoryId: repoId },
      {
        $set: {
          "nodes.$[elem].isDeadCode": true,
        },
      },
      {
        arrayFilters: [{ "elem.id": { $in: deadCodeFiles } }],
        new: true,
      }
    );

    // Update analysis result
    await AnalysisResult.findOneAndUpdate(
      { repositoryId: repoId },
      {
        "deadCode.unusedFiles": deadCodeFiles,
        "deadCode.isolatedNodes": isolatedIds,
        "deadCode.totalDeadFiles": deadCodeFiles.length,
      },
      { new: true }
    );

    // Update repo stats
    await Repository.findByIdAndUpdate(repoId, {
      "stats.deadCodeFiles": deadCodeFiles.length,
    });

    return res.status(200).json({
      success: true,
      message: "Dead code detection completed.",
      data: {
        totalDeadFiles: deadCodeFiles.length,
        deadCodeFiles,
        isolatedNodes: isolatedIds,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Full Analysis Summary ────────────────────────────
// @route GET /api/analysis/:repoId/summary
export const getAnalysisSummary = async (req, res) => {
  try {
    const { repoId } = req.params;

    const repo = await Repository.findById(repoId);
    const analysis = await AnalysisResult.findOne({ repositoryId: repoId });
    const graph = await DependencyGraph.findOne({ repositoryId: repoId });
    const files = await FileMetadata.find({ repositoryId: repoId });

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        repository: {
          name: repo.name,
          owner: repo.owner,
          status: repo.status,
          stats: repo.stats,
        },
        graph: graph
          ? {
              totalNodes: graph.stats?.totalNodes,
              totalEdges: graph.stats?.totalEdges,
              isolatedNodes: graph.stats?.isolatedNodes,
              mostConnectedFile: graph.stats?.mostConnectedFile,
            }
          : null,
        deadCode: analysis?.deadCode || null,
        architectureSummary: analysis?.architectureSummary || null,
        fileCount: files.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};