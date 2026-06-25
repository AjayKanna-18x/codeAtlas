import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "./config/env.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// ─── Route imports ────────────────────────────────────────
import repositoryRoutes from "./routes/repositoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// ─── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: "AI rate limit exceeded. Wait 1 minute.",
  },
});

app.use("/api/", limiter);
app.use("/api/ai/", aiLimiter);

// ─── General Middleware ───────────────────────────────────
app.use(compression());
app.use(cors({
  origin: [
    config.frontendUrl,
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 CodeAtlas API is Running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeAtlas Backend is healthy ✅",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: Math.round(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
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

// ─── Graceful Shutdown ────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("🔴 SIGTERM received — shutting down gracefully");
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log("═══════════════════════════════════════");
      console.log(`🚀  CodeAtlas Server Started`);
      console.log(`📡  Port      : ${config.port}`);
      console.log(`🌍  Mode      : ${config.nodeEnv}`);
      console.log(`🔗  URL       : http://localhost:${config.port}`);
      console.log(`❤️   Health   : http://localhost:${config.port}/api/health`);
      console.log(`🤖  AI        : ${config.aiProvider.toUpperCase()}`);
      console.log("═══════════════════════════════════════");
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();