import FileMetadata from "../models/FileMetadata.js";
import Repository from "../models/Repository.js";

// ─── Get All Files for Repository ────────────────────────
// @route GET /api/files/:repoId
export const getFilesByRepo = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { search, sort = "fileName" } = req.query;

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    let query = { repositoryId: repoId };

    // Search filter
    if (search) {
      query.fileName = { $regex: search, $options: "i" };
    }

    const files = await FileMetadata.find(query).sort({ [sort]: 1 });

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Single File ──────────────────────────────────────
// @route GET /api/files/single/:fileId
export const getFileById = async (req, res) => {
  try {
    const file = await FileMetadata.findById(req.params.fileId).populate(
      "repositoryId",
      "name owner"
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get File Statistics Summary ──────────────────────────
// @route GET /api/files/:repoId/stats
export const getFileStats = async (req, res) => {
  try {
    const { repoId } = req.params;

    const files = await FileMetadata.find({ repositoryId: repoId });

    if (files.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalFiles: 0,
          totalLines: 0,
          totalFunctions: 0,
          totalImports: 0,
          deadCodeFiles: 0,
          averageLines: 0,
          largestFile: null,
        },
      });
    }

    const totalLines = files.reduce(
      (sum, f) => sum + (f.stats?.linesOfCode || 0),
      0
    );
    const totalFunctions = files.reduce(
      (sum, f) => sum + (f.stats?.functionCount || 0),
      0
    );
    const totalImports = files.reduce(
      (sum, f) => sum + (f.stats?.importCount || 0),
      0
    );
    const deadCodeFiles = files.filter((f) => f.isDeadCode).length;

    const largestFile = files.reduce((max, f) =>
      (f.stats?.linesOfCode || 0) > (max.stats?.linesOfCode || 0) ? f : max
    );

    return res.status(200).json({
      success: true,
      data: {
        totalFiles: files.length,
        totalLines,
        totalFunctions,
        totalImports,
        deadCodeFiles,
        averageLines: Math.round(totalLines / files.length),
        largestFile: {
          name: largestFile.fileName,
          lines: largestFile.stats?.linesOfCode,
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

// ─── Get Dead Code Files ──────────────────────────────────
// @route GET /api/files/:repoId/deadcode
export const getDeadCodeFiles = async (req, res) => {
  try {
    const files = await FileMetadata.find({
      repositoryId: req.params.repoId,
      isDeadCode: true,
    });

    return res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};