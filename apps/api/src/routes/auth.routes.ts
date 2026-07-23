/**
 * Auth routes module for webhooks.
 * @module routes/auth.routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { logger } from '../config/logger';

const router = Router();
const userService = new UserService();

// Webhook endpoint to sync Supabase users to our database
router.post('/webhook/supabase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In production, we should verify a webhook secret from headers here
    const { type, record } = req.body;

    logger.info('Received Supabase webhook', { type, recordId: record?.id });

    if (type === 'INSERT' && record) {
      const email = record.email;
      const supabaseId = record.id;
      const rawMetaData = record.raw_user_meta_data || {};
      
      const firstName = rawMetaData.firstName || undefined;
      const lastName = rawMetaData.lastName || undefined;

      await userService.createUser({
        email,
        supabaseId,
        firstName,
        lastName,
      });

      logger.info('Synced new user from Supabase', { supabaseId });
    } else if (type === 'DELETE' && record) {
      // Find the user by supabaseId to delete
      const user = await userService.getUserBySupabaseId(record.id).catch(() => null);
      if (user) {
        await userService.softDeleteUser(user.id);
        logger.info('Soft deleted user from Supabase webhook', { supabaseId: record.id });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
