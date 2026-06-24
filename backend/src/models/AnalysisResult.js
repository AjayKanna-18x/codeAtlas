import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    analysisTime: {
      type: Number,
      default: 0,
    },
    deadCode: {
      unusedFiles: [String],
      isolatedNodes: [String],
      totalDeadFiles: { type: Number, default: 0 },
    },
    architectureSummary: {
      pattern: { type: String, default: null },
      description: { type: String, default: null },
      layers: [String],
      suggestions: [String],
    },
    aiProjectSummary: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);

export default AnalysisResult;