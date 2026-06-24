import {
  createNode,
  createEdge,
  detectFileType,
  generateGraphStats,
  findIsolatedNodes,
  findEntryPoints,
} from "../utils/graphUtils.js";
import { flattenDependencies } from "./dependencyAnalyzerService.js";

// ─── Build Complete Graph ─────────────────────────────────
export const buildGraph = (analyzedFiles, dependencyMap) => {
  console.log(`📊 Building dependency graph...`);

  // ── Build Nodes ──
  const nodes = analyzedFiles.map((file) => {
    return createNode(file.relativePath, file.fileName, {
      filePath: file.relativePath,
      fileSize: file.fileSize || 0,
      linesOfCode: file.linesOfCode || 0,
      functionCount: file.functionCount || 0,
      importCount: file.importCount || 0,
      exportCount: file.exportCount || 0,
      isDeadCode: false,
      type: detectFileType(file.relativePath),
    });
  });

  // ── Build Edges ──
  const flatEdges = flattenDependencies(dependencyMap);
  const edges = flatEdges.map((dep) =>
    createEdge(dep.source, dep.target)
  );

  // ── Generate Stats ──
  const stats = generateGraphStats(nodes, edges);

  console.log(
    `✅ Graph built: ${nodes.length} nodes, ${edges.length} edges`
  );

  return { nodes, edges, stats };
};

// ─── Convert Graph to React Flow Format ──────────────────
export const convertToReactFlowFormat = (nodes, edges) => {
  // Position nodes in a grid layout
  const cols = Math.ceil(Math.sqrt(nodes.length));

  const rfNodes = nodes.map((node, index) => ({
    id: node.id,
    type: "default",
    position: {
      x: (index % cols) * 250,
      y: Math.floor(index / cols) * 150,
    },
    data: {
      label: node.label,
      filePath: node.filePath,
      fileSize: node.fileSize,
      linesOfCode: node.linesOfCode,
      functionCount: node.functionCount,
      importCount: node.importCount,
      exportCount: node.exportCount,
      isDeadCode: node.isDeadCode,
      type: node.type,
    },
    style: {
      background: node.isDeadCode ? "#7f1d1d" : getNodeColor(node.type),
      border: `2px solid ${getNodeBorderColor(node.type)}`,
      borderRadius: "8px",
      padding: "8px",
      color: "#ffffff",
      fontSize: "11px",
      minWidth: "120px",
    },
  }));

  const rfEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    style: { stroke: "#475569", strokeWidth: 1.5 },
    markerEnd: {
      type: "arrowclosed",
      color: "#475569",
    },
  }));

  return { nodes: rfNodes, edges: rfEdges };
};

// ─── Node Color by Type ───────────────────────────────────
const getNodeColor = (type) => {
  const colors = {
    controller: "#1e3a5f",
    service: "#1a3a2a",
    model: "#3a1a1a",
    route: "#2a1a3a",
    middleware: "#3a3a1a",
    util: "#1a3a3a",
    config: "#2a2a3a",
    test: "#3a2a1a",
    unknown: "#1e293b",
  };
  return colors[type] || colors.unknown;
};

// ─── Node Border Color by Type ────────────────────────────
const getNodeBorderColor = (type) => {
  const colors = {
    controller: "#3b82f6",
    service: "#22c55e",
    model: "#ef4444",
    route: "#a855f7",
    middleware: "#eab308",
    util: "#06b6d4",
    config: "#6366f1",
    test: "#f97316",
    unknown: "#334155",
  };
  return colors[type] || colors.unknown;
};

// ─── Mark Dead Code Nodes ─────────────────────────────────
export const markDeadCodeNodes = (nodes, deadCodeFiles) => {
  return nodes.map((node) => ({
    ...node,
    isDeadCode: deadCodeFiles.includes(node.id),
    style: deadCodeFiles.includes(node.id)
      ? {
          ...node.style,
          background: "#7f1d1d",
          border: "2px solid #ef4444",
        }
      : node.style,
  }));
};