import { Router } from 'express';
import { sendSuccess } from '../utils';

const router = Router();

/**
 * @route GET /api/health
 * @desc Check API health
 * @access Public
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  return sendSuccess(res, healthData, 'API is healthy');
});

export default router;