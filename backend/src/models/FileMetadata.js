import mongoose from "mongoose";

const fileMetadataSchema = new mongoose.Schema(
  {
    // Which repository this file belongs to
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    // File details
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

    // Relative path from project root
    relativePath: {
      type: String,
      required: true,
    },

    // File extension
    extension: {
      type: String,
      default: ".js",
    },

    // File statistics
    stats: {
      linesOfCode: { type: Number, default: 0 },
      functionCount: { type: Number, default: 0 },
      importCount: { type: Number, default: 0 },
      exportCount: { type: Number, default: 0 },
      fileSize: { type: Number, default: 0 }, // in bytes
    },

    // Imports this file uses
    imports: [
      {
        source: String,       // import path string
        specifiers: [String], // what is imported
      },
    ],

    // Exports this file provides
    exports: [String],

    // AI generated summary
    aiSummary: {
      type: String,
      default: null,
    },

    // Is this file detected as dead code
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