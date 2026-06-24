import express from "express";
import {
  getAllRepositories,
  getRepositoryById,
  importRepository,
  validateRepo,
  analyzeRepository,
  deleteRepository,
} from "../controllers/repositoryController.js";

const router = express.Router();

// ── Specific routes first — dynamic routes last ──
router.post("/validate", validateRepo);
router.post("/import", importRepository);
router.get("/", getAllRepositories);
router.get("/:id", getRepositoryById);
router.delete("/:id", deleteRepository);
router.post("/:id/analyze", analyzeRepository);

export default router;