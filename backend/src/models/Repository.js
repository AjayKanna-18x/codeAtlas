import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Repository name is required"],
      trim: true,
    },
    owner: {
      type: String,
      required: [true, "Repository owner is required"],
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ["github", "local"],
      required: [true, "Source type is required"],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },
    localPath: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },
    stats: {
      totalFiles: { type: Number, default: 0 },
      jsFiles: { type: Number, default: 0 },
      totalDependencies: { type: Number, default: 0 },
      deadCodeFiles: { type: Number, default: 0 },
      totalLines: { type: Number, default: 0 },
    },
    description: {
      type: String,
      default: null,
    },
    architecturePattern: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;