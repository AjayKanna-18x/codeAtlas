import express from "express";
import {
  getAllRepositories,
  importRepository,
  validateRepo,
} from "../controllers/repositoryController.js";

const router = express.Router();

router.get("/", getAllRepositories);
router.post("/validate", validateRepo);
router.post("/import", importRepository);

export default router;