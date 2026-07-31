import { Router, Request, Response, NextFunction } from 'express';
import { jobWorkerService } from '../services/job-worker.service';
import { logger } from '../config/logger';

const router = Router();

router.post('/trigger', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('🤖 Trigger Route: Manually waking up Job Worker...');
    // Trigger the background cycle asynchronously so the HTTP request returns immediately
    jobWorkerService.forceRun();
    res.status(200).json({ success: true, message: 'Job worker triggered successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
