import {
  generateFileSummary,
  generateModuleExplanation,
  generateArchitectureExplanation,
  answerCodebaseQuestion,
  generateProjectSummary,
} from "../services/aiExplanationService.js";
import {
  generateFullArchitectureSummary,
} from "../services/architectureSummaryService.js";
import Repository from "../models/Repository.js";
import FileMetadata from "../models/FileMetadata.js";
import DependencyGraph from "../models/DependencyGraph.js";
import AnalysisResult from "../models/AnalysisResult.js";

// ─── Get AI File Summary ──────────────────────────────────
// @route POST /api/ai/file-summary
export const getFileSummary = async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "File ID is required.",
      });
    }

    const file = await FileMetadata.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    console.log(`🤖 Generating AI summary for: ${file.fileName}`);
    const summary = await generateFileSummary(file);

    // Save AI summary to file
    await FileMetadata.findByIdAndUpdate(fileId, {
      aiSummary: summary,
    });

    return res.status(200).json({
      success: true,
      data: {
        fileName: file.fileName,
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `AI generation failed: ${error.message}`,
    });
  }
};

// ─── Get Module Explanation ───────────────────────────────
// @route POST /api/ai/module-explain
export const getModuleExplanation = async (req, res) => {
  try {
    const { fileId, repoId } = req.body;

    if (!fileId || !repoId) {
      return res.status(400).json({
        success: false,
        message: "File ID and Repository ID are required.",
      });
    }

    const file = await FileMetadata.findById(fileId);
    const graph = await DependencyGraph.findOne({
      repositoryId: repoId,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    // Get connections from graph
    let dependsOn = [];
    let usedBy = [];

    if (graph) {
      const outgoing = graph.edges.filter(
        (e) => e.source === file.relativePath
      );
      const incoming = graph.edges.filter(
        (e) => e.target === file.relativePath
      );

      dependsOn = outgoing.map((e) => e.target);
      usedBy = incoming.map((e) => e.source);
    }

    const moduleData = {
      fileName: file.fileName,
      relativePath: file.relativePath,
      type: file.type || "unknown",
      dependsOn,
      usedBy,
    };

    console.log(
      `🤖 Generating module explanation for: ${file.fileName}`
    );
    const explanation = await generateModuleExplanation(moduleData);

    return res.status(200).json({
      success: true,
      data: {
        fileName: file.fileName,
        explanation,
        connections: {
          dependsOn,
          usedBy,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Module explanation failed: ${error.message}`,
    });
  }
};

// ─── Get Architecture Explanation ─────────────────────────
// @route POST /api/ai/architecture
export const getArchitectureExplanation = async (req, res) => {
  try {
    const { repoId } = req.body;

    if (!repoId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    const repo = await Repository.findById(repoId);
    const graph = await DependencyGraph.findOne({
      repositoryId: repoId,
    });
    const files = await FileMetadata.find({ repositoryId: repoId });

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: "Graph not found. Analyze repository first.",
      });
    }

    console.log(
      `🤖 Generating architecture summary for: ${repo.name}`
    );

    const architectureSummary = await generateFullArchitectureSummary(
      files,
      graph.stats
    );

    // Save to analysis result
    await AnalysisResult.findOneAndUpdate(
      { repositoryId: repoId },
      {
        architectureSummary: {
          pattern: architectureSummary.pattern,
          description: architectureSummary.aiDescription,
          layers: architectureSummary.layers,
          suggestions: architectureSummary.suggestions,
        },
      },
      { new: true, upsert: true }
    );

    // Update repository
    await Repository.findByIdAndUpdate(repoId, {
      architecturePattern: architectureSummary.pattern,
    });

    return res.status(200).json({
      success: true,
      data: architectureSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Architecture analysis failed: ${error.message}`,
    });
  }
};

// ─── Answer Codebase Question ─────────────────────────────
// @route POST /api/ai/question
export const askCodebaseQuestion = async (req, res) => {
  try {
    const { question, repoId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    if (!repoId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    const repo = await Repository.findById(repoId);
    const files = await FileMetadata.find({ repositoryId: repoId });
    const graph = await DependencyGraph.findOne({
      repositoryId: repoId,
    });

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    const contextData = {
      totalFiles: repo.stats?.totalFiles || 0,
      totalDependencies: repo.stats?.totalDependencies || 0,
      deadCodeFiles: repo.stats?.deadCodeFiles || 0,
      mostConnectedFile: graph?.stats?.mostConnectedFile || null,
      files: files.slice(0, 30),
    };

    console.log(`🤖 Answering question: ${question}`);
    const answer = await answerCodebaseQuestion(question, contextData);

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        repoName: `${repo.owner}/${repo.name}`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Question answering failed: ${error.message}`,
    });
  }
};

// ─── Generate Project Summary ─────────────────────────────
// @route POST /api/ai/project-summary
export const getProjectSummary = async (req, res) => {
  try {
    const { repoId } = req.body;

    if (!repoId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    console.log(`🤖 Generating project summary for: ${repo.name}`);
    const summary = await generateProjectSummary(repo);

    // Save AI summary
    await AnalysisResult.findOneAndUpdate(
      { repositoryId: repoId },
      { aiProjectSummary: summary },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: {
        repoName: `${repo.owner}/${repo.name}`,
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Project summary failed: ${error.message}`,
    });
  }
};