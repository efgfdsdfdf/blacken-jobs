import { Router } from 'express';
import { jobWorkerService } from '../services/job-worker.service';

const router = Router();

// Endpoint to manually trigger the background job worker
router.post('/trigger', (req, res) => {
  jobWorkerService.forceRun();
  res.json({ success: true, message: "Autonomous Job Worker triggered successfully." });
});

export default router;
