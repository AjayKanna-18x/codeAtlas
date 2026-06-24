import path from "path";
import {
  scanDirectory,
  buildFolderHierarchy,
  readFileContent,
  pathExists,
} from "../utils/fileUtils.js";
import {
  parseFileToAST,
  extractImports,
  extractExports,
  countFunctions,
} from "../utils/astUtils.js";

// ─── Scan Repository and Return File List ─────────────────
export const scanRepository = (repoPath) => {
  console.log(`📁 Scanning repository: ${repoPath}`);

  if (!pathExists(repoPath)) {
    throw new Error(`Repository path not found: ${repoPath}`);
  }

  const files = scanDirectory(repoPath);

  console.log(`✅ Found ${files.length} JavaScript files`);

  return files;
};

// ─── Build Folder Hierarchy ───────────────────────────────
export const getRepositoryHierarchy = (repoPath) => {
  if (!pathExists(repoPath)) {
    throw new Error(`Repository path not found: ${repoPath}`);
  }

  return buildFolderHierarchy(repoPath);
};

// ─── Analyze Single File ──────────────────────────────────
export const analyzeFile = (fileInfo, projectRoot) => {
  const content = readFileContent(fileInfo.filePath);

  if (!content) {
    return {
      ...fileInfo,
      imports: [],
      exports: [],
      functionCount: 0,
      importCount: 0,
      exportCount: 0,
      parseError: true,
    };
  }

  // Parse AST
  const { success, ast, error } = parseFileToAST(content, fileInfo.filePath);

  if (!success || !ast) {
    return {
      ...fileInfo,
      imports: [],
      exports: [],
      functionCount: 0,
      importCount: 0,
      exportCount: 0,
      parseError: true,
      parseErrorMsg: error,
    };
  }

  // Extract data from AST
  const imports = extractImports(ast);
  const exports = extractExports(ast);
  const functionCount = countFunctions(ast);

  return {
    ...fileInfo,
    imports,
    exports,
    functionCount,
    importCount: imports.length,
    exportCount: exports.length,
    parseError: false,
  };
};

// ─── Analyze All Files in Repository ─────────────────────
export const analyzeAllFiles = (files, projectRoot) => {
  console.log(`🔍 Analyzing ${files.length} files...`);

  const analyzed = [];
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const result = analyzeFile(file, projectRoot);
    analyzed.push(result);

    if (result.parseError) {
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`✅ Analyzed: ${successCount} success, ${errorCount} errors`);

  return analyzed;
};

// ─── Generate Repository Stats ────────────────────────────
export const generateRepoStats = (analyzedFiles) => {
  const totalFiles = analyzedFiles.length;
  const jsFiles = analyzedFiles.filter((f) => !f.parseError).length;
  const totalLines = analyzedFiles.reduce(
    (sum, f) => sum + (f.linesOfCode || 0),
    0
  );
  const totalFunctions = analyzedFiles.reduce(
    (sum, f) => sum + (f.functionCount || 0),
    0
  );
  const totalImports = analyzedFiles.reduce(
    (sum, f) => sum + (f.importCount || 0),
    0
  );

  return {
    totalFiles,
    jsFiles,
    totalLines,
    totalFunctions,
    totalImports,
    averageLinesPerFile: totalFiles > 0
      ? Math.round(totalLines / totalFiles)
      : 0,
  };
};