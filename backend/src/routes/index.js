import express from 'express';
import presentationRoutes from './presentationRoutes.js';
import slideRoutes from './slideRoutes.js';
import elementRoutes from './elementRoutes.js';
import geminiRoutes from './geminiRoutes.js';

const router = express.Router();

router.use('/presentations', presentationRoutes);
router.use('/slides', slideRoutes);
router.use('/elements', elementRoutes);
router.use('/gemini', geminiRoutes);

export default router;