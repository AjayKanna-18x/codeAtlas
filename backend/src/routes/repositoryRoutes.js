import express from "express";
import {
  getAllRepositories,
  importRepository,
} from "../controllers/repositoryController.js";

const router = express.Router();

router.get("/", getAllRepositories);
router.post("/import", importRepository);

export default router;