/**
 * User routes module.
 * @module routes/user.routes
 */
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

router.get('/me', userController.getMe);
router.get('/:id', userController.getUserById);
router.patch('/profile', userController.updateProfile);
router.patch('/settings', userController.updateSettings);
router.delete('/account', userController.deleteAccount);

export default router;
