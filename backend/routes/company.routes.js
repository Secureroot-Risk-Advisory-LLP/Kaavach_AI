import express from 'express';
import { protect, isCompany } from '../middleware/auth.middleware.js';

const router = express.Router();

// Placeholder for company-specific routes
router.get('/dashboard', protect, isCompany, (req, res) => {
  res.json({ message: 'Company dashboard data' });
});

export default router;

