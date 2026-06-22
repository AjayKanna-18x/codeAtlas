// Create a graph node
export const createNode = (id, label, data = {}) => {
  return { id, label, ...data };
};

// Create a graph edge
export const createEdge = (source, target) => {
  return { source, target };
};

// Build adjacency list from edges
export const buildAdjacencyList = (edges) => {
  const adj = {};
  edges.forEach(({ source, target }) => {
    if (!adj[source]) adj[source] = [];
    adj[source].push(target);
  });
  return adj;
};