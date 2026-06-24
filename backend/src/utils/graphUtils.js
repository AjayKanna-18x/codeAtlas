import { v4 as uuidv4 } from "uuid";

// ─── Create a graph node ──────────────────────────────────
export const createNode = (id, label, data = {}) => {
  return {
    id,
    label,
    filePath: data.filePath || "",
    fileSize: data.fileSize || 0,
    linesOfCode: data.linesOfCode || 0,
    functionCount: data.functionCount || 0,
    importCount: data.importCount || 0,
    exportCount: data.exportCount || 0,
    isDeadCode: data.isDeadCode || false,
    type: data.type || "unknown",
  };
};

// ─── Create a graph edge ──────────────────────────────────
export const createEdge = (source, target) => {
  return {
    id: `${source}->${target}`,
    source,
    target,
    type: "import",
  };
};

// ─── Detect file type from path ───────────────────────────
export const detectFileType = (filePath) => {
  const lower = filePath.toLowerCase();
  if (lower.includes("controller")) return "controller";
  if (lower.includes("service")) return "service";
  if (lower.includes("model")) return "model";
  if (lower.includes("route")) return "route";
  if (lower.includes("middleware")) return "middleware";
  if (lower.includes("util") || lower.includes("helper")) return "util";
  if (lower.includes("config")) return "config";
  if (lower.includes("test") || lower.includes("spec")) return "test";
  return "unknown";
};

// ─── Build adjacency list ─────────────────────────────────
export const buildAdjacencyList = (edges) => {
  const adj = {};
  edges.forEach(({ source, target }) => {
    if (!adj[source]) adj[source] = [];
    if (!adj[source].includes(target)) {
      adj[source].push(target);
    }
  });
  return adj;
};

// ─── Build reverse adjacency list ────────────────────────
export const buildReverseAdjacencyList = (edges) => {
  const radj = {};
  edges.forEach(({ source, target }) => {
    if (!radj[target]) radj[target] = [];
    if (!radj[target].includes(source)) {
      radj[target].push(source);
    }
  });
  return radj;
};

// ─── Find isolated nodes (no connections) ────────────────
export const findIsolatedNodes = (nodes, edges) => {
  const connected = new Set();
  edges.forEach(({ source, target }) => {
    connected.add(source);
    connected.add(target);
  });
  return nodes.filter((node) => !connected.has(node.id));
};

// ─── Find most connected node ─────────────────────────────
export const findMostConnectedNode = (edges) => {
  const connectionCount = {};

  edges.forEach(({ source, target }) => {
    connectionCount[source] = (connectionCount[source] || 0) + 1;
    connectionCount[target] = (connectionCount[target] || 0) + 1;
  });

  let maxNode = null;
  let maxCount = 0;

  Object.entries(connectionCount).forEach(([node, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxNode = node;
    }
  });

  return { node: maxNode, connections: maxCount };
};

// ─── BFS traversal ───────────────────────────────────────
export const bfsTraversal = (startNode, adjacencyList) => {
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = adjacencyList[current] || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited;
};

// ─── Find entry points ────────────────────────────────────
export const findEntryPoints = (nodes, edges) => {
  const hasIncoming = new Set(edges.map((e) => e.target));
  return nodes.filter((node) => !hasIncoming.has(node.id));
};

// ─── Detect circular dependencies ────────────────────────
export const detectCircularDependencies = (edges) => {
  const adj = buildAdjacencyList(edges);
  const circular = [];
  const visited = new Set();
  const recursionStack = new Set();

  const dfs = (node, path) => {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adj[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path, neighbor]);
      } else if (recursionStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          circular.push(path.slice(cycleStart));
        }
      }
    }

    recursionStack.delete(node);
  };

  Object.keys(adj).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node, [node]);
    }
  });

  return circular;
};

// ─── Generate graph statistics ────────────────────────────
export const generateGraphStats = (nodes, edges) => {
  const isolated = findIsolatedNodes(nodes, edges);
  const mostConnected = findMostConnectedNode(edges);
  const entryPoints = findEntryPoints(nodes, edges);
  const circular = detectCircularDependencies(edges);

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    isolatedNodes: isolated.length,
    mostConnectedFile: mostConnected.node,
    mostConnectedCount: mostConnected.connections,
    entryPoints: entryPoints.map((n) => n.id),
    circularDependencies: circular.length,
  };
};