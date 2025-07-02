import express from 'express';
import presentationRoutes from './presentationRoutes.js';
import slideRoutes from './slideRoutes.js';
import elementRoutes from './elementRoutes.js';

const router = express.Router();

router.use('/presentations', presentationRoutes);
router.use('/slides', slideRoutes);
router.use('/elements', elementRoutes);

export default router;