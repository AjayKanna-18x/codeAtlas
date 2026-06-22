// @desc    Get analysis result
// @route   GET /api/analysis/:repoId
export const getAnalysisResult = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Analysis controller is working.",
    data: null,
  });
};