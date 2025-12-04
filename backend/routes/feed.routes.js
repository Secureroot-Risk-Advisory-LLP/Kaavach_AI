import express from 'express';
import {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  deletePost
} from '../controllers/feed.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getFeed);
router.post('/', protect, createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

export default router;

