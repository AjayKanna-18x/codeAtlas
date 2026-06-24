import express from "express";
import {
  getAnalysisResult,
  runDeadCodeDetection,
  getAnalysisSummary,
} from "../controllers/analysisController.js";

const router = express.Router();

router.get("/:repoId", getAnalysisResult);
router.get("/:repoId/summary", getAnalysisSummary);
router.post("/:repoId/deadcode", runDeadCodeDetection);

export default router;