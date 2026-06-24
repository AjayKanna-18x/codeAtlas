import {
  validateRepository,
  extractRepoInfo,
  cloneRepository,
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

// ─── Get Single Repository ────────────────────────────────
// @route  GET /api/repositories/:id
export const getRepositoryById = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: repo,
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
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required.",
      });
    }

    // Step 1 — Validate repository
    console.log("🔍 Step 1: Validating repository...");
    const validation = await validateRepository(repoUrl);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        step: validation.step,
      });
    }

    const repoData = validation.data;

    // Step 2 — Check if already imported
    console.log("🔍 Step 2: Checking for duplicates...");
    const existingRepo = await Repository.findOne({
      githubUrl: repoUrl.trim(),
    });

    if (existingRepo) {
      return res.status(200).json({
        success: true,
        message: "Repository already imported.",
        data: existingRepo,
        alreadyExists: true,
      });
    }

    // Step 3 — Clone repository
    console.log("📥 Step 3: Cloning repository...");
    const cloneResult = await cloneRepository(
      repoData.cloneUrl,
      repoData.name
    );

    if (!cloneResult.success) {
      return res.status(500).json({
        success: false,
        message: cloneResult.message,
      });
    }

    // Step 4 — Save to MongoDB
    console.log("💾 Step 4: Saving to database...");
    const repository = new Repository({
      name: repoData.name,
      owner: repoData.owner,
      sourceType: "github",
      githubUrl: repoUrl.trim(),
      localPath: cloneResult.clonePath,
      status: "pending",
      description: repoData.description,
      stats: {
        totalFiles: 0,
        jsFiles: 0,
        totalDependencies: 0,
        deadCodeFiles: 0,
        totalLines: 0,
      },
    });

    await repository.save();
    console.log(`✅ Repository saved: ${repository._id}`);

    return res.status(201).json({
      success: true,
      message: "Repository imported and cloned successfully.",
      data: {
        repositoryId: repository._id,
        name: repository.name,
        owner: repository.owner,
        status: repository.status,
        localPath: cloneResult.clonePath,
        githubData: repoData,
      },
    });

  } catch (error) {
    console.error(`❌ Import error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Import failed: ${error.message}`,
    });
  }
};