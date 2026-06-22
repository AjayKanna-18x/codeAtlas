// @desc    Get AI explanation
// @route   POST /api/ai/explain
export const getAIExplanation = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI controller is working.",
    data: null,
  });
};