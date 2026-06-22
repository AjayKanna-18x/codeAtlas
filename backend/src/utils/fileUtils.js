import fs from "fs";
import path from "path";

// Check if a path exists
export const pathExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Get file extension
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Check if file is a JavaScript file
export const isJavaScriptFile = (filename) => {
  const ext = getFileExtension(filename);
  return [".js", ".jsx", ".mjs", ".cjs"].includes(ext);
};