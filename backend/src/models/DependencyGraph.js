import mongoose from "mongoose";

// Node schema (represents a file in the graph)
const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  filePath: { type: String },
  fileSize: { type: Number, default: 0 },
  linesOfCode: { type: Number, default: 0 },
  isDeadCode: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["controller", "service", "model", "util", "config", "unknown"],
    default: "unknown",
  },
});

// Edge schema (represents a dependency between files)
const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true }, // from file
  target: { type: String, required: true }, // to file
  type: {
    type: String,
    enum: ["import", "export", "dynamic"],
    default: "import",
  },
});

// Main DependencyGraph schema
const dependencyGraphSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      unique: true,
    },

    nodes: [nodeSchema],
    edges: [edgeSchema],

    // Graph statistics
    stats: {
      totalNodes: { type: Number, default: 0 },
      totalEdges: { type: Number, default: 0 },
      isolatedNodes: { type: Number, default: 0 },
      mostConnectedFile: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const DependencyGraph = mongoose.model("DependencyGraph", dependencyGraphSchema);

export default DependencyGraph;