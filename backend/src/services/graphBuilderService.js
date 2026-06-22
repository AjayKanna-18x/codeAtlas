// ─── Graph Builder Service ────────────────────────────────
// Converts file dependencies into nodes and edges
// Full implementation → Day 38-44 (Graph Construction)

// Placeholder — graph construction coming Week 6
export const buildGraph = (dependencies) => {
  console.log(`📊 Graph builder initialized`);
  return {
    nodes: [],
    edges: [],
  };
};

export const addNode = (graph, nodeId, label) => {
  graph.nodes.push({ id: nodeId, label });
  return graph;
};

export const addEdge = (graph, source, target) => {
  graph.edges.push({ source, target });
  return graph;
};