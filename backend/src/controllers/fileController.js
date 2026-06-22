// @desc    Get files for a repository
// @route   GET /api/files/:repoId
export const getFilesByRepo = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "File controller is working.",
    data: [],
  });
};