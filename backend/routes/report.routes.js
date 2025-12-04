import express from 'express';
import {
  submitReport,
  getMyReports,
  getCompanyReports,
  getReport,
  updateReportStatus
} from '../controllers/report.controller.js';
import { protect, isHacker, isCompanyOrAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.post('/', protect, isHacker, upload.single('file'), submitReport);
router.get('/my-reports', protect, isHacker, getMyReports);
router.get('/company-reports', protect, isCompanyOrAdmin, getCompanyReports);
router.get('/:id', protect, getReport);
router.put('/:id/status', protect, isCompanyOrAdmin, updateReportStatus);

export default router;

