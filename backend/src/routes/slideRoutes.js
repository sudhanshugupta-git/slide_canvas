import express from 'express';
import { updateSlideByOrder, deleteSlideByOrder, getSlides, updateSlide, getFirstSlide } from '../controllers/slideController.js';
import { addElement } from '../controllers/elementController.js';

const router = express.Router();

// GET: Retrieve slides of a presentation
router.get('/presentation/:presentation_id', getSlides);

router.get('/presentation/:presentation_id/first', getFirstSlide);

// POST: Add an element to a specific slide
router.post('/:slideId/elements', addElement);

// PATCH: Update slide by presentation ID
// router.patch('/presentation/:presentation_id', updateSlide);

// PATCH: Update slide by order within a presentation
router.patch('/presentation/:presentationId/order/:order', updateSlideByOrder);

// DELETE: Delete slide by order within a presentation
router.delete('/presentation/:presentationId/order/:order', deleteSlideByOrder);


export default router;