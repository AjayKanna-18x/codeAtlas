import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema(
  {
    // Basic Info
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

    // Source type - GitHub URL or Local folder
    sourceType: {
      type: String,
      enum: ["github", "local"],
      required: [true, "Source type is required"],
    },

    // GitHub URL (if sourceType is github)
    githubUrl: {
      type: String,
      trim: true,
      default: null,
    },

    // Local path where repo is stored/cloned
    localPath: {
      type: String,
      trim: true,
      default: null,
    },

    // Analysis status
    status: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },

    // Summary statistics
    stats: {
      totalFiles: { type: Number, default: 0 },
      jsFiles: { type: Number, default: 0 },
      totalDependencies: { type: Number, default: 0 },
      deadCodeFiles: { type: Number, default: 0 },
      totalLines: { type: Number, default: 0 },
    },

    // Description (AI generated)
    description: {
      type: String,
      default: null,
    },

    // Architecture pattern detected
    architecturePattern: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;