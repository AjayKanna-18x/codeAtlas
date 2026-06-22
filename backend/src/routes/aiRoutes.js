import express from "express";
import { getAIExplanation } from "../controllers/aiController.js";

const router = express.Router();

router.post("/explain", getAIExplanation);

export default router;