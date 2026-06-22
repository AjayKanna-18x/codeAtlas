import express from "express";
import { getAnalysisResult } from "../controllers/analysisController.js";

const router = express.Router();

router.get("/:repoId", getAnalysisResult);

export default router;