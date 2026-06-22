import express from "express";
import { getFilesByRepo } from "../controllers/fileController.js";

const router = express.Router();

router.get("/:repoId", getFilesByRepo);

export default router;