import {
  buildEvolutionTimeline,
  getEvolutionStats,
  getFileHistory,
} from "../services/evolutionService.js";
import Repository from "../models/Repository.js";

// ─── Get Evolution Timeline ───────────────────────────────
// @route GET /api/evolution/:repoId/timeline
export const getTimeline = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    if (!repo.localPath) {
      return res.status(400).json({
        success: false,
        message: "Repository not cloned.",
      });
    }

    const maxCount = parseInt(req.query.limit) || 30;
    console.log(
      `📊 Building timeline for: ${repo.name} (${maxCount} commits)`
    );

    const timeline = await buildEvolutionTimeline(
      repo.localPath,
      maxCount
    );

    return res.status(200).json({
      success: true,
      data: {
        repoName: `${repo.owner}/${repo.name}`,
        timeline,
        total: timeline.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Timeline failed: ${error.message}`,
    });
  }
};

// ─── Get Evolution Stats ──────────────────────────────────
// @route GET /api/evolution/:repoId/stats
export const getStats = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    console.log(`📊 Getting evolution stats for: ${repo.name}`);
    const stats = await getEvolutionStats(repo.localPath);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Stats failed: ${error.message}`,
    });
  }
};

// ─── Get File History ─────────────────────────────────────
// @route POST /api/evolution/:repoId/file-history
export const getFileHistoryRoute = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.repoId);
    const { filePath } = req.body;

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "File path is required.",
      });
    }

    const history = await getFileHistory(repo.localPath, filePath);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `File history failed: ${error.message}`,
    });
  }
};