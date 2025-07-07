import express from "express";
import {
  getPresentation,
  createPresentation,
  updatePresentation,
  deletePresentation
} from "../controllers/presentationController.js";
import { addSlide } from "../controllers/slideController.js";

const router = express.Router();

router.get("/", getPresentation);
router.post("/", createPresentation);
router.patch("/:id", updatePresentation);
router.post("/:id/slides", addSlide);
router.delete("/:id", deletePresentation);

export default router;
