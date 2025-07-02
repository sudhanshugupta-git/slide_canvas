import express from 'express';
import { updateElement, deleteElement } from '../controllers/elementController.js';

const router = express.Router();

router.patch('/:id', updateElement);
router.delete('/:id', deleteElement);

export default router;