/**
 * Audit routes module.
 * @module routes/audit.routes
 */
import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const auditController = new AuditController();

// All audit routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/', auditController.getLogs);
router.get('/user/:userId', auditController.getUserLogs);

export default router;
