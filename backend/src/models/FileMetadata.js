import mongoose from "mongoose";

const fileMetadataSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    relativePath: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      default: ".js",
    },
    stats: {
      linesOfCode: { type: Number, default: 0 },
      functionCount: { type: Number, default: 0 },
      importCount: { type: Number, default: 0 },
      exportCount: { type: Number, default: 0 },
      fileSize: { type: Number, default: 0 },
    },
    imports: [
      {
        source: String,
        specifiers: { type: mongoose.Schema.Types.Mixed, default: [] },
        type: String,
      },
    ],
    exports: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    aiSummary: {
      type: String,
      default: null,
    },
    isDeadCode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FileMetadata = mongoose.model("FileMetadata", fileMetadataSchema);

export default FileMetadata;