import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import repositoryRoutes from "./routes/repositoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// Initialize Express
const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check Route ───────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 CodeAtlas API Server is Running",
    version: "1.0.0",
    status: "healthy",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeAtlas Backend is healthy ✅",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: "connected",
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/repositories", repositoryRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ai", aiRoutes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  try {
    // ✅ Now connecting MongoDB
    await connectDB();

    app.listen(config.port, () => {
      console.log(`🚀 CodeAtlas Server Started`);
      console.log(`📡 Port     : ${config.port}`);
      console.log(`🌍 Mode     : ${config.nodeEnv}`);
      console.log(`🔗 URL      : http://localhost:${config.port}`);
      console.log(`❤️  Health  : http://localhost:${config.port}/api/health`);
      console.log("─────────────────────────────────────");
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();