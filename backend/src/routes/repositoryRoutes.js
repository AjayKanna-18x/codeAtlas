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

router.get("/", getAllRepositories);
router.get("/:id", getRepositoryById);
router.delete("/:id", deleteRepository);
router.post("/validate", validateRepo);
router.post("/import", importRepository);
router.post("/:id/analyze", analyzeRepository);

export default router;