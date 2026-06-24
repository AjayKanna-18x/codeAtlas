import express from "express";
import {
  getDependencyGraph,
  getGraphStats,
  getNodeDetails,
} from "../controllers/graphController.js";

const router = express.Router();

router.get("/:repoId", getDependencyGraph);
router.get("/:repoId/stats", getGraphStats);
router.get("/:repoId/node/:nodeId", getNodeDetails);

export default router;