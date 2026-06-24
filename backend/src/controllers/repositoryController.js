import {
  validateRepository,
  cloneRepository,
} from "../services/repositoryService.js";
import {
  scanRepository,
  analyzeAllFiles,
  getRepositoryHierarchy,
  generateRepoStats,
} from "../services/fileScannerService.js";
import {
  buildDependencyMap,
} from "../services/dependencyAnalyzerService.js";
import {
  buildGraph,
} from "../services/graphBuilderService.js";
import Repository from "../models/Repository.js";
import FileMetadata from "../models/FileMetadata.js";
import DependencyGraph from "../models/DependencyGraph.js";
import AnalysisResult from "../models/AnalysisResult.js";

// ─── Validate Repository ──────────────────────────────────
// @route POST /api/repositories/validate
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
// @route GET /api/repositories
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

// ─── Get Repository By ID ─────────────────────────────────
// @route GET /api/repositories/:id
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

// ─── Delete Repository ────────────────────────────────────
// @route DELETE /api/repositories/:id
export const deleteRepository = async (req, res) => {
  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    // Delete associated data
    await FileMetadata.deleteMany({ repositoryId: repo._id });
    await DependencyGraph.deleteOne({ repositoryId: repo._id });
    await AnalysisResult.deleteMany({ repositoryId: repo._id });
    await Repository.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Repository and all associated data deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Import Repository ────────────────────────────────────
// @route POST /api/repositories/import
export const importRepository = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        message: "Repository URL is required.",
      });
    }

    // Step 1 — Validate
    console.log("🔍 Step 1: Validating...");
    const validation = await validateRepository(repoUrl);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        step: validation.step,
      });
    }

    const repoData = validation.data;

    // Step 2 — Check duplicate
    console.log("🔍 Step 2: Checking duplicates...");
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

    // Step 3 — Clone
    console.log("📥 Step 3: Cloning...");
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
    console.log("💾 Step 4: Saving metadata...");
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

    return res.status(201).json({
      success: true,
      message: "Repository imported successfully.",
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
    return res.status(500).json({
      success: false,
      message: `Import failed: ${error.message}`,
    });
  }
};

// Step 5 — Save file metadata to MongoDB
console.log("💾 Step 5: Saving file metadata...");
await FileMetadata.deleteMany({ repositoryId: repo._id });

const fileMetaDocs = analyzedFiles.map((file) => {
  // ✅ Safely format imports
  const safeImports = (file.imports || []).map((imp) => {
    if (typeof imp === "string") {
      return { source: imp, specifiers: [], type: "static" };
    }
    return {
      source: imp.source || "",
      specifiers: Array.isArray(imp.specifiers) ? imp.specifiers : [],
      type: imp.type || "static",
    };
  });

  // ✅ Safely format exports
  const safeExports = (file.exports || []).map((exp) => {
    if (typeof exp === "string") return { name: exp, type: "named" };
    return {
      name: exp.name || "",
      type: exp.type || "named",
    };
  });

  return {
    repositoryId: repo._id,
    fileName: file.fileName,
    filePath: file.filePath,
    relativePath: file.relativePath,
    extension: file.extension || ".js",
    stats: {
      linesOfCode: file.linesOfCode || 0,
      functionCount: file.functionCount || 0,
      importCount: file.importCount || 0,
      exportCount: file.exportCount || 0,
      fileSize: file.fileSize || 0,
    },
    imports: safeImports,
    exports: safeExports,
    isDeadCode: false,
  };
});

await FileMetadata.insertMany(fileMetaDocs);