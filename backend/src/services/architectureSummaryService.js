import { generateArchitectureExplanation } from "./aiExplanationService.js";

// ─── Detect Architecture Pattern ─────────────────────────
export const detectArchitecturePattern = (files) => {
  const paths = files.map((f) => f.relativePath.toLowerCase());

  const counts = {
    controllers: paths.filter((p) => p.includes("controller")).length,
    services: paths.filter((p) => p.includes("service")).length,
    models: paths.filter((p) => p.includes("model")).length,
    routes: paths.filter((p) => p.includes("route")).length,
    middleware: paths.filter((p) => p.includes("middleware")).length,
    utils: paths.filter((p) =>
      p.includes("util") || p.includes("helper")
    ).length,
    components: paths.filter((p) => p.includes("component")).length,
    pages: paths.filter((p) => p.includes("page")).length,
    hooks: paths.filter((p) => p.includes("hook")).length,
    reducers: paths.filter((p) => p.includes("reducer")).length,
    actions: paths.filter((p) => p.includes("action")).length,
    store: paths.filter((p) => p.includes("store")).length,
  };

  // ── Detect pattern ──
  let pattern = "Unknown";
  let confidence = 0;

  // MVC Pattern
  if (
    counts.controllers > 0 &&
    counts.models > 0 &&
    counts.routes > 0
  ) {
    pattern = "MVC (Model-View-Controller)";
    confidence = Math.min(
      100,
      (counts.controllers + counts.models + counts.routes) * 15
    );
  }

  // Layered Architecture
  else if (
    counts.controllers > 0 &&
    counts.services > 0 &&
    counts.models > 0
  ) {
    pattern = "Layered Architecture";
    confidence = Math.min(
      100,
      (counts.controllers + counts.services + counts.models) * 12
    );
  }

  // React Component Architecture
  else if (counts.components > 2 && counts.pages > 0) {
    pattern = "React Component Architecture";
    confidence = Math.min(
      100,
      (counts.components + counts.pages) * 10
    );
  }

  // Redux Pattern
  else if (
    counts.reducers > 0 &&
    counts.actions > 0 &&
    counts.store > 0
  ) {
    pattern = "Redux State Management";
    confidence = Math.min(
      100,
      (counts.reducers + counts.actions + counts.store) * 20
    );
  }

  // Service-Based
  else if (counts.services > 2) {
    pattern = "Service-Based Architecture";
    confidence = Math.min(100, counts.services * 15);
  }

  // Utility-Based
  else if (counts.utils > 2) {
    pattern = "Utility-Based Structure";
    confidence = Math.min(100, counts.utils * 15);
  }

  return {
    pattern,
    confidence,
    counts,
  };
};

// ─── Detect Layers ────────────────────────────────────────
export const detectLayers = (files) => {
  const layers = [];
  const paths = files.map((f) => f.relativePath.toLowerCase());

  if (paths.some((p) => p.includes("route"))) {
    layers.push("Routes Layer — HTTP request routing");
  }
  if (paths.some((p) => p.includes("controller"))) {
    layers.push("Controller Layer — Request/response handling");
  }
  if (paths.some((p) => p.includes("service"))) {
    layers.push("Service Layer — Business logic");
  }
  if (paths.some((p) => p.includes("model"))) {
    layers.push("Model Layer — Data modeling");
  }
  if (paths.some((p) => p.includes("middleware"))) {
    layers.push("Middleware Layer — Request processing");
  }
  if (
    paths.some((p) => p.includes("util") || p.includes("helper"))
  ) {
    layers.push("Utility Layer — Shared helpers");
  }
  if (paths.some((p) => p.includes("config"))) {
    layers.push("Configuration Layer — App configuration");
  }
  if (paths.some((p) => p.includes("component"))) {
    layers.push("Component Layer — UI components");
  }

  return layers;
};

// ─── Generate Suggestions ─────────────────────────────────
export const generateSuggestions = (files, graphStats) => {
  const suggestions = [];

  // Dead code suggestion
  if (graphStats.isolatedNodes > 0) {
    suggestions.push(
      `Found ${graphStats.isolatedNodes} isolated files — consider removing unused modules`
    );
  }

  // Large files
  const largeFiles = files.filter(
    (f) => (f.stats?.linesOfCode || 0) > 300
  );
  if (largeFiles.length > 0) {
    suggestions.push(
      `${largeFiles.length} files exceed 300 lines — consider splitting into smaller modules`
    );
  }

  // High dependency count
  if (graphStats.mostConnectedCount > 10) {
    suggestions.push(
      `File "${graphStats.mostConnectedFile}" has ${graphStats.mostConnectedCount} connections — potential god module`
    );
  }

  // Circular dependencies
  if (graphStats.circularDependencies > 0) {
    suggestions.push(
      `${graphStats.circularDependencies} circular dependencies detected — refactor to avoid coupling`
    );
  }

  // No tests
  const testFiles = files.filter(
    (f) =>
      f.relativePath.includes("test") ||
      f.relativePath.includes("spec")
  );
  if (testFiles.length === 0) {
    suggestions.push(
      "No test files detected — consider adding unit tests"
    );
  }

  return suggestions;
};

// ─── Generate Full Architecture Summary ───────────────────
export const generateFullArchitectureSummary = async (
  files,
  graphStats
) => {
  // Detect pattern
  const patternResult = detectArchitecturePattern(files);

  // Detect layers
  const layers = detectLayers(files);

  // Generate suggestions
  const suggestions = generateSuggestions(files, graphStats);

  // Count file types
  const fileTypes = {};
  files.forEach((f) => {
    const type = f.type || "unknown";
    fileTypes[type] = (fileTypes[type] || 0) + 1;
  });

  // Generate AI explanation
  let aiDescription = null;
  try {
    aiDescription = await generateArchitectureExplanation({
      totalNodes: graphStats.totalNodes,
      totalEdges: graphStats.totalEdges,
      isolatedNodes: graphStats.isolatedNodes,
      mostConnectedFile: graphStats.mostConnectedFile,
      fileTypes,
      entryPoints: graphStats.entryPoints || [],
    });
  } catch (error) {
    console.warn("⚠️ AI explanation skipped:", error.message);
    aiDescription = null;
  }

  return {
    pattern: patternResult.pattern,
    confidence: patternResult.confidence,
    layers,
    suggestions,
    fileTypes,
    aiDescription,
    counts: patternResult.counts,
  };
};