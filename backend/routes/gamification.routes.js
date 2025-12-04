import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { recalcUserGamification } from '../controllers/gamification.controller.js';

const router = express.Router();

// admin-only batch recalc for user
router.post('/recalc/:userId', protect, authorizeRoles(['admin']), async (req, res) => {
  try {
    const user = await recalcUserGamification(req.params.userId);
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
