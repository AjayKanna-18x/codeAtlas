import path from "path";
import { resolveImportPath } from "../utils/astUtils.js";

// ─── Build Dependency Map ─────────────────────────────────
export const buildDependencyMap = (analyzedFiles, projectRoot) => {
  console.log(`🔗 Building dependency map for ${analyzedFiles.length} files...`);

  const dependencyMap = {};

  // Create a set of all known internal file paths
  const knownFiles = new Set(
    analyzedFiles.map((f) => f.relativePath)
  );

  for (const file of analyzedFiles) {
    const fileDeps = [];

    for (const imp of file.imports || []) {
      const resolved = resolveImportPath(
        imp.source,
        file.filePath,
        projectRoot
      );

      if (resolved.type === "internal") {
        // Try with and without .js extension
        let resolvedPath = resolved.resolved;

        // Check if the resolved path exists in known files
        if (
          knownFiles.has(resolvedPath) ||
          knownFiles.has(resolvedPath.replace(".js", ".jsx")) ||
          knownFiles.has(resolvedPath.replace(".js", "/index.js"))
        ) {
          // Normalize path
          if (!knownFiles.has(resolvedPath)) {
            if (knownFiles.has(resolvedPath.replace(".js", ".jsx"))) {
              resolvedPath = resolvedPath.replace(".js", ".jsx");
            } else if (
              knownFiles.has(resolvedPath.replace(".js", "/index.js"))
            ) {
              resolvedPath = resolvedPath.replace(".js", "/index.js");
            }
          }

          fileDeps.push({
            source: file.relativePath,
            target: resolvedPath,
            importType: imp.type,
            specifiers: imp.specifiers,
          });
        }
      }
    }

    dependencyMap[file.relativePath] = fileDeps;
  }

  console.log(`✅ Dependency map built`);
  return dependencyMap;
};

// ─── Flatten Dependency Map to Edges ─────────────────────
export const flattenDependencies = (dependencyMap) => {
  const edges = [];

  Object.values(dependencyMap).forEach((deps) => {
    deps.forEach((dep) => {
      // Avoid duplicate edges
      const exists = edges.some(
        (e) => e.source === dep.source && e.target === dep.target
      );
      if (!exists) {
        edges.push({
          source: dep.source,
          target: dep.target,
          type: dep.importType || "import",
        });
      }
    });
  });

  return edges;
};

// ─── Get File Dependencies ────────────────────────────────
export const getFileDependencies = (filePath, dependencyMap) => {
  return dependencyMap[filePath] || [];
};

// ─── Get Files That Depend on a File ─────────────────────
export const getDependents = (filePath, dependencyMap) => {
  const dependents = [];

  Object.entries(dependencyMap).forEach(([file, deps]) => {
    const dependsOnTarget = deps.some((d) => d.target === filePath);
    if (dependsOnTarget) {
      dependents.push(file);
    }
  });

  return dependents;
};

// ─── Calculate Dependency Depth ───────────────────────────
export const calculateDependencyDepth = (
  filePath,
  dependencyMap,
  visited = new Set()
) => {
  if (visited.has(filePath)) return 0;
  visited.add(filePath);

  const deps = dependencyMap[filePath] || [];
  if (deps.length === 0) return 0;

  const depths = deps.map((dep) =>
    calculateDependencyDepth(dep.target, dependencyMap, new Set(visited))
  );

  return 1 + Math.max(...depths);
};