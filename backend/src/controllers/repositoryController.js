import {
  validateRepository,
  extractRepoInfo,
} from "../services/repositoryService.js";
import Repository from "../models/Repository.js";

// ─── Validate Repository ──────────────────────────────────
// @route  POST /api/repositories/validate
export const validateRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required.",
      });
    }

    const result = await validateRepository(repoUrl);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
        step: result.step,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      step: result.step,
      data: result.data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Validation failed: ${error.message}`,
    });
  }
};

// ─── Get All Repositories ─────────────────────────────────
// @route  GET /api/repositories
export const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: repositories.length,
      data: repositories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Import Repository ────────────────────────────────────
// @route  POST /api/repositories/import
export const importRepository = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Import endpoint ready — full implementation Day 10.",
    data: null,
  });
};