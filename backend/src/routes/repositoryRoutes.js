import express from "express";
import {
  getAllRepositories,
  getRepositoryById,
  importRepository,
  validateRepo,
} from "../controllers/repositoryController.js";

const router = express.Router();

router.get("/", getAllRepositories);
router.get("/:id", getRepositoryById);
router.post("/validate", validateRepo);
router.post("/import", importRepository);

export default router;