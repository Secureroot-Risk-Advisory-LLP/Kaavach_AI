// backend/routes/notification.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getMyNotifications, markNotificationRead, markAllRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.post('/read/:id', protect, markNotificationRead);
router.post('/read-all', protect, markAllRead);

export default router;
