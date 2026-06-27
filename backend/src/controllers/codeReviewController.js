import {
  reviewFile,
  reviewProject,
  parseReviewScore,
} from "../services/codeReviewService.js";
import Repository from "../models/Repository.js";
import FileMetadata from "../models/FileMetadata.js";

// ─── Review Single File ──────────────────────────────────
// @route POST /api/review/file
export const reviewSingleFile = async (req, res) => {
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

    console.log(`🔍 Reviewing file: ${file.fileName}`);
    const review = await reviewFile(file);
    const scores = parseReviewScore(review);

    return res.status(200).json({
      success: true,
      data: {
        fileName: file.fileName,
        relativePath: file.relativePath,
        review,
        scores,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `File review failed: ${error.message}`,
    });
  }
};

// ─── Review Entire Project ────────────────────────────────
// @route POST /api/review/project
export const reviewFullProject = async (req, res) => {
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

    const files = await FileMetadata.find({
      repositoryId: repoId,
    });

    console.log(`🔍 Reviewing project: ${repo.name}`);
    const review = await reviewProject(repo, files);
    const scores = parseReviewScore(review);

    return res.status(200).json({
      success: true,
      data: {
        repoName: `${repo.owner}/${repo.name}`,
        review,
        scores,
        totalFiles: files.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Project review failed: ${error.message}`,
    });
  }
};

// ─── Get Batch File Reviews ──────────────────────────────
// @route POST /api/review/batch
export const reviewBatchFiles = async (req, res) => {
  try {
    const { repoId, limit = 5 } = req.body;

    if (!repoId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required.",
      });
    }

    const files = await FileMetadata.find({
      repositoryId: repoId,
    })
      .sort({ "stats.linesOfCode": -1 })
      .limit(limit);

    console.log(`🔍 Batch reviewing ${files.length} files`);

    const reviews = [];

    for (const file of files) {
      try {
        const review = await reviewFile(file);
        const scores = parseReviewScore(review);

        reviews.push({
          fileId: file._id,
          fileName: file.fileName,
          relativePath: file.relativePath,
          linesOfCode: file.stats?.linesOfCode || 0,
          review,
          scores,
        });

        // Rate limit delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        reviews.push({
          fileId: file._id,
          fileName: file.fileName,
          relativePath: file.relativePath,
          linesOfCode: file.stats?.linesOfCode || 0,
          review: `Review failed: ${error.message}`,
          scores: { score: null, risk: null },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalReviewed: reviews.length,
        reviews,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Batch review failed: ${error.message}`,
    });
  }
};