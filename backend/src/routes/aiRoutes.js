import express from "express";
import {
  getFileSummary,
  getModuleExplanation,
  getArchitectureExplanation,
  askCodebaseQuestion,
  getProjectSummary,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/file-summary", getFileSummary);
router.post("/module-explain", getModuleExplanation);
router.post("/architecture", getArchitectureExplanation);
router.post("/question", askCodebaseQuestion);
router.post("/project-summary", getProjectSummary);

export default router;