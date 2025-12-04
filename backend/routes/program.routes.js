import express from 'express';
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
} from '../controllers/program.controller.js';
import { protect, isCompanyOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getPrograms);
router.get('/:id', getProgram);
router.post('/', protect, isCompanyOrAdmin, createProgram);
router.put('/:id', protect, isCompanyOrAdmin, updateProgram);
router.delete('/:id', protect, isCompanyOrAdmin, deleteProgram);

export default router;

