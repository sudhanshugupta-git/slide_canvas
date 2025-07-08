import express from "express";
import { generateSlidesWithGemini } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/generate", generateSlidesWithGemini);

export default router;