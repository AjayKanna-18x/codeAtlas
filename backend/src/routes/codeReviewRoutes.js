import express from "express";
import {
  reviewSingleFile,
  reviewFullProject,
  reviewBatchFiles,
} from "../controllers/codeReviewController.js";

const router = express.Router();

router.post("/file", reviewSingleFile);
router.post("/project", reviewFullProject);
router.post("/batch", reviewBatchFiles);

export default router;