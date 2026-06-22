import express from "express";
import { getDependencyGraph } from "../controllers/graphController.js";

const router = express.Router();

router.get("/:repoId", getDependencyGraph);

export default router;