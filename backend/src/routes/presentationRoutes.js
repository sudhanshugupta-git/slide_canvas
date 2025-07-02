import express from 'express';
import {
  getPresentation,
  createPresentation,
  updatePresentation
} from '../controllers/presentationController.js';
import { addSlide } from '../controllers/slideController.js';

const router = express.Router();

router.get('/:id', getPresentation);
router.post('/', createPresentation);
router.patch('/:id', updatePresentation);
router.post('/:id/slides', addSlide);

export default router;