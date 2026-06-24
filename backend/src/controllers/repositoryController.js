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

// ─── Analyze Repository ───────────────────────────────────
// @route POST /api/repositories/:id/analyze
export const analyzeRepository = async (req, res) => {
  const startTime = Date.now();

  try {
    const repo = await Repository.findById(req.params.id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found.",
      });
    }

    if (!repo.localPath) {
      return res.status(400).json({
        success: false,
        message: "Repository not cloned yet.",
      });
    }

    // Update status to analyzing
    repo.status = "analyzing";
    await repo.save();

    // Step 1 — Scan files
    console.log("📁 Step 1: Scanning files...");
    const files = scanRepository(repo.localPath);

    // Step 2 — Analyze files (AST)
    console.log("🔍 Step 2: Analyzing files with AST...");
    const analyzedFiles = analyzeAllFiles(files, repo.localPath);

    // Step 3 — Build dependency map
    console.log("🔗 Step 3: Building dependency map...");
    const dependencyMap = buildDependencyMap(analyzedFiles, repo.localPath);

    // Step 4 — Build graph
    console.log("📊 Step 4: Building graph...");
    const graph = buildGraph(analyzedFiles, dependencyMap);

    // Step 5 — Save file metadata to MongoDB
    console.log("💾 Step 5: Saving file metadata...");
    await FileMetadata.deleteMany({ repositoryId: repo._id });

    const fileMetaDocs = analyzedFiles.map((file) => ({
      repositoryId: repo._id,
      fileName: file.fileName,
      filePath: file.filePath,
      relativePath: file.relativePath,
      extension: file.extension,
      stats: {
        linesOfCode: file.linesOfCode || 0,
        functionCount: file.functionCount || 0,
        importCount: file.importCount || 0,
        exportCount: file.exportCount || 0,
        fileSize: file.fileSize || 0,
      },
      imports: file.imports || [],
      exports: (file.exports || []).map((e) =>
        typeof e === "string" ? e : e.name || ""
      ),
      isDeadCode: false,
    }));

    await FileMetadata.insertMany(fileMetaDocs);

    // Step 6 — Save dependency graph
    console.log("💾 Step 6: Saving dependency graph...");
    await DependencyGraph.deleteOne({ repositoryId: repo._id });

    const depGraph = new DependencyGraph({
      repositoryId: repo._id,
      nodes: graph.nodes,
      edges: graph.edges,
      stats: graph.stats,
    });

    await depGraph.save();

    // Step 7 — Generate repo stats
    const repoStats = generateRepoStats(analyzedFiles);

    // Step 8 — Update repository
    repo.status = "completed";
    repo.stats = {
      totalFiles: repoStats.totalFiles,
      jsFiles: repoStats.jsFiles,
      totalDependencies: graph.edges.length,
      deadCodeFiles: 0,
      totalLines: repoStats.totalLines,
    };
    await repo.save();

    // Step 9 — Save analysis result
    const analysisResult = new AnalysisResult({
      repositoryId: repo._id,
      status: "completed",
      analysisTime: Date.now() - startTime,
      deadCode: {
        unusedFiles: [],
        isolatedNodes: [],
        totalDeadFiles: 0,
      },
      architectureSummary: {
        pattern: null,
        description: null,
        layers: [],
        suggestions: [],
      },
    });

    await analysisResult.save();

    console.log(`✅ Analysis complete in ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: true,
      message: "Repository analyzed successfully.",
      data: {
        repositoryId: repo._id,
        stats: repo.stats,
        graphStats: graph.stats,
        analysisTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    // Update repo status to failed
    await Repository.findByIdAndUpdate(req.params.id, {
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: `Analysis failed: ${error.message}`,
    });
  }
};