// ─── File Scanner Service ─────────────────────────────────
// Handles recursive directory traversal and JS file detection
// Full implementation → Day 15-20 (File Discovery Engine)

import fs from "fs";
import path from "path";

export const isJavaScriptFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return [".js", ".jsx", ".mjs", ".cjs"].includes(ext);
};

export const directoryExists = (dirPath) => {
  return fs.existsSync(dirPath);
};

// Placeholder — full recursive scanner coming Day 15
export const scanDirectory = (dirPath) => {
  console.log(`📁 Scanner ready for: ${dirPath}`);
  return [];
};