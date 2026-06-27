import express from "express";
import {
  getTimeline,
  getStats,
  getFileHistoryRoute,
} from "../controllers/evolutionController.js";

const router = express.Router();

router.get("/:repoId/timeline", getTimeline);
router.get("/:repoId/stats", getStats);
router.post("/:repoId/file-history", getFileHistoryRoute);

export default router;