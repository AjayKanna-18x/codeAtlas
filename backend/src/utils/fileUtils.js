import fs from "fs";
import path from "path";

// ─── Check if path exists ─────────────────────────────────
export const pathExists = (filePath) => {
  return fs.existsSync(filePath);
};

// ─── Get file extension ───────────────────────────────────
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// ─── Check if JavaScript file ─────────────────────────────
export const isJavaScriptFile = (filename) => {
  const ext = getFileExtension(filename);
  return [".js", ".jsx", ".mjs", ".cjs"].includes(ext);
};

// ─── Get file size in bytes ───────────────────────────────
export const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
};

// ─── Count lines in a file ────────────────────────────────
export const countLines = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
};

// ─── Read file content ────────────────────────────────────
export const readFileContent = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
};

// ─── Folders to ignore during scanning ───────────────────
export const IGNORED_FOLDERS = [
  "node_modules",
  ".git",
  ".github",
  "dist",
  "build",
  ".next",
  ".cache",
  "coverage",
  ".vscode",
  ".idea",
  "public",
  "assets",
  "images",
  "fonts",
  "static",
];

// ─── Check if folder should be ignored ───────────────────
export const shouldIgnoreFolder = (folderName) => {
  return IGNORED_FOLDERS.includes(folderName);
};

// ─── Recursively scan directory for JS files ─────────────
export const scanDirectory = (dirPath, baseDir = null) => {
  const files = [];
  const base = baseDir || dirPath;

  if (!pathExists(dirPath)) {
    console.warn(`⚠️ Directory not found: ${dirPath}`);
    return files;
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip ignored folders
        if (shouldIgnoreFolder(entry.name)) continue;

        // Recursively scan subdirectory
        const subFiles = scanDirectory(fullPath, base);
        files.push(...subFiles);

      } else if (entry.isFile()) {
        // Only include JS files
        if (isJavaScriptFile(entry.name)) {
          const relativePath = path.relative(base, fullPath);
          files.push({
            fileName: entry.name,
            filePath: fullPath,
            relativePath: relativePath.replace(/\\/g, "/"),
            extension: getFileExtension(entry.name),
            fileSize: getFileSize(fullPath),
            linesOfCode: countLines(fullPath),
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}: ${error.message}`);
  }

  return files;
};

// ─── Build folder hierarchy JSON ─────────────────────────
export const buildFolderHierarchy = (dirPath, baseDir = null) => {
  const base = baseDir || dirPath;

  if (!pathExists(dirPath)) return null;

  const name = path.basename(dirPath);
  const node = {
    name,
    type: "folder",
    path: path.relative(base, dirPath).replace(/\\/g, "/") || ".",
    children: [],
  };

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (shouldIgnoreFolder(entry.name)) continue;
        const child = buildFolderHierarchy(fullPath, base);
        if (child) node.children.push(child);

      } else if (entry.isFile() && isJavaScriptFile(entry.name)) {
        node.children.push({
          name: entry.name,
          type: "file",
          path: path.relative(base, fullPath).replace(/\\/g, "/"),
          extension: getFileExtension(entry.name),
          size: getFileSize(fullPath),
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error building hierarchy: ${error.message}`);
  }

  return node;
};