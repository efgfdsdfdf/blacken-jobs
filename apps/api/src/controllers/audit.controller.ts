/**
 * Audit controller module.
 * @module controllers/audit.controller
 */
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  // Not strictly requested in list but makes sense to have if we have audit routes
  // The routes list GET / and GET /user/:userId
  getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // In a real app we might query all logs if admin
      res.status(501).json({ success: false, error: { message: 'Not implemented globally' } });
    } catch (error) {
      next(error);
    }
  };

  getUserLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const logs = await this.auditService.getLogsForUser(userId, page, pageSize);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  };
}
