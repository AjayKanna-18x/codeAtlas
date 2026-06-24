import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  filePath: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  linesOfCode: { type: Number, default: 0 },
  functionCount: { type: Number, default: 0 },
  importCount: { type: Number, default: 0 },
  exportCount: { type: Number, default: 0 },
  isDeadCode: { type: Boolean, default: false },
  type: {
    type: String,
    enum: [
      "controller",
      "service",
      "model",
      "route",
      "middleware",
      "util",
      "config",
      "test",
      "unknown",
    ],
    default: "unknown",
  },
});

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  type: {
    type: String,
    enum: ["import", "export", "dynamic"],
    default: "import",
  },
});

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
    stats: {
      totalNodes: { type: Number, default: 0 },
      totalEdges: { type: Number, default: 0 },
      isolatedNodes: { type: Number, default: 0 },
      mostConnectedFile: { type: String, default: null },
      mostConnectedCount: { type: Number, default: 0 },
      entryPoints: [String],
      circularDependencies: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const DependencyGraph = mongoose.model(
  "DependencyGraph",
  dependencyGraphSchema
);

export default DependencyGraph;