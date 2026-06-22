// @desc    Get dependency graph
// @route   GET /api/graph/:repoId
export const getDependencyGraph = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Graph controller is working.",
    data: { nodes: [], edges: [] },
  });
};