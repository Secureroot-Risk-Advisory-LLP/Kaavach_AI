import express from 'express';
import {
  getUsers,
  approveCompany,
  deleteUser,
  getDashboardStats
} from '../controllers/admin.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/users', protect, isAdmin, getUsers);
router.put('/users/:id/approve', protect, isAdmin, approveCompany);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/stats', protect, isAdmin, getDashboardStats);

export default router;

