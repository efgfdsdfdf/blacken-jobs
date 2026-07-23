import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { globalRateLimiter } from "../middlewares/rate-limiter.middleware";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

router.post("/", globalRateLimiter, chatController.createChat);
router.get("/", chatController.getChats);
router.get("/:id", chatController.getChat);
router.post("/:id/messages", globalRateLimiter, chatController.sendMessage);

export default router;
