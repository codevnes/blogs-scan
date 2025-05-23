import { Router } from 'express';
import {
  getSystemStatus,
  getFailedArticles
} from '../controllers/adminController';

const router = Router();

// Admin routes
router.get('/status', getSystemStatus);
router.get('/failed-articles', getFailedArticles);

export default router; 