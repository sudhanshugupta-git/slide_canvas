import express from 'express';
import { updateSlideByOrder, deleteSlideByOrder } from '../controllers/slideController.js';
import { addElement } from '../controllers/elementController.js';

const router = express.Router();

// router.patch('/:id', updateSlide);
router.patch('/presentation/:presentationId/order/:order', updateSlideByOrder);
// router.delete('/:id', deleteSlide);
router.delete('/presentation/:presentationId/order/:order', deleteSlideByOrder);
router.post('/:slideId/elements', addElement);

export default router;