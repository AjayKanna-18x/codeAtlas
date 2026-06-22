// @desc    Get all repositories
// @route   GET /api/repositories
export const getAllRepositories = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Repository controller is working.",
    data: [],
  });
};

// @desc    Import a repository
// @route   POST /api/repositories/import
export const importRepository = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Import endpoint is ready.",
    data: null,
  });
};