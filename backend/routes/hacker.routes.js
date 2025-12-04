import express from 'express';
import { protect, isHacker } from '../middleware/auth.middleware.js';

const router = express.Router();

// Placeholder for hacker-specific routes
router.get('/dashboard', protect, isHacker, (req, res) => {
  res.json({ message: 'Hacker dashboard data' });
});

export default router;

