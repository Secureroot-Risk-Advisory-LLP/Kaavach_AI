import express from 'express';
import { getLeaderboard, getMyStats } from '../controllers/leaderboard.controller.js';
import { protect, isHacker } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/my-stats', protect, isHacker, getMyStats);

export default router;

